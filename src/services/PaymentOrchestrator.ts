import { X402PayService } from './X402PayService';
import { CDPWalletService } from './CDPWalletService';

interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'x402pay' | 'cdp-wallet' | 'auto';
  metadata?: Record<string, any>;
}

interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  method: 'x402pay' | 'cdp-wallet';
  amount: number;
  currency: string;
  timestamp: Date;
}

export class PaymentOrchestrator {
  static async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Auto-select payment method if not specified
      let method = request.paymentMethod;
      if (method === 'auto') {
        method = await this.selectOptimalPaymentMethod(request);
      }

      let result: PaymentResult;

      switch (method) {
        case 'x402pay':
          result = await this.processX402Payment(request);
          break;
        case 'cdp-wallet':
          result = await this.processCDPPayment(request);
          break;
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }

      // Record successful payment
      if (result.success) {
        await this.recordPaymentSuccess(result);
        await this.distributeRevenue(result);
      }

      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  private static async selectOptimalPaymentMethod(request: PaymentRequest): Promise<'x402pay' | 'cdp-wallet'> {
    // Check if CDP wallet is connected
    const isWalletConnected = CDPWalletService.isConnected();
    
    if (isWalletConnected && request.amount >= 0.1) {
      return 'cdp-wallet';
    } else {
      return 'x402pay';
    }
  }

  private static async processX402Payment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const payment = await X402PayService.createPayment({
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        metadata: request.metadata
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = Math.random() > 0.1; // 90% success rate for demo

      return {
        success,
        paymentId: payment.paymentId,
        method: 'x402pay',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('x402pay payment failed:', error);
      return {
        success: false,
        paymentId: 'failed',
        method: 'x402pay',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date()
      };
    }
  }

  private static async processCDPPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Ensure wallet is connected
      const connected = await CDPWalletService.connectWallet();
      if (!connected) {
        throw new Error('Wallet not connected');
      }

      // For incoming payments, just record the expectation
      const walletAddress = await CDPWalletService.receivePayment(
        request.amount,
        request.currency === 'USD' ? 'ETH' : request.currency,
        request.description
      );

      // Simulate payment completion
      await new Promise(resolve => setTimeout(resolve, 3000));
      const paymentId = `cdp_${Date.now()}`;
      
      return {
        success: true,
        paymentId,
        transactionId: `0x${Math.random().toString(16).substr(2, 64)}`,
        method: 'cdp-wallet',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('CDP wallet payment failed:', error);
      return {
        success: false,
        paymentId: 'failed',
        method: 'cdp-wallet',
        amount: request.amount,
        currency: request.currency,
        timestamp: new Date()
      };
    }
  }

  private static async recordPaymentSuccess(result: PaymentResult): Promise<void> {
    const payment = {
      id: result.paymentId,
      method: result.method,
      amount: result.amount,
      currency: result.currency,
      timestamp: result.timestamp.toISOString(),
      transactionId: result.transactionId
    };

    const payments = JSON.parse(localStorage.getItem('soulforge_payments') || '[]');
    payments.push(payment);
    localStorage.setItem('soulforge_payments', JSON.stringify(payments));
  }

  private static async distributeRevenue(result: PaymentResult): Promise<void> {
    // Simulate revenue distribution
    const platformFee = result.amount * 0.1; // 10% platform fee
    const creatorRevenue = result.amount * 0.9; // 90% to creator

    console.log(`Revenue Distribution:
      Total: $${result.amount}
      Platform Fee (10%): $${platformFee.toFixed(2)}
      Creator Revenue (90%): $${creatorRevenue.toFixed(2)}
      Method: ${result.method}
    `);

    // Record revenue distribution
    const distribution = {
      paymentId: result.paymentId,
      totalAmount: result.amount,
      platformFee,
      creatorRevenue,
      method: result.method,
      timestamp: new Date().toISOString()
    };

    const distributions = JSON.parse(localStorage.getItem('soulforge_distributions') || '[]');
    distributions.push(distribution);
    localStorage.setItem('soulforge_distributions', JSON.stringify(distributions));
  }

  static getPaymentHistory(): Array<{
    id: string;
    method: string;
    amount: number;
    currency: string;
    timestamp: string;
    transactionId?: string;
  }> {
    return JSON.parse(localStorage.getItem('soulforge_payments') || '[]');
  }

  static async getWalletStatus(): Promise<{
    address: string;
    balances: Array<{ asset: string; amount: number; usdValue: number }>;
    totalRevenue: { [asset: string]: number };
    isConnected: boolean;
  }> {
    try {
      const isConnected = CDPWalletService.isConnected();
      const address = await CDPWalletService.getWalletAddress();
      const balances = await CDPWalletService.getBalance();
      const totalRevenue = CDPWalletService.getTotalRevenue();

      return {
        address,
        balances,
        totalRevenue,
        isConnected
      };
    } catch (error) {
      console.error('Failed to get wallet status:', error);
      return {
        address: 'Not available',
        balances: [],
        totalRevenue: {},
        isConnected: false
      };
    }
  }

  static async connectWallet(): Promise<boolean> {
    return await CDPWalletService.connectWallet();
  }
}