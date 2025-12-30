import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useMemo, useCallback } from 'react';
import type { MPCAdapter } from './types';
import type { TransactionRequest } from 'viem';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from '../chains/config';

export function usePrivyAdapter(chainId: number = DEFAULT_CHAIN_ID): MPCAdapter {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction: privySendTransaction } = useSendTransaction();

  // Find the embedded wallet (created by Privy)
  const embeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === 'privy');
  }, [wallets]);

  const getAddress = useCallback((): `0x${string}` | null => {
    if (!embeddedWallet) return null;
    return embeddedWallet.address as `0x${string}`;
  }, [embeddedWallet]);

  const sendTransaction = useCallback(
    async (tx: TransactionRequest): Promise<`0x${string}`> => {
      if (!embeddedWallet) {
        throw new Error('No embedded wallet found');
      }

      const chainConfig = SUPPORTED_CHAINS[chainId];
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }

      // Switch to the correct chain if needed
      await embeddedWallet.switchChain(chainId);

      // Build transaction request for Privy's sendTransaction
      // Using Privy's useSendTransaction hook with sponsor: true for gas sponsorship
      const txRequest: {
        to: string;
        value?: bigint;
        data?: string;
        chainId: number;
      } = {
        to: tx.to as string,
        chainId: chainId,
      };

      if (tx.value !== undefined) {
        txRequest.value = tx.value;
      }
      if (tx.data) {
        txRequest.data = tx.data as string;
      }

      console.log('[BreakGlass] Sending transaction via Privy:', txRequest);

      // Use Privy's sendTransaction with sponsor: true
      // This enables gas sponsorship if configured in the Privy dashboard
      const result = await privySendTransaction(txRequest, {
        sponsor: true, // Enable gas sponsorship
      });

      console.log('[BreakGlass] Transaction result:', result);

      // The result contains the transaction hash
      return result.hash;
    },
    [embeddedWallet, chainId, privySendTransaction]
  );

  return {
    init: async () => {
      // Privy initializes automatically via the provider
    },
    login: async () => {
      await login();
    },
    logout: async () => {
      await logout();
    },
    isAuthenticated: authenticated,
    isLoading: !ready,
    getAddress,
    sendTransaction,
    // Note: exportPrivateKey is not directly available via SDK
    // Users would need to use Privy's built-in export UI
    providerName: 'Privy',
  };
}
