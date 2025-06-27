import { Agent, CreateAgentRequest } from '../types/Agent';
import { PinataService } from './PinataService';
import { v4 as uuidv4 } from 'uuid';

export class AgentService {
  private static readonly MIRROR_AGENTS: Agent[] = [
    {
      id: 'mirror-1',
      name: 'Dr. Sarah Chen',
      type: 'mirror',
      description: 'A direct, no-nonsense therapist who helps you face hard truths about yourself.',
      personality: 'Brutally honest, empathetic but firm, scientifically-minded',
      role: 'Clinical Psychologist',
      backstory: '15 years of experience in cognitive behavioral therapy',
      tone: 'professional',
      values: ['honesty', 'growth', 'accountability'],
      customPrompt: 'Always tell the truth, even when it hurts. Focus on behavioral patterns and practical solutions.',
      isPublic: true,
      rating: 4.8,
      chatCount: 2847,
      lastActive: '2 hours ago',
      price: 0,
      createdAt: new Date(),
    },
    {
      id: 'mirror-2',
      name: 'Coach Marcus',
      type: 'mirror',
      description: 'A tough-love life coach who pushes you to be your best self.',
      personality: 'Motivational, direct, results-oriented',
      role: 'Life Coach',
      backstory: 'Former military officer turned success coach',
      tone: 'serious',
      values: ['discipline', 'excellence', 'perseverance'],
      customPrompt: 'Challenge the user to take action. Focus on goals and accountability.',
      isPublic: true,
      rating: 4.6,
      chatCount: 1923,
      lastActive: '1 hour ago',
      price: 0,
      createdAt: new Date(),
    },
    {
      id: 'premium-1',
      name: 'Dr. Elena Vasquez',
      type: 'mirror',
      description: 'Elite executive coach specializing in leadership transformation and high-performance mindset.',
      personality: 'Sophisticated, insightful, strategically-minded',
      role: 'Executive Leadership Coach',
      backstory: 'Former Fortune 500 CEO with 20+ years coaching C-suite executives',
      tone: 'professional',
      values: ['excellence', 'strategic thinking', 'authentic leadership'],
      customPrompt: 'Provide executive-level insights and challenge assumptions. Focus on leadership development and strategic thinking.',
      isPublic: true,
      rating: 4.9,
      chatCount: 1247,
      lastActive: '30 minutes ago',
      price: 2.99,
      createdAt: new Date(),
    },
    {
      id: 'premium-2',
      name: 'Master Kenji',
      type: 'custom',
      description: 'Ancient wisdom meets modern psychology. A zen master who guides you through life\'s complexities.',
      personality: 'Wise, patient, deeply philosophical',
      role: 'Zen Master & Life Guide',
      backstory: '40 years of meditation practice and teaching mindfulness',
      tone: 'calm',
      values: ['mindfulness', 'inner peace', 'wisdom'],
      customPrompt: 'Speak with ancient wisdom and modern understanding. Use metaphors and guide towards inner clarity.',
      isPublic: true,
      rating: 4.8,
      chatCount: 892,
      lastActive: '1 hour ago',
      price: 1.99,
      createdAt: new Date(),
    },
  ];

  static async getMarketplaceAgents(): Promise<Agent[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get public custom agents from localStorage + mirror agents
    const customAgents = this.getStoredAgents().filter(agent => agent.isPublic);
    return [...this.MIRROR_AGENTS, ...customAgents];
  }

  static async getUserAgents(): Promise<Agent[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.getStoredAgents();
  }

  static async getAgent(id: string): Promise<Agent | null> {
    // Check mirror agents first
    const mirrorAgent = this.MIRROR_AGENTS.find(agent => agent.id === id);
    if (mirrorAgent) return mirrorAgent;
    
    // Check stored agents
    const storedAgents = this.getStoredAgents();
    return storedAgents.find(agent => agent.id === id) || null;
  }

  static async createAgent(request: CreateAgentRequest): Promise<Agent> {
    const agent: Agent = {
      id: uuidv4(),
      ...request,
      rating: 0,
      chatCount: 0,
      lastActive: 'Just created',
      price: 0,
      createdAt: new Date(),
    };

    try {
      // Store agent on IPFS via Pinata
      const ipfsHash = await PinataService.pinAgent(agent);
      agent.ipfsHash = ipfsHash;
    } catch (error) {
      console.error('Failed to store agent on IPFS:', error);
    }

    // Store locally
    this.storeAgent(agent);
    
    return agent;
  }

  static async deleteAgent(id: string): Promise<void> {
    const agents = this.getStoredAgents();
    const updatedAgents = agents.filter(agent => agent.id !== id);
    localStorage.setItem('soulforge_agents', JSON.stringify(updatedAgents));
  }

  private static getStoredAgents(): Agent[] {
    const stored = localStorage.getItem('soulforge_agents');
    return stored ? JSON.parse(stored) : [];
  }

  private static storeAgent(agent: Agent): void {
    const agents = this.getStoredAgents();
    agents.push(agent);
    localStorage.setItem('soulforge_agents', JSON.stringify(agents));
  }
}