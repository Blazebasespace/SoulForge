import { Agent, ChatMessage } from '../types/Agent';

export class PinataService {
  private static readonly API_KEY = import.meta.env.VITE_PINATA_API_KEY;
  private static readonly API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
  private static readonly JWT = import.meta.env.VITE_PINATA_JWT;
  private static readonly BASE_URL = import.meta.env.DEV 
    ? '/pinata-api' 
    : 'https://api.pinata.cloud';

  static async pinAgent(agent: Agent): Promise<string> {
    if (!this.JWT) {
      console.warn('Pinata JWT not configured, skipping IPFS storage');
      return 'local-storage-only';
    }

    const agentData = {
      ...agent,
      timestamp: new Date().toISOString(),
      type: 'soulforge_agent'
    };

    try {
      const response = await fetch(`${this.BASE_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.JWT}`
        },
        body: JSON.stringify({
          pinataContent: agentData,
          pinataMetadata: {
            name: `SoulForge-Agent-${agent.name}-${agent.id}`,
            keyvalues: {
              agent_id: agent.id,
              agent_type: agent.type,
              agent_name: agent.name
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.warn('Failed to store agent on IPFS:', error);
      return 'local-storage-only';
    }
  }

  static async storeChatHistory(agentId: string, history: ChatMessage[]): Promise<string> {
    if (!this.JWT) {
      console.warn('Pinata JWT not configured, skipping IPFS storage');
      return 'local-storage-only';
    }

    const chatData = {
      agentId,
      history,
      timestamp: new Date().toISOString(),
      type: 'soulforge_chat_history'
    };

    try {
      const response = await fetch(`${this.BASE_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.JWT}`
        },
        body: JSON.stringify({
          pinataContent: chatData,
          pinataMetadata: {
            name: `SoulForge-Chat-${agentId}-${Date.now()}`,
            keyvalues: {
              agent_id: agentId,
              message_count: history.length.toString()
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store the latest hash for this agent
      localStorage.setItem(`soulforge_ipfs_chat_${agentId}`, data.IpfsHash);
      
      return data.IpfsHash;
    } catch (error) {
      console.warn('Failed to store chat history on IPFS:', error);
      return 'local-storage-only';
    }
  }

  static async getChatHistory(agentId: string): Promise<ChatMessage[] | null> {
    const ipfsHash = localStorage.getItem(`soulforge_ipfs_chat_${agentId}`);
    if (!ipfsHash || ipfsHash === 'local-storage-only') return null;

    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.history || null;
    } catch (error) {
      console.error('Failed to fetch from IPFS:', error);
      return null;
    }
  }

  static async getAgent(ipfsHash: string): Promise<Agent | null> {
    if (!ipfsHash || ipfsHash === 'local-storage-only') return null;

    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch agent from IPFS:', error);
      return null;
    }
  }
}