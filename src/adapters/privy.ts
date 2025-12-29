import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo, useCallback } from 'react';
import type { MPCAdapter } from './types';
import type { TransactionRequest } from 'viem';
import { createWalletClient, custom } from 'viem';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN_ID } from '../chains/config';

export function usePrivyAdapter(chainId: number = DEFAULT_CHAIN_ID): MPCAdapter {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

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

      // Get the EIP-1193 provider
      const provider = await embeddedWallet.getEthereumProvider();

      // Create a wallet client with the provider
      const walletClient = createWalletClient({
        chain: chainConfig.chain,
        transport: custom(provider),
      });

      // Build transaction params, only including defined values
      const txParams: Parameters<typeof walletClient.sendTransaction>[0] = {
        account: embeddedWallet.address as `0x${string}`,
        to: tx.to as `0x${string}`,
        chain: chainConfig.chain,
      };

      if (tx.value !== undefined) txParams.value = tx.value;
      if (tx.data) txParams.data = tx.data as `0x${string}`;
      if (tx.gas !== undefined) txParams.gas = tx.gas;

      // Send the transaction
      const hash = await walletClient.sendTransaction(txParams);

      return hash;
    },
    [embeddedWallet, chainId]
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
