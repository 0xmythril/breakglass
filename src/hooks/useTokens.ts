import { useState, useCallback, useEffect } from 'react';
import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { SUPPORTED_CHAINS, type TokenConfig } from '../chains/config';

const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
]);

export interface TokenBalance extends TokenConfig {
  balance: bigint;
  formattedBalance: string;
}

interface UseTokensReturn {
  tokens: TokenConfig[];
  balances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  addToken: (address: string) => Promise<TokenConfig | null>;
  removeToken: (address: string) => void;
  refreshBalances: () => Promise<void>;
}

const STORAGE_KEY = 'breakglass_custom_tokens';

function getStoredTokens(chainId: number): TokenConfig[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${chainId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeTokens(chainId: number, tokens: TokenConfig[]) {
  localStorage.setItem(`${STORAGE_KEY}_${chainId}`, JSON.stringify(tokens));
}

export function useTokens(
  chainId: number,
  walletAddress: `0x${string}` | null
): UseTokensReturn {
  const [customTokens, setCustomTokens] = useState<TokenConfig[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainConfig = SUPPORTED_CHAINS[chainId];

  // Load custom tokens from localStorage
  useEffect(() => {
    setCustomTokens(getStoredTokens(chainId));
  }, [chainId]);

  // All tokens = default + custom
  const allTokens = [...(chainConfig?.defaultTokens || []), ...customTokens];

  const getClient = useCallback(() => {
    if (!chainConfig) return null;
    return createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.rpcUrl),
    });
  }, [chainConfig]);

  const refreshBalances = useCallback(async () => {
    if (!walletAddress || !chainConfig) {
      setBalances([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const client = getClient();
    if (!client) {
      setError('Failed to create client');
      setIsLoading(false);
      return;
    }

    try {
      const balancePromises = allTokens.map(async (token) => {
        try {
          const balance = await client.readContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [walletAddress],
          });

          return {
            ...token,
            balance,
            formattedBalance: formatUnits(balance, token.decimals),
          };
        } catch (err) {
          console.warn(`Failed to fetch balance for ${token.symbol}:`, err);
          return {
            ...token,
            balance: 0n,
            formattedBalance: '0',
          };
        }
      });

      const results = await Promise.all(balancePromises);
      setBalances(results);
    } catch (err) {
      setError('Failed to fetch token balances');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, chainConfig, allTokens, getClient]);

  // Refresh balances when wallet or chain changes
  useEffect(() => {
    refreshBalances();
  }, [walletAddress, chainId]);

  const addToken = useCallback(
    async (address: string): Promise<TokenConfig | null> => {
      const client = getClient();
      if (!client) {
        setError('Failed to create client');
        return null;
      }

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        setError('Invalid address format');
        return null;
      }

      const tokenAddress = address as `0x${string}`;

      // Check if already added
      if (allTokens.find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase())) {
        setError('Token already added');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch token info
        const [name, symbol, decimals] = await Promise.all([
          client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'name',
          }),
          client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }),
          client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'decimals',
          }),
        ]);

        const newToken: TokenConfig = {
          address: tokenAddress,
          name,
          symbol,
          decimals,
        };

        const updatedTokens = [...customTokens, newToken];
        setCustomTokens(updatedTokens);
        storeTokens(chainId, updatedTokens);

        // Refresh balances to include new token
        await refreshBalances();

        return newToken;
      } catch (err) {
        setError('Failed to fetch token info. Is this a valid ERC20 contract?');
        console.error(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, customTokens, allTokens, getClient, refreshBalances]
  );

  const removeToken = useCallback(
    (address: string) => {
      const updatedTokens = customTokens.filter(
        (t) => t.address.toLowerCase() !== address.toLowerCase()
      );
      setCustomTokens(updatedTokens);
      storeTokens(chainId, updatedTokens);
      setBalances((prev) =>
        prev.filter((t) => t.address.toLowerCase() !== address.toLowerCase())
      );
    },
    [chainId, customTokens]
  );

  return {
    tokens: allTokens,
    balances,
    isLoading,
    error,
    addToken,
    removeToken,
    refreshBalances,
  };
}

