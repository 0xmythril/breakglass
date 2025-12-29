import type { Chain } from 'viem';
import {
  mainnet,
  base,
  polygon,
  arbitrum,
  sepolia,
} from 'viem/chains';

export interface ChainConfig {
  chain: Chain;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  defaultTokens: TokenConfig[];
}

export interface TokenConfig {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
}

// USDC addresses per chain
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon (native USDC)
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum (native USDC)
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia
};

// USDT addresses per chain
const USDT_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
  137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
  42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
};

// WETH addresses per chain
const WETH_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum
  8453: '0x4200000000000000000000000000000000000006', // Base
  137: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // Polygon (bridged WETH)
  42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Arbitrum
};

function getDefaultTokens(chainId: number): TokenConfig[] {
  const tokens: TokenConfig[] = [];

  if (USDC_ADDRESSES[chainId]) {
    tokens.push({
      address: USDC_ADDRESSES[chainId],
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    });
  }

  if (USDT_ADDRESSES[chainId]) {
    tokens.push({
      address: USDT_ADDRESSES[chainId],
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    });
  }

  if (WETH_ADDRESSES[chainId]) {
    tokens.push({
      address: WETH_ADDRESSES[chainId],
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    });
  }

  return tokens;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  1: {
    chain: mainnet,
    rpcUrl: 'https://cloudflare-eth.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultTokens: getDefaultTokens(1),
  },
  8453: {
    chain: base,
    rpcUrl: 'https://base.publicnode.com',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultTokens: getDefaultTokens(8453),
  },
  137: {
    chain: polygon,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    defaultTokens: getDefaultTokens(137),
  },
  42161: {
    chain: arbitrum,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    defaultTokens: getDefaultTokens(42161),
  },
  11155111: {
    chain: sepolia,
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    defaultTokens: getDefaultTokens(11155111),
  },
};

export const DEFAULT_CHAIN_ID = Number(import.meta.env.VITE_DEFAULT_CHAIN_ID) || 1;

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId];
}

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const config = SUPPORTED_CHAINS[chainId];
  if (!config) return '';
  return `${config.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(chainId: number, address: string): string {
  const config = SUPPORTED_CHAINS[chainId];
  if (!config) return '';
  return `${config.explorerUrl}/address/${address}`;
}

