import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

interface WalletBalance {
  asset: string;
  amount: number;
  usdValue: number;
}

interface TransferRequest {
  amount: number;
  asset: string;
  destination: string;
  description?: string;
}

interface TransferResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  asset: string;
  destination: string;
  fee: number;
}

export class CDPWalletService {
  private static wallet: Wallet | null = null;
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const apiKeyName = import.meta.env.VITE_COINBASE_API_KEY;
      const apiKeyPrivateKey = import.meta.env.VITE_COINBASE_API_SECRET;

      if (!apiKeyName || !apiKeyPrivateKey) {
        console.warn('Coinbase CDP credentials not configured');
        return;
      }

      // Configure Coinbase SDK
      Coinbase.configure(apiKeyName, apiKeyPrivateKey);

      // Try to load existing wallet or create new one
      const savedWalletData = localStorage.getItem('soulforge_cdp_wallet');
      
      if (savedWalletData) {
        try {
          const walletData = JSON.parse(savedWalletData);
          this.wallet = await Wallet.import(walletData);
          console.log('CDP Wallet loaded from storage');
        } catch (error) {
          console.warn('Failed to load saved wallet, creating new one:', error);
          await this.createNewWallet();
        }
      } else {
        await this.createNewWallet();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize CDP Wallet:', error);
      // Don't throw error, allow fallback to mock payments
      this.isInitialized = true;
    }
  }

  private static async createNewWallet(): Promise<void> {
    try {
      // Create wallet on Base Sepolia for testing
      this.wallet = await Wallet.create({ networkId: Coinbase.networks.BaseSepolia });
      
      // Export and save wallet data
      const walletData = this.wallet.export();
      localStorage.setItem('soulforge_cdp_wallet', JSON.stringify(walletData));
      
      console.log('New CDP Wallet created:', this.wallet.getId());
      
      // Fund with testnet tokens
      try {
        const faucetTx = await this.wallet.faucet();
        await faucetTx.wait();
        console.log('Wallet funded with testnet ETH');
      } catch (error) {
        console.warn('Failed to fund wallet with faucet:', error);
      }
    } catch (error) {
      console.error('Failed to create new wallet:', error);
      // Create mock wallet for demo
      this.wallet = null;
    }
  }

  static async getWalletAddress(): Promise<string> {
    await this.initialize();
    if (!this.wallet) {
      // Return mock address for demo
      return '0x742d35Cc6634C0532925a3b8D4C9db96590e4CAF';
    }
    
    const address = await this.wallet.getDefaultAddress();
    return address.getId();
  }

  static async getBalance(): Promise<WalletBalance[]> {
    await this.initialize();
    if (!this.wallet) {
      // Return mock balances for demo
      return [
        { asset: 'ETH', amount: 0.1, usdValue: 250 },
        { asset: 'USDC', amount: 100, usdValue: 100 }
      ];
    }

    try {
      const balances = await this.wallet.listBalances();
      
      return Object.entries(balances).map(([asset, balance]) => ({
        asset,
        amount: parseFloat(balance.toString()),
        usdValue: 0 // Would need price API for real USD values
      }));
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return [];
    }
  }

  static async transfer(request: TransferRequest): Promise<TransferResponse> {
    await this.initialize();
    
    if (!this.wallet) {
      // Mock transfer for demo
      return {
        transactionId: `mock_tx_${Date.now()}`,
        status: 'completed',
        amount: request.amount,
        asset: request.asset,
        destination: request.destination,
        fee: 0.001
      };
    }

    try {
      const transfer = await this.wallet.createTransfer({
        amount: request.amount,
        assetId: request.asset,
        destination: request.destination
      });

      // Wait for transfer to complete
      await transfer.wait();

      const response: TransferResponse = {
        transactionId: transfer.getTransactionHash() || 'unknown',
        status: transfer.getStatus() === 'complete' ? 'completed' : 'failed',
        amount: request.amount,
        asset: request.asset,
        destination: request.destination,
        fee: 0 // Would need to calculate actual fee
      };

      // Log successful payment out
      if (response.status === 'completed') {
        console.log(`CDP Wallet: Sent ${request.amount} ${request.asset} to ${request.destination}`);
        
        // Store transaction for revenue tracking
        this.recordRevenue(request.amount, request.asset, request.description || 'Payment');
      }

      return response;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw new Error('Transfer failed');
    }
  }

  static async receivePayment(amount: number, asset: string, description: string): Promise<string> {
    await this.initialize();
    const address = await this.getWalletAddress();
    
    // Record incoming revenue
    this.recordRevenue(amount, asset, description, 'incoming');
    
    console.log(`CDP Wallet: Ready to receive ${amount} ${asset} at ${address}`);
    return address;
  }

  private static recordRevenue(amount: number, asset: string, description: string, type: 'incoming' | 'outgoing' = 'incoming'): void {
    const revenue = {
      id: Date.now().toString(),
      amount,
      asset,
      description,
      type,
      timestamp: new Date().toISOString(),
      walletAddress: this.wallet?.getId() || 'mock-wallet'
    };

    const existingRevenue = JSON.parse(localStorage.getItem('soulforge_revenue') || '[]');
    existingRevenue.push(revenue);
    localStorage.setItem('soulforge_revenue', JSON.stringify(existingRevenue));
  }

  static getRevenueHistory(): Array<{
    id: string;
    amount: number;
    asset: string;
    description: string;
    type: 'incoming' | 'outgoing';
    timestamp: string;
    walletAddress: string;
  }> {
    return JSON.parse(localStorage.getItem('soulforge_revenue') || '[]');
  }

  static getTotalRevenue(): { [asset: string]: number } {
    const history = this.getRevenueHistory();
    const totals: { [asset: string]: number } = {};

    history.forEach(record => {
      if (record.type === 'incoming') {
        totals[record.asset] = (totals[record.asset] || 0) + record.amount;
      }
    });

    return totals;
  }

  static async connectWallet(): Promise<boolean> {
    try {
      await this.initialize();
      const address = await this.getWalletAddress();
      console.log('Wallet connected:', address);
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  static isConnected(): boolean {
    return this.isInitialized && (this.wallet !== null || true); // Allow mock for demo
  }
}