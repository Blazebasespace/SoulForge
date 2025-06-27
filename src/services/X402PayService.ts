interface X402PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

interface X402PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  expiresAt: Date;
  qrCode?: string;
}

export class X402PayService {
  private static readonly ENDPOINT = import.meta.env.VITE_X402PAY_ENDPOINT || 'https://api.x402pay.com';
  private static readonly WALLET_ADDRESS = import.meta.env.VITE_X402PAY_WALLET_ADDRESS;

  static async createPayment(request: X402PaymentRequest): Promise<X402PaymentResponse> {
    try {
      // Create x402pay payment request
      const paymentData = {
        amount: request.amount,
        currency: request.currency.toUpperCase(),
        description: request.description,
        recipient: this.WALLET_ADDRESS,
        metadata: {
          source: 'soulforge',
          timestamp: new Date().toISOString(),
          ...request.metadata
        },
        callbackUrl: request.callbackUrl || `${window.location.origin}/api/x402pay/callback`
      };

      // For demo purposes, we'll simulate the x402pay API
      // In production, this would make an actual API call to x402pay
      const paymentId = `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payment: X402PaymentResponse = {
        paymentId,
        paymentUrl: `${this.ENDPOINT}/pay/${paymentId}`,
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        qrCode: this.generateQRCode(paymentId, request.amount)
      };

      // Store payment locally for demo
      localStorage.setItem(`x402_payment_${paymentId}`, JSON.stringify(payment));
      
      return payment;
    } catch (error) {
      console.error('x402pay payment creation failed:', error);
      throw new Error('Failed to create x402pay payment');
    }
  }

  static async checkPaymentStatus(paymentId: string): Promise<X402PaymentResponse> {
    try {
      // In production, this would query the x402pay API
      const stored = localStorage.getItem(`x402_payment_${paymentId}`);
      if (!stored) {
        throw new Error('Payment not found');
      }

      const payment = JSON.parse(stored);
      
      // Simulate payment completion after 10 seconds for demo
      const now = new Date();
      const createdTime = new Date(payment.expiresAt).getTime() - (15 * 60 * 1000);
      const timeDiff = now.getTime() - createdTime;
      
      if (timeDiff > 10000 && payment.status === 'pending') { // 10 seconds
        payment.status = 'completed';
        localStorage.setItem(`x402_payment_${paymentId}`, JSON.stringify(payment));
      }
      
      // Check if expired
      if (now > new Date(payment.expiresAt) && payment.status === 'pending') {
        payment.status = 'expired';
        localStorage.setItem(`x402_payment_${paymentId}`, JSON.stringify(payment));
      }
      
      return {
        ...payment,
        expiresAt: new Date(payment.expiresAt)
      };
    } catch (error) {
      console.error('Failed to check x402pay payment status:', error);
      throw new Error('Failed to check payment status');
    }
  }

  static async processInstantPayment(amount: number, description: string): Promise<boolean> {
    try {
      // Simulate instant x402pay processing
      const confirmed = confirm(
        `Process x402pay payment of $${amount.toFixed(2)} for ${description}?\n\n` +
        `This will be charged to your connected wallet.`
      );
      
      if (!confirmed) return false;
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would interact with the user's wallet
      console.log(`x402pay: Processed $${amount} payment for: ${description}`);
      
      return true;
    } catch (error) {
      console.error('x402pay instant payment failed:', error);
      return false;
    }
  }

  private static generateQRCode(paymentId: string, amount: number): string {
    // Generate a simple QR code data URL for demo
    // In production, this would be a proper QR code with payment details
    const qrData = `${this.ENDPOINT}/pay/${paymentId}?amount=${amount}`;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="12" fill="black">
          x402pay
        </text>
        <text x="100" y="125" text-anchor="middle" font-family="monospace" font-size="10" fill="black">
          $${amount}
        </text>
      </svg>
    `)}`;
  }
}