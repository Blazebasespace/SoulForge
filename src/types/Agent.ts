export interface Agent {
  id: string;
  name: string;
  type: 'mirror' | 'custom';
  description: string;
  personality: string;
  role: string;
  backstory: string;
  tone: string;
  values: string[];
  customPrompt: string;
  isPublic: boolean;
  rating: number;
  chatCount: number;
  lastActive: string;
  price: number;
  createdAt: Date;
  ipfsHash?: string;
}

export interface CreateAgentRequest {
  name: string;
  type: 'mirror' | 'custom';
  description: string;
  personality: string;
  role: string;
  backstory: string;
  tone: string;
  values: string[];
  customPrompt: string;
  isPublic: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  emotion?: string;
}

export interface ChatResponse {
  content: string;
  emotion?: string;
  memoryUpdated: boolean;
}