import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Clock, CheckCircle, AlertCircle, Wallet, Zap } from 'lucide-react';
import { PaymentOrchestrator } from '../services/PaymentOrchestrator';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  onSuccess,
  onError
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [selectedMethod, setSelectedMethod] = useState<'x402pay' | 'cdp-wallet' | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkWalletConnection();
    }
  }, [isOpen]);

  const checkWalletConnection = async () => {
    try {
      const walletStatus = await PaymentOrchestrator.getWalletStatus();
      setWalletConnected(walletStatus.isConnected);
    } catch (error) {
      console.error('Failed to check wallet status:', error);
      setWalletConnected(false);
    }
  };

  const connectWallet = async () => {
    try {
      const connected = await PaymentOrchestrator.connectWallet();
      setWalletConnected(connected);
      if (!connected) {
        onError('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      onError('Failed to connect wallet');
    }
  };

  const handlePayment = async (method: 'x402pay' | 'cdp-wallet') => {
    if (method === 'cdp-wallet' && !walletConnected) {
      await connectWallet();
      if (!walletConnected) return;
    }

    setSelectedMethod(method);
    setPaymentStatus('processing');

    try {
      const result = await PaymentOrchestrator.processPayment({
        amount,
        currency: 'USD',
        description,
        paymentMethod: method,
        metadata: {
          source: 'soulforge',
          timestamp: new Date().toISOString()
        }
      });

      setPaymentResult(result);

      if (result.success) {
        setPaymentStatus('completed');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setPaymentStatus('failed');
        onError('Payment processing failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  const handleClose = () => {
    if (paymentStatus === 'processing') {
      const confirmed = confirm('Payment is in progress. Are you sure you want to close?');
      if (!confirmed) return;
    }
    
    setPaymentStatus('idle');
    setSelectedMethod(null);
    setPaymentResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Complete Payment</h2>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-2xl font-bold text-white">${amount.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-300">{description}</div>
              </div>
            </div>

            {/* Payment Methods */}
            {paymentStatus === 'idle' && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Choose Payment Method</h3>
                
                {/* x402pay Option */}
                <motion.button
                  onClick={() => handlePayment('x402pay')}
                  className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-between hover:from-blue-700 hover:to-cyan-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">x402pay</div>
                      <div className="text-sm opacity-80">Instant micropayments</div>
                    </div>
                  </div>
                  <div className="text-sm opacity-80">Fast</div>
                </motion.button>

                {/* CDP Wallet Option */}
                <motion.button
                  onClick={() => handlePayment('cdp-wallet')}
                  className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-between hover:from-purple-700 hover:to-pink-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">CDP Wallet</div>
                      <div className="text-sm opacity-80">
                        {walletConnected ? 'Connected' : 'Connect wallet'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm opacity-80">
                    {walletConnected ? 'Ready' : 'Connect'}
                  </div>
                </motion.button>

                <div className="text-xs text-gray-500 text-center mt-4">
                  Both methods support secure payment processing with revenue distribution
                </div>
              </div>
            )}

            {/* Payment Processing */}
            {paymentStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white font-semibold mb-2">Processing Payment</p>
                <p className="text-gray-400 text-sm">
                  Using {selectedMethod === 'x402pay' ? 'x402pay' : 'CDP Wallet'}...
                </p>
                {selectedMethod === 'cdp-wallet' && (
                  <p className="text-gray-500 text-xs mt-2">
                    Please confirm the transaction in your wallet
                  </p>
                )}
              </div>
            )}

            {/* Payment Success */}
            {paymentStatus === 'completed' && paymentResult && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Payment Successful!</p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Method: {paymentResult.method}</p>
                  <p>Payment ID: {paymentResult.paymentId}</p>
                  {paymentResult.transactionId && (
                    <p>Transaction: {paymentResult.transactionId.slice(0, 10)}...</p>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-4">Processing your request...</p>
              </div>
            )}

            {/* Payment Failed */}
            {paymentStatus === 'failed' && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Payment Failed</p>
                <p className="text-gray-400 text-sm mb-4">Please try again with a different method</p>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="text-xs text-gray-500 text-center">
              Powered by x402pay and Coinbase CDP Wallet
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;