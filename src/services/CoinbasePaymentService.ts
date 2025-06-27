interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  amount: number;
  currency: string;
  paymentUrl?: string;
  expiresAt?: Date;
}

export class CoinbasePaymentService {
  private static readonly API_KEY = import.meta.env.VITE_COINBASE_API_KEY;
  private static readonly API_SECRET = import.meta.env.VITE_COINBASE_API_SECRET;
  private static readonly BASE_URL = 'https://api.commerce.coinbase.com';

  static async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.API_KEY || !this.API_SECRET) {
      console.warn('Coinbase API credentials not configured, using mock payment');
      return this.createMockPayment(request);
    }

    try {
      const payload = {
        name: request.description,
        description: request.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: request.amount.toString(),
          currency: request.currency.toUpperCase()
        },
        metadata: request.metadata || {}
      };

      const response = await fetch(`${this.BASE_URL}/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': this.API_KEY,
          'X-CC-Version': '2018-03-22'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.data.id,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        paymentUrl: data.data.hosted_url,
        expiresAt: new Date(data.data.expires_at)
      };
    } catch (error) {
      console.error('Coinbase payment creation failed:', error);
      return this.createMockPayment(request);
    }
  }

  static async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    if (!this.API_KEY || paymentId.startsWith('mock_')) {
      return this.getMockPaymentStatus(paymentId);
    }

    try {
      const response = await fetch(`${this.BASE_URL}/charges/${paymentId}`, {
        headers: {
          'X-CC-Api-Key': this.API_KEY,
          'X-CC-Version': '2018-03-22'
        }
      });

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status}`);
      }

      const data = await response.json();
      const charge = data.data;
      
      let status: PaymentResponse['status'] = 'pending';
      if (charge.timeline) {
        const lastEvent = charge.timeline[charge.timeline.length - 1];
        switch (lastEvent.status) {
          case 'COMPLETED':
            status = 'completed';
            break;
          case 'EXPIRED':
            status = 'expired';
            break;
          case 'CANCELED':
            status = 'failed';
            break;
          default:
            status = 'pending';
        }
      }

      return {
        id: charge.id,
        status,
        amount: parseFloat(charge.pricing.local.amount),
        currency: charge.pricing.local.currency,
        paymentUrl: charge.hosted_url,
        expiresAt: new Date(charge.expires_at)
      };
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return this.getMockPaymentStatus(paymentId);
    }
  }

  private static createMockPayment(request: PaymentRequest): PaymentResponse {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store mock payment for status checking
    const mockPayment = {
      id: mockId,
      status: 'pending' as const,
      amount: request.amount,
      currency: request.currency,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };
    
    localStorage.setItem(`mock_payment_${mockId}`, JSON.stringify(mockPayment));
    
    return {
      ...mockPayment,
      paymentUrl: `#mock-payment-${mockId}`
    };
  }

  private static getMockPaymentStatus(paymentId: string): PaymentResponse {
    const stored = localStorage.getItem(`mock_payment_${paymentId}`);
    if (!stored) {
      return {
        id: paymentId,
        status: 'failed',
        amount: 0,
        currency: 'USD'
      };
    }

    const payment = JSON.parse(stored);
    
    // Simulate payment completion after 5 seconds for demo purposes
    const now = new Date();
    const createdAt = new Date(payment.createdAt);
    const timeDiff = now.getTime() - createdAt.getTime();
    
    if (timeDiff > 5000) { // 5 seconds
      payment.status = 'completed';
      localStorage.setItem(`mock_payment_${paymentId}`, JSON.stringify(payment));
    }
    
    return {
      ...payment,
      createdAt: new Date(payment.createdAt),
      expiresAt: new Date(payment.expiresAt)
    };
  }

  static async processInstantPayment(amount: number, description: string): Promise<boolean> {
    // For demo purposes, simulate instant payment processing
    const confirmed = confirm(
      `Process payment of $${amount.toFixed(2)} for ${description}?\n\n` +
      `This is a demo - no actual payment will be charged.`
    );
    
    if (!confirmed) return false;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return true;
  }
}