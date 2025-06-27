import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Home from './pages/Home';
import AgentMarketplace from './pages/AgentMarketplace';
import CreateAgent from './pages/CreateAgent';
import ChatInterface from './pages/ChatInterface';
import AutoBuilder from './pages/AutoBuilder';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"></div>
        <div className="relative z-10">
          <Header />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<AgentMarketplace />} />
              <Route path="/create" element={<CreateAgent />} />
              <Route path="/chat/:agentId" element={<ChatInterface />} />
              <Route path="/autobuilder" element={<AutoBuilder />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </motion.main>
        </div>
      </div>
    </Router>
  );
}

export default App;