import { AkashChatService } from './AkashChatService';
import { AgentService } from './AgentService';
import { v4 as uuidv4 } from 'uuid';

interface GeneratedProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  fileStructure: string;
  sourceCode: string;
  previewImage?: string;
  ipfsHash?: string;
  price: number;
}

interface GeneratedAgent {
  id: string;
  name: string;
  description: string;
  personality: string;
  role: string;
  backstory: string;
  tone: string;
  values: string[];
  customPrompt: string;
  type: 'custom';
  price: number;
}

export class AutoBuilderService {
  private static readonly PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  private static readonly PINATA_BASE_URL = import.meta.env.DEV 
    ? '/pinata-api' 
    : 'https://api.pinata.cloud';

  static async generateProject(prompt: string): Promise<GeneratedProject> {
    // Simulate project generation using Akash Chat API
    const generationPrompt = `You are an expert full-stack developer. Based on this request: "${prompt}"

Generate a complete project specification with:
1. Project name and description
2. Technology stack
3. File structure
4. Brief explanation of key features

Respond in JSON format with these fields:
- name: project name
- description: brief description
- technologies: array of tech stack items
- features: array of key features
- fileStructure: text representation of folder structure

Keep it realistic and production-ready.`;

    try {
      // Create a mock agent for AutoBuilder
      const autoBuilderAgent = {
        id: 'autobuilder',
        name: 'AutoBuilder',
        type: 'custom' as const,
        description: 'AI that generates full-stack applications',
        personality: 'Expert developer, detail-oriented, practical',
        role: 'Senior Full-Stack Developer',
        backstory: 'Experienced in modern web technologies',
        tone: 'professional',
        values: ['quality', 'efficiency', 'best-practices'],
        customPrompt: 'Generate clean, production-ready code with proper architecture.',
        isPublic: false,
        rating: 5.0,
        chatCount: 0,
        lastActive: 'now',
        price: 0,
        createdAt: new Date()
      };

      const response = await AkashChatService.sendMessage(autoBuilderAgent, generationPrompt, []);
      
      // Parse the response (in a real app, you'd have more sophisticated parsing)
      let projectData;
      try {
        projectData = JSON.parse(response.content);
      } catch {
        // Fallback if JSON parsing fails
        projectData = {
          name: this.extractProjectName(prompt),
          description: 'Full-stack application generated from your requirements',
          technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'TypeScript'],
          features: ['User Authentication', 'Dashboard', 'API Integration', 'Responsive Design'],
          fileStructure: this.generateDefaultFileStructure()
        };
      }

      const project: GeneratedProject = {
        id: uuidv4(),
        name: projectData.name || this.extractProjectName(prompt),
        description: projectData.description || 'Custom application built to your specifications',
        technologies: projectData.technologies || ['React', 'Node.js', 'Express'],
        fileStructure: projectData.fileStructure || this.generateDefaultFileStructure(),
        sourceCode: this.generateSourceCode(projectData),
        price: 0.25
      };

      // Store on IPFS
      try {
        const ipfsHash = await this.storeProjectOnIPFS(project);
        project.ipfsHash = ipfsHash;
      } catch (error) {
        console.error('Failed to store project on IPFS:', error);
        project.ipfsHash = 'local-storage-only';
      }

      return project;
    } catch (error) {
      console.error('Failed to generate project:', error);
      
      // Return a fallback project instead of throwing
      const fallbackProject: GeneratedProject = {
        id: uuidv4(),
        name: this.extractProjectName(prompt),
        description: 'A custom application built to your specifications. Generated with fallback data due to API limitations.',
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
        fileStructure: this.generateDefaultFileStructure(),
        sourceCode: this.generateSourceCode({
          name: this.extractProjectName(prompt),
          description: 'Custom application',
          technologies: ['React', 'TypeScript', 'Node.js']
        }),
        price: 0.25,
        ipfsHash: 'local-storage-only'
      };

      return fallbackProject;
    }
  }

  static async generateAgent(prompt: string): Promise<GeneratedAgent> {
    const agentPrompt = `You are an expert AI agent designer. Based on this request: "${prompt}"

Create a detailed AI agent specification with:
1. Agent name and role
2. Personality traits and characteristics
3. Backstory and background
4. Communication tone and style
5. Core values and principles
6. Special instructions for behavior

Respond in JSON format with these fields:
- name: agent name
- role: professional role or title
- description: brief description of the agent
- personality: detailed personality traits
- backstory: background and history
- tone: communication style (friendly, professional, casual, etc.)
- values: array of core values
- customPrompt: special instructions for the agent's behavior

Make the agent unique and engaging.`;

    try {
      const autoBuilderAgent = {
        id: 'agent-builder',
        name: 'AgentBuilder',
        type: 'custom' as const,
        description: 'AI that creates unique AI agent personalities',
        personality: 'Creative, insightful, understanding of human psychology',
        role: 'AI Personality Designer',
        backstory: 'Expert in psychology and AI behavior design',
        tone: 'creative',
        values: ['creativity', 'empathy', 'uniqueness'],
        customPrompt: 'Create compelling and unique AI personalities with depth.',
        isPublic: false,
        rating: 5.0,
        chatCount: 0,
        lastActive: 'now',
        price: 0,
        createdAt: new Date()
      };

      const response = await AkashChatService.sendMessage(autoBuilderAgent, agentPrompt, []);
      
      let agentData;
      try {
        agentData = JSON.parse(response.content);
      } catch {
        // Fallback if JSON parsing fails
        agentData = {
          name: this.extractAgentName(prompt),
          role: 'AI Assistant',
          description: 'A helpful AI agent created from your specifications',
          personality: 'Helpful, knowledgeable, and engaging',
          backstory: 'Designed to assist users with various tasks',
          tone: 'friendly',
          values: ['helpfulness', 'accuracy', 'respect'],
          customPrompt: 'Be helpful and engaging while staying true to your personality.'
        };
      }

      const agent: GeneratedAgent = {
        id: uuidv4(),
        name: agentData.name || this.extractAgentName(prompt),
        description: agentData.description || 'AI agent created from your specifications',
        personality: agentData.personality || 'Helpful and engaging',
        role: agentData.role || 'AI Assistant',
        backstory: agentData.backstory || 'Created to help users',
        tone: agentData.tone || 'friendly',
        values: agentData.values || ['helpfulness', 'respect'],
        customPrompt: agentData.customPrompt || 'Be helpful and stay in character.',
        type: 'custom',
        price: 0.99
      };

      return agent;
    } catch (error) {
      console.error('Failed to generate agent:', error);
      
      // Return fallback agent
      return {
        id: uuidv4(),
        name: this.extractAgentName(prompt),
        description: 'AI agent created from your specifications',
        personality: 'Helpful, knowledgeable, and engaging',
        role: 'AI Assistant',
        backstory: 'Designed to assist users with various tasks',
        tone: 'friendly',
        values: ['helpfulness', 'accuracy', 'respect'],
        customPrompt: 'Be helpful and engaging while staying true to your personality.',
        type: 'custom',
        price: 0.99
      };
    }
  }

  static async downloadProject(projectId: string): Promise<void> {
    // Get project from storage
    const storedProjects = JSON.parse(localStorage.getItem('soulforge_projects') || '[]');
    const project = storedProjects.find((p: GeneratedProject) => p.id === projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Create and download zip file (simulated)
    const blob = new Blob([project.sourceCode], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async createAgentFromGenerated(generatedAgent: GeneratedAgent): Promise<void> {
    // Create the agent using AgentService
    const agentRequest = {
      name: generatedAgent.name,
      type: 'custom' as const,
      description: generatedAgent.description,
      personality: generatedAgent.personality,
      role: generatedAgent.role,
      backstory: generatedAgent.backstory,
      tone: generatedAgent.tone,
      values: generatedAgent.values,
      customPrompt: generatedAgent.customPrompt,
      isPublic: true
    };

    const agent = await AgentService.createAgent(agentRequest);
    console.log('Agent created successfully:', agent.id);
  }

  private static extractProjectName(prompt: string): string {
    const words = prompt.toLowerCase().split(' ');
    const keywords = ['app', 'platform', 'dashboard', 'saas', 'website', 'system'];
    
    for (const keyword of keywords) {
      const index = words.indexOf(keyword);
      if (index > 0) {
        return words.slice(Math.max(0, index - 2), index + 1).join(' ');
      }
    }
    
    return 'Custom Application';
  }

  private static extractAgentName(prompt: string): string {
    const words = prompt.toLowerCase().split(' ');
    const keywords = ['agent', 'bot', 'assistant', 'coach', 'advisor', 'helper'];
    
    for (const keyword of keywords) {
      const index = words.indexOf(keyword);
      if (index > 0) {
        return words.slice(Math.max(0, index - 1), index + 1).join(' ');
      }
    }
    
    return 'Custom Agent';
  }

  private static generateDefaultFileStructure(): string {
    return `
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── database/
│   ├── migrations/
│   └── seeds/
├── docker-compose.yml
├── README.md
└── .env.example
    `.trim();
  }

  private static generateSourceCode(projectData: any): string {
    return `// Generated project: ${projectData.name}
// Description: ${projectData.description}
// Technologies: ${projectData.technologies?.join(', ') || 'React, Node.js'}

// This would contain the actual generated source code files
// packaged as a ZIP archive in a real implementation

console.log('Project generated successfully!');

// Example package.json
{
  "name": "${projectData.name?.toLowerCase().replace(/\s+/g, '-') || 'custom-app'}",
  "version": "1.0.0",
  "description": "${projectData.description || 'Custom application'}",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "express": "^4.18.2",
    "typescript": "^5.0.0"
  }
}

// Example React component
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center py-16">
        Welcome to ${projectData.name || 'Your Custom App'}
      </h1>
      <p className="text-center text-gray-600">
        ${projectData.description || 'Built with modern web technologies'}
      </p>
    </div>
  );
}

export default App;
`;
  }

  private static async storeProjectOnIPFS(project: GeneratedProject): Promise<string> {
    if (!this.PINATA_JWT) {
      console.warn('Pinata JWT not configured, storing locally only');
      return 'local-storage-only';
    }

    const projectData = {
      ...project,
      timestamp: new Date().toISOString(),
      type: 'soulforge_project'
    };

    try {
      const response = await fetch(`${this.PINATA_BASE_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.PINATA_JWT}`
        },
        body: JSON.stringify({
          pinataContent: projectData,
          pinataMetadata: {
            name: `SoulForge-Project-${project.name}-${project.id}`,
            keyvalues: {
              project_id: project.id,
              project_name: project.name,
              price: project.price.toString()
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to store project on IPFS: ${response.status}`);
      }

      const data = await response.json();
      
      // Store locally as well
      const storedProjects = JSON.parse(localStorage.getItem('soulforge_projects') || '[]');
      storedProjects.push(project);
      localStorage.setItem('soulforge_projects', JSON.stringify(storedProjects));
      
      return data.IpfsHash;
    } catch (error) {
      console.warn('Failed to store project on IPFS:', error);
      
      // Store locally as fallback
      const storedProjects = JSON.parse(localStorage.getItem('soulforge_projects') || '[]');
      storedProjects.push(project);
      localStorage.setItem('soulforge_projects', JSON.stringify(storedProjects));
      
      return 'local-storage-only';
    }
  }
}