import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Zap, Download, Eye, Code, DollarSign, Bot, Sparkles, Wallet } from 'lucide-react';
import { AutoBuilderService } from '../services/AutoBuilderService';
import { PaymentOrchestrator } from '../services/PaymentOrchestrator';
import PaymentModal from '../components/PaymentModal';

const AutoBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [buildType, setBuildType] = useState<'project' | 'agent'>('project');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<any>(null);
  const [generatedAgent, setGeneratedAgent] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const generateContent = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      if (buildType === 'project') {
        const result = await AutoBuilderService.generateProject(prompt);
        setGeneratedProject(result);
        setGeneratedAgent(null);
      } else {
        const result = await AutoBuilderService.generateAgent(prompt);
        setGeneratedAgent(result);
        setGeneratedProject(null);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadClick = () => {
    setShowPaymentModal(true);
  };

  const handleCreateAgentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (buildType === 'project' && generatedProject) {
      try {
        await AutoBuilderService.downloadProject(generatedProject.id);
        setShowPaymentModal(false);
        alert('Project downloaded successfully!');
      } catch (error) {
        console.error('Failed to download project:', error);
        alert('Failed to download project. Please try again.');
      }
    } else if (buildType === 'agent' && generatedAgent) {
      try {
        await AutoBuilderService.createAgentFromGenerated(generatedAgent);
        setShowPaymentModal(false);
        alert('Agent created successfully! You can find it in the marketplace.');
        // Redirect to marketplace
        window.location.href = '/marketplace';
      } catch (error) {
        console.error('Failed to create agent:', error);
        alert('Failed to create agent. Please try again.');
      }
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const connectWallet = async () => {
    try {
      const connected = await PaymentOrchestrator.connectWallet();
      setWalletConnected(connected);
      if (connected) {
        alert('Wallet connected successfully!');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet.');
    }
  };

  const currentItem = buildType === 'project' ? generatedProject : generatedAgent;
  const currentPrice = buildType === 'project' ? 0.25 : 0.99;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
              <Hammer className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">AutoBuilder</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Describe what you want and our AI will generate complete projects or intelligent agents
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8 text-center">
          <motion.button
            onClick={connectWallet}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all ${
              walletConnected
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wallet className="w-5 h-5" />
            <span>{walletConnected ? 'Wallet Connected' : 'Connect Wallet'}</span>
          </motion.button>
        </div>

        {/* Build Type Selection */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={() => setBuildType('project')}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
                buildType === 'project'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Code className="w-5 h-5" />
              <span>Generate Project ($0.25)</span>
            </motion.button>
            
            <motion.button
              onClick={() => setBuildType('agent')}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
                buildType === 'agent'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-5 h-5" />
              <span>Generate Agent ($0.99)</span>
            </motion.button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-12">
          <div className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
            <label className="block text-lg font-semibold text-white mb-4">
              {buildType === 'project' ? 'Describe your application' : 'Describe your AI agent'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                buildType === 'project'
                  ? "e.g., Build me a SaaS dashboard with user authentication, subscription management, analytics charts, and a blog system. Include Stripe integration and email notifications."
                  : "e.g., Create a fitness coach agent that motivates users, tracks workouts, provides nutrition advice, and has an encouraging but firm personality. Should be knowledgeable about exercise science."
              }
              rows={4}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                {buildType === 'project' ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4" />
                      <span>Full-stack code generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Production-ready</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>$0.25 per download</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <span>Custom AI personality</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Unique characteristics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>$0.99 per agent</span>
                    </div>
                  </>
                )}
              </div>
              
              <motion.button
                onClick={generateContent}
                disabled={!prompt.trim() || isGenerating}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
                  prompt.trim() && !isGenerating
                    ? buildType === 'project'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={prompt.trim() && !isGenerating ? { scale: 1.05 } : {}}
                whileTap={prompt.trim() && !isGenerating ? { scale: 0.95 } : {}}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate {buildType === 'project' ? 'Project' : 'Agent'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Generated Content Preview */}
        {currentItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Preview */}
            <div className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{buildType === 'project' ? 'Project' : 'Agent'} Preview</span>
              </h3>
              
              <div className="mb-4">
                <div className={`w-full h-48 bg-gradient-to-br ${
                  buildType === 'project' 
                    ? 'from-blue-800 to-cyan-900' 
                    : 'from-purple-800 to-pink-900'
                } rounded-xl border border-white/10 flex items-center justify-center`}>
                  {buildType === 'project' ? (
                    <Code className="w-16 h-16 text-white/60" />
                  ) : (
                    <Bot className="w-16 h-16 text-white/60" />
                  )}
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-white mb-2">{currentItem.name}</h4>
              <p className="text-gray-400 mb-4">{currentItem.description}</p>
              
              {buildType === 'project' ? (
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-300">Technologies Used:</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentItem.technologies?.map((tech: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-300">Personality Traits:</h5>
                  <p className="text-sm text-gray-400">{currentItem.personality}</p>
                  <h5 className="font-medium text-gray-300 mt-3">Role:</h5>
                  <p className="text-sm text-gray-400">{currentItem.role}</p>
                  <h5 className="font-medium text-gray-300 mt-3">Values:</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentItem.values?.map((value: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Panel */}
            <div className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                {buildType === 'project' ? <Download className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                <span>{buildType === 'project' ? 'Download' : 'Create Agent'}</span>
              </h3>
              
              {buildType === 'project' && (
                <div className="bg-black/20 rounded-xl p-4 mb-6 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-300 font-mono">
                    {currentItem.fileStructure || 'File structure will be generated...'}
                  </pre>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-semibold text-white">
                      {buildType === 'project' ? 'Complete Source Code' : 'Custom AI Agent'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {buildType === 'project' 
                        ? 'Full project with all dependencies' 
                        : 'Ready to chat and interact'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${currentPrice}</div>
                    <div className="text-xs text-gray-400">One-time payment</div>
                  </div>
                </div>
                
                <motion.button
                  onClick={buildType === 'project' ? handleDownloadClick : handleCreateAgentClick}
                  className={`w-full px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
                    buildType === 'project'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {buildType === 'project' ? <Download className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  <span>
                    {buildType === 'project' 
                      ? `Download Project ($${currentPrice})` 
                      : `Create Agent ($${currentPrice})`}
                  </span>
                </motion.button>
                
                <p className="text-xs text-gray-500 text-center">
                  Payment processed securely via x402pay and CDP Wallet
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: buildType === 'project' ? Code : Bot,
              title: buildType === 'project' ? "Full-Stack Generation" : "AI Agent Creation",
              description: buildType === 'project' 
                ? "Complete frontend and backend code with proper architecture"
                : "Custom AI personalities with unique traits and behaviors"
            },
            {
              icon: Zap,
              title: buildType === 'project' ? "Production Ready" : "Instant Deployment",
              description: buildType === 'project'
                ? "Clean, maintainable code with best practices and documentation"
                : "Agents are immediately available for chat and interaction"
            },
            {
              icon: buildType === 'project' ? Download : Sparkles,
              title: buildType === 'project' ? "Instant Download" : "Marketplace Ready",
              description: buildType === 'project'
                ? "Get your complete project as a downloadable ZIP file"
                : "Agents are automatically added to the marketplace for others to discover"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl p-3 mx-auto mb-4 ${
                  buildType === 'project'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={currentPrice}
        description={
          buildType === 'project' 
            ? `Download: ${currentItem?.name || 'Generated Project'}`
            : `Create Agent: ${currentItem?.name || 'Generated Agent'}`
        }
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};

export default AutoBuilder;