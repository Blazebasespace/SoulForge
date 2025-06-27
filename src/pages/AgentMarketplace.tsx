import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, Bot, Star, Users, Clock, Filter, Crown } from 'lucide-react';
import { AgentService } from '../services/AgentService';
import { Agent } from '../types/Agent';
import PaymentModal from '../components/PaymentModal';

const AgentMarketplace = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filter, setFilter] = useState<'all' | 'mirror' | 'custom'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentList = await AgentService.getMarketplaceAgents();
        setAgents(agentList);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.type === filter;
  });

  const handleAgentClick = (agent: Agent) => {
    if (agent.price > 0) {
      setSelectedAgent(agent);
      setShowPaymentModal(true);
    } else {
      // Navigate to chat for free agents
      window.location.href = `/chat/${agent.id}`;
    }
  };

  const handlePaymentSuccess = () => {
    if (selectedAgent) {
      setShowPaymentModal(false);
      // Navigate to chat after successful payment
      window.location.href = `/chat/${selectedAgent.id}`;
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const AgentCard = ({ agent }: { agent: Agent }) => (
    <motion.div
      className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => handleAgentClick(agent)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl p-3 relative ${
            agent.type === 'mirror' 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            {agent.type === 'mirror' ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
            {agent.price > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-purple-300 capitalize">{agent.type} Agent</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm">{agent.rating}</span>
        </div>
      </div>

      <p className="text-gray-300 mb-4 line-clamp-3">{agent.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>{agent.chatCount} chats</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Last active {agent.lastActive}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-lg font-semibold ${
          agent.price > 0 ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {agent.price > 0 ? `$${agent.price}` : 'Free'}
          {agent.price > 0 && <span className="text-xs text-gray-400 ml-1">per session</span>}
        </span>
        <motion.button
          className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
            agent.price > 0
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-700 hover:to-orange-700'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleAgentClick(agent);
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{agent.price > 0 ? 'Unlock' : 'Chat'}</span>
        </motion.button>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-white mb-4">Agent Marketplace</h1>
        <p className="text-xl text-gray-300 mb-8">Discover and interact with unique AI personalities</p>

        {/* Filter Bar */}
        <div className="flex items-center space-x-4 mb-8">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Agents' },
              { key: 'mirror', label: 'Mirror Agents' },
              { key: 'custom', label: 'Custom Souls' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === option.key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Notice */}
        <div className="mb-8 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center space-x-2 text-yellow-400 mb-2">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Premium Agents Available</span>
          </div>
          <p className="text-gray-300 text-sm">
            Some agents require payment for access. Premium agents offer enhanced capabilities and specialized expertise.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-16">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No agents found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new agent</p>
          </div>
        )}
      </motion.div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedAgent?.price || 0}
        description={`Access to ${selectedAgent?.name || 'Premium Agent'}`}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};

export default AgentMarketplace;