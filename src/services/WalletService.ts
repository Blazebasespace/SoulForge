// Simplified wallet service for deployment without Web3 dependencies
interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
}

interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

export class WalletService {
  private static walletState: WalletState = {
    isConnected: false,
    address: null,
    balance: null,
    chainId: null
  }

  private static listeners: Array<(state: WalletState) => void> = []

  static subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.walletState))
  }

  static async connectWallet(): Promise<boolean> {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.walletState = {
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF',
        balance: '0.1234',
        chainId: 8453 // Base
      }
      this.notifyListeners()
      return true
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return false
    }
  }

  static async disconnectWallet(): Promise<void> {
    this.walletState = {
      isConnected: false,
      address: null,
      balance: null,
      chainId: null
    }
    this.notifyListeners()
  }

  static getWalletState(): WalletState {
    return { ...this.walletState }
  }

  static async processPayment(amount: number, description: string): Promise<PaymentResult> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.1 // 90% success rate
    
    if (success) {
      const payment = {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        to: '0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF',
        amount: amount.toString(),
        description,
        timestamp: new Date().toISOString()
      }
      
      const payments = JSON.parse(localStorage.getItem('soulforge_real_payments') || '[]')
      payments.push(payment)
      localStorage.setItem('soulforge_real_payments', JSON.stringify(payments))
      
      return {
        success: true,
        transactionHash: payment.hash
      }
    } else {
      return {
        success: false,
        error: 'Transaction failed'
      }
    }
  }

  static getPaymentHistory(): Array<{
    hash: string
    to: string
    amount: string
    description: string
    timestamp: string
  }> {
    return JSON.parse(localStorage.getItem('soulforge_real_payments') || '[]')
  }
}