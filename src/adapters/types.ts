import type { TransactionRequest } from 'viem';

export interface SendTransactionOptions {
  /** Enable gas sponsorship (requires Privy dashboard configuration) */
  sponsorGas?: boolean;
}

export interface MPCAdapter {
  /** Initialize the adapter (called once on mount) */
  init(): Promise<void>;

  /** Trigger the login flow */
  login(): Promise<void>;

  /** Log out the current user */
  logout(): Promise<void>;

  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;

  /** Whether the adapter is currently loading/initializing */
  isLoading: boolean;

  /** Get the user's wallet address */
  getAddress(): `0x${string}` | null;

  /** Sign and send a transaction, returns the tx hash */
  sendTransaction(tx: TransactionRequest, options?: SendTransactionOptions): Promise<`0x${string}`>;

  /** Export the private key (if supported by the provider) */
  exportPrivateKey?(): Promise<string>;

  /** Get the provider name for display */
  providerName: string;
}

export type AdapterProvider = 'privy' | 'web3auth' | 'coinbase' | 'dynamic';

export interface AdapterConfig {
  provider: AdapterProvider;
  appId: string;
  chainId?: number;
}
