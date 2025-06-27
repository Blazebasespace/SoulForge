import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Bot, Hammer, Sparkles, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Mirror Agents",
      description: "Honest, uneditable therapeutic agents that hold you accountable",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Bot,
      title: "Custom Soul Agents", 
      description: "Fully customizable AI personas with memory and emotion",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Hammer,
      title: "AutoBuilder",
      description: "AI that generates full-stack applications from prompts",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Globe,
      title: "Decentralized Storage",
      description: "All agents stored on IPFS for permanence and ownership",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Forge AI Souls
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Create persistent AI agents with real identities, emotional depth, and memory. 
          From therapeutic Mirror Agents to custom personas, all hosted on decentralized infrastructure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/marketplace">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Explore Agents</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link to="/create">
            <motion.button
              className="px-8 py-4 border-2 border-purple-500 text-purple-300 rounded-xl font-semibold text-lg hover:bg-purple-500/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your Agent
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
              whileHover={{ scale: 1.02, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="grid md:grid-cols-3 gap-8 text-center mb-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div>
          <div className="text-4xl font-bold text-purple-400 mb-2">∞</div>
          <div className="text-gray-300">Persistent Memory</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
          <div className="text-gray-300">Always Available</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-pink-400 mb-2">100%</div>
          <div className="text-gray-300">Decentralized</div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="text-center p-12 rounded-3xl backdrop-blur-md bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Your First Agent?</h2>
        <p className="text-gray-300 mb-6">Join the future of AI companionship and productivity</p>
        <Link to="/create">
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;