import { usePrivyAdapter } from '../adapters/privy';
import type { MPCAdapter, AdapterProvider } from '../adapters/types';
import { DEFAULT_CHAIN_ID } from '../chains/config';

/**
 * Generic hook that returns the appropriate MPC adapter based on provider
 * Currently only supports Privy, but designed for extensibility
 */
export function useMPCAdapter(
  provider: AdapterProvider = 'privy',
  chainId: number = DEFAULT_CHAIN_ID
): MPCAdapter {
  // For now, we only support Privy
  // In Phase 2, this will be a switch statement
  const privyAdapter = usePrivyAdapter(chainId);

  switch (provider) {
    case 'privy':
      return privyAdapter;
    case 'web3auth':
    case 'coinbase':
    case 'dynamic':
      throw new Error(`${provider} adapter not yet implemented`);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

