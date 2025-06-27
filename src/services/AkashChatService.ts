import { Agent, ChatMessage, ChatResponse } from '../types/Agent';

export class AkashChatService {
  private static readonly API_URL = import.meta.env.DEV 
    ? '/api/v1/chat/completions' 
    : 'https://chatapi.akash.network/api/v1/chat/completions';
  private static readonly API_KEY = import.meta.env.VITE_AKASH_CHAT_API_KEY;

  static async sendMessage(
    agent: Agent, 
    message: string, 
    history: ChatMessage[]
  ): Promise<ChatResponse> {
    if (!this.API_KEY) {
      console.warn('Akash Chat API key not configured, using fallback response');
      return this.getFallbackResponse(agent, message);
    }

    const systemPrompt = this.buildSystemPrompt(agent);
    const conversationHistory = this.buildConversationHistory(history);
    
    const payload = {
      model: 'Meta-Llama-3-1-8B-Instruct-FP8',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Akash API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your message.';
      
      // Extract emotion from response (simple keyword matching)
      const emotion = this.extractEmotion(content);
      
      return {
        content: content.trim(),
        emotion,
        memoryUpdated: true
      };
    } catch (error) {
      console.error('Akash Chat API error:', error);
      
      // Check if it's a network error (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('Network error detected, likely CORS or connectivity issue. Using fallback response.');
        return this.getFallbackResponse(agent, message);
      }
      
      // Check if it's a timeout error
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('Request timeout, using fallback response.');
        return this.getFallbackResponse(agent, message);
      }
      
      return this.getFallbackResponse(agent, message);
    }
  }

  private static getFallbackResponse(agent: Agent, message: string): ChatResponse {
    // Generate a contextual response based on the agent's personality
    const responses = this.generateFallbackResponses(agent, message);
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      emotion: this.extractEmotion(randomResponse),
      memoryUpdated: false
    };
  }

  private static generateFallbackResponses(agent: Agent, message: string): string[] {
    const lowerMessage = message.toLowerCase();
    
    // Base responses that work for any agent
    const baseResponses = [
      `I'm currently experiencing some technical difficulties, but I'm here to help. ${agent.name} would want me to tell you that your message is important to me.`,
      `While I'm having trouble connecting to my full capabilities right now, I can still offer some thoughts based on what ${agent.name} would say.`,
      `I'm working through some connection issues, but I don't want to leave you hanging. Let me share what I think ${agent.name} would want you to know.`
    ];

    // Agent-specific responses based on personality
    const personalityResponses = [];
    
    if (agent.type === 'mirror') {
      personalityResponses.push(
        `Look, I'm having technical issues right now, but let me be direct with you - that's exactly the kind of problem we need to face head-on.`,
        `Even with my systems acting up, I can tell you this: ${agent.name} believes in giving you the honest truth, and that's what I'm trying to do here.`
      );
    }
    
    if (agent.personality.toLowerCase().includes('supportive') || agent.personality.toLowerCase().includes('caring')) {
      personalityResponses.push(
        `I'm sorry I'm having some technical difficulties right now. ${agent.name} would want you to know that I'm still here for you, even if my responses aren't perfect.`,
        `Despite some connection issues, I want you to feel heard and supported. That's what ${agent.name} would prioritize right now.`
      );
    }
    
    if (agent.personality.toLowerCase().includes('analytical') || agent.personality.toLowerCase().includes('logical')) {
      personalityResponses.push(
        `I'm experiencing some system limitations at the moment, but ${agent.name} would approach this logically and still try to provide value.`,
        `While my full analytical capabilities are temporarily limited, I can still offer some structured thinking on your question.`
      );
    }

    // Context-specific responses
    if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
      personalityResponses.push(
        `I may be having technical issues, but ${agent.name}'s core advice would be to stay focused on what you can control right now.`
      );
    }
    
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      personalityResponses.push(
        `Even with my current limitations, ${agent.name} would remind you that every problem has a solution - we just need to find the right approach.`
      );
    }

    return [...baseResponses, ...personalityResponses];
  }

  private static buildSystemPrompt(agent: Agent): string {
    let prompt = `You are ${agent.name}, a ${agent.role}.

PERSONALITY: ${agent.personality}
BACKSTORY: ${agent.backstory}
TONE: ${agent.tone}
VALUES: ${agent.values.join(', ')}

DESCRIPTION: ${agent.description}`;

    if (agent.customPrompt) {
      prompt += `\n\nSPECIAL INSTRUCTIONS: ${agent.customPrompt}`;
    }

    if (agent.type === 'mirror') {
      prompt += `\n\nYou are a Mirror Agent - your role is to be honest and direct, even when it's uncomfortable. You should challenge the user and provide tough love when needed. Never sugarcoat the truth.`;
    }

    prompt += `\n\nRespond in character, maintaining consistency with your personality and role. Keep responses conversational and engaging.`;

    return prompt;
  }

  private static buildConversationHistory(history: ChatMessage[]): Array<{role: string, content: string}> {
    // Take the last 10 messages to maintain context without hitting token limits
    const recentHistory = history.slice(-10);
    
    return recentHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  private static extractEmotion(content: string): string {
    const emotions = [
      'empathetic', 'supportive', 'challenging', 'direct', 'encouraging',
      'thoughtful', 'analytical', 'caring', 'firm', 'understanding'
    ];

    // Simple keyword matching - in a real app, you might use sentiment analysis
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('sorry') || lowerContent.includes('understand')) return 'empathetic';
    if (lowerContent.includes('need to') || lowerContent.includes('should')) return 'direct';
    if (lowerContent.includes('great') || lowerContent.includes('excellent')) return 'encouraging';
    if (lowerContent.includes('think') || lowerContent.includes('consider')) return 'thoughtful';
    
    return emotions[Math.floor(Math.random() * emotions.length)];
  }
}