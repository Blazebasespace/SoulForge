import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Shield, Sparkles, Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { AgentService } from '../services/AgentService';
import { CreateAgentRequest } from '../types/Agent';

const CreateAgent = () => {
  const [step, setStep] = useState(1);
  const [agentType, setAgentType] = useState<'mirror' | 'custom' | null>(null);
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    type: 'custom',
    description: '',
    personality: '',
    role: '',
    backstory: '',
    tone: 'friendly',
    values: [],
    customPrompt: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof CreateAgentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAgent = async () => {
    if (!agentType) return;
    
    setLoading(true);
    try {
      const agent = await AgentService.createAgent({
        ...formData,
        type: agentType
      });
      
      // Redirect to chat with new agent
      window.location.href = `/chat/${agent.id}`;
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const AgentTypeCard = ({ 
    type, 
    icon: Icon, 
    title, 
    description, 
    features,
    gradient 
  }: {
    type: 'mirror' | 'custom';
    icon: any;
    title: string;
    description: string;
    features: string[];
    gradient: string;
  }) => (
    <motion.div
      className={`p-6 rounded-2xl backdrop-blur-md border-2 cursor-pointer transition-all ${
        agentType === type
          ? 'bg-purple-500/20 border-purple-500'
          : 'bg-white/5 border-white/10 hover:border-purple-500/30'
      }`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setAgentType(type)}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} p-4 mb-4 mx-auto`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 text-center">{title}</h3>
      <p className="text-gray-300 mb-4 text-center">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 text-center">Create Your AI Agent</h1>
          <p className="text-xl text-gray-300 mb-12 text-center">Choose the type of agent you want to create</p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <AgentTypeCard
              type="mirror"
              icon={Shield}
              title="Mirror Agent"
              description="Honest, therapeutic agents with fixed personalities"
              features={[
                "Uneditable, stable personality",
                "Therapeutic and coaching focus",
                "Always honest feedback",
                "Professional therapeutic roles"
              ]}
              gradient="from-red-500 to-orange-500"
            />
            
            <AgentTypeCard
              type="custom"
              icon={Bot}
              title="Custom Soul Agent"
              description="Fully customizable AI personas with unique personalities"
              features={[
                "Complete personality customization",
                "Custom backstory and values",
                "Flexible tone and behavior",
                "Any role or purpose"
              ]}
              gradient="from-purple-500 to-pink-500"
            />
          </div>

          <div className="text-center">
            <motion.button
              className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 mx-auto transition-all ${
                agentType
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!agentType}
              onClick={() => agentType && setStep(2)}
              whileHover={agentType ? { scale: 1.05 } : {}}
              whileTap={agentType ? { scale: 0.95 } : {}}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setStep(1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">
            {agentType === 'mirror' ? 'Create Mirror Agent' : 'Create Custom Soul Agent'}
          </h1>
          <div></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                placeholder="Enter agent name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Life Coach, Therapist, Mentor..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Describe your agent's purpose and personality..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="playful">Playful</option>
                <option value="serious">Serious</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Personality Traits</label>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Describe key personality traits..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Backstory</label>
              <textarea
                value={formData.backstory}
                onChange={(e) => handleInputChange('backstory', e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Agent's background and history..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom Instructions</label>
              <textarea
                value={formData.customPrompt}
                onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="Special instructions or behaviors..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-white/5 border-white/10 rounded focus:ring-purple-500"
              />
              <label htmlFor="isPublic" className="text-gray-300">
                Make agent publicly available in marketplace
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <motion.button
            className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 mx-auto transition-all ${
              formData.name && formData.role
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!formData.name || !formData.role || loading}
            onClick={handleCreateAgent}
            whileHover={formData.name && formData.role ? { scale: 1.05 } : {}}
            whileTap={formData.name && formData.role ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Creating Agent...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Create Agent</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAgent;