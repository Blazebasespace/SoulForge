import { ChatMessage, ChatResponse } from '../types/Agent';
import { AkashChatService } from './AkashChatService';
import { PinataService } from './PinataService';
import { AgentService } from './AgentService';

export class ChatService {
  static async getChatHistory(agentId: string): Promise<ChatMessage[]> {
    // Try to load from IPFS first, fallback to localStorage
    try {
      const history = await PinataService.getChatHistory(agentId);
      if (history) return history;
    } catch (error) {
      console.warn('Failed to load chat history from IPFS:', error);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(`soulforge_chat_${agentId}`);
    return stored ? JSON.parse(stored) : [];
  }

  static async sendMessage(agentId: string, message: string): Promise<ChatResponse> {
    // Get agent context
    const agent = await AgentService.getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get chat history for context
    const history = await this.getChatHistory(agentId);
    
    // Send to Akash Chat API
    const response = await AkashChatService.sendMessage(agent, message, history);
    
    // Store the conversation
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    const agentMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: response.content,
      sender: 'agent',
      timestamp: new Date(),
      emotion: response.emotion
    };
    
    const updatedHistory = [...history, userMessage, agentMessage];
    
    // Store locally
    localStorage.setItem(`soulforge_chat_${agentId}`, JSON.stringify(updatedHistory));
    
    // Store on IPFS asynchronously
    PinataService.storeChatHistory(agentId, updatedHistory).catch(error => {
      console.warn('Failed to store chat history on IPFS:', error);
    });
    
    return response;
  }
}