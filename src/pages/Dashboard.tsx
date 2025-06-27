import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, MessageCircle, Star, Settings, Trash2, Plus, TrendingUp, Wallet, DollarSign, Activity, Zap } from 'lucide-react';
import { AgentService } from '../services/AgentService';
import { PaymentOrchestrator } from '../services/PaymentOrchestrator';
import { Agent } from '../types/Agent';

const Dashboard = () => {
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletStatus, setWalletStatus] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user agents
      const agents = await AgentService.getUserAgents();
      setUserAgents(agents);

      // Load wallet status
      const wallet = await PaymentOrchestrator.getWalletStatus();
      setWalletStatus(wallet);

      // Load payment history
      const payments = PaymentOrchestrator.getPaymentHistory();
      setPaymentHistory(payments.slice(-10)); // Last 10 payments
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const connected = await PaymentOrchestrator.connectWallet();
      if (connected) {
        // Reload wallet status
        const wallet = await PaymentOrchestrator.getWalletStatus();
        setWalletStatus(wallet);
        alert('Wallet connected successfully!');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet.');
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await AgentService.deleteAgent(agentId);
      setUserAgents(agents => agents.filter(a => a.id !== agentId));
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
    }
  };

  const AgentCard = ({ agent }: { agent: Agent }) => (
    <motion.div
      className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all group"
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl p-3 ${
            agent.type === 'mirror' 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-purple-300 capitalize">{agent.type} Agent</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteAgent(agent.id)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{agent.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{agent.chatCount} chats</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{agent.rating}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          agent.isPublic 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-gray-500/20 text-gray-300'
        }`}>
          {agent.isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      <Link to={`/chat/${agent.id}`}>
        <motion.button
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Open Chat
        </motion.button>
      </Link>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = walletStatus?.totalRevenue ? 
    Object.values(walletStatus.totalRevenue).reduce((sum: number, val: any) => sum + val, 0) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Dashboard</h1>
            <p className="text-xl text-gray-300">Manage your AI agents and view analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            {!walletStatus?.isConnected && (
              <motion.button
                onClick={connectWallet}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:from-green-700 hover:to-emerald-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </motion.button>
            )}
            <Link to="/create">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Create Agent</span>
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          {[
            { 
              label: 'Total Agents', 
              value: userAgents.length.toString(), 
              icon: Bot,
              color: 'from-purple-500 to-pink-500'
            },
            { 
              label: 'Total Chats', 
              value: userAgents.reduce((sum, agent) => sum + agent.chatCount, 0).toString(), 
              icon: MessageCircle,
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              label: 'Avg Rating', 
              value: userAgents.length > 0 
                ? (userAgents.reduce((sum, agent) => sum + agent.rating, 0) / userAgents.length).toFixed(1)
                : '0.0', 
              icon: Star,
              color: 'from-yellow-500 to-orange-500'
            },
            { 
              label: 'Total Revenue', 
              value: `$${totalRevenue.toFixed(2)}`, 
              icon: DollarSign,
              color: 'from-green-500 to-emerald-500'
            },
            { 
              label: 'Payments', 
              value: paymentHistory.length.toString(), 
              icon: Activity,
              color: 'from-indigo-500 to-purple-500'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} p-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Wallet Status */}
        {walletStatus && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Status</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Wallet className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Wallet</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    walletStatus.isConnected 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {walletStatus.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Address:</div>
                  <div className="text-xs font-mono text-gray-300 bg-black/20 p-2 rounded">
                    {walletStatus.address}
                  </div>
                  <div className="text-sm text-gray-400 mt-4">Balances:</div>
                  {walletStatus.balances.length > 0 ? (
                    walletStatus.balances.map((balance: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">{balance.asset}</span>
                        <span className="text-white">{balance.amount.toFixed(4)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No balances available</div>
                  )}
                </div>
              </div>

              <div className="p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Revenue Summary</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(walletStatus.totalRevenue).length > 0 ? (
                    Object.entries(walletStatus.totalRevenue).map(([asset, amount]: [string, any]) => (
                      <div key={asset} className="flex justify-between">
                        <span className="text-gray-300">{asset}</span>
                        <span className="text-green-400 font-semibold">{amount.toFixed(4)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No revenue yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Payments */}
        {paymentHistory.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Payments</h2>
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                          {payment.id.slice(0, 12)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                            payment.method === 'x402pay' 
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {payment.method === 'x402pay' ? <Zap className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                            <span>{payment.method}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(payment.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Agents</h2>
          
          {userAgents.length === 0 ? (
            <motion.div
              className="text-center py-16 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No agents yet</h3>
              <p className="text-gray-500 mb-6">Create your first AI agent to get started</p>
              <Link to="/create">
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Your First Agent
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAgents.map((agent, index) => (
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;