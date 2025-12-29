import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { SUPPORTED_CHAINS } from '../chains/config';

interface UseNativeBalanceReturn {
  balance: bigint;
  formattedBalance: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNativeBalance(
  chainId: number,
  walletAddress: `0x${string}` | null
): UseNativeBalanceReturn {
  const [balance, setBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainConfig = SUPPORTED_CHAINS[chainId];

  const refresh = useCallback(async () => {
    if (!walletAddress || !chainConfig) {
      setBalance(0n);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createPublicClient({
        chain: chainConfig.chain,
        transport: http(chainConfig.rpcUrl),
      });

      const bal = await client.getBalance({ address: walletAddress });
      setBalance(bal);
    } catch (err) {
      setError('Failed to fetch balance');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, chainConfig]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    balance,
    formattedBalance: formatEther(balance),
    isLoading,
    error,
    refresh,
  };
}

