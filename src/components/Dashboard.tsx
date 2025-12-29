import { useState } from 'react';
import { SUPPORTED_CHAINS } from '../chains/config';
import { useNativeBalance, useTokens } from '../hooks';
import { AddToken } from './AddToken';
import { SweepModal } from './SweepModal';
import type { MPCAdapter } from '../adapters/types';
import './Dashboard.css';

interface DashboardProps {
  adapter: MPCAdapter;
  chainId: number;
  onChainChange: (chainId: number) => void;
}

export function Dashboard({ adapter, chainId, onChainChange }: DashboardProps) {
  const [showSweepModal, setShowSweepModal] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);

  const walletAddress = adapter.getAddress();
  const chainConfig = SUPPORTED_CHAINS[chainId];

  const {
    balance: nativeBalance,
    formattedBalance: nativeFormatted,
    isLoading: nativeLoading,
    refresh: refreshNative,
  } = useNativeBalance(chainId, walletAddress);

  const {
    balances: tokenBalances,
    isLoading: tokensLoading,
    addToken,
    removeToken,
    refreshBalances: refreshTokens,
  } = useTokens(chainId, walletAddress);

  const handleRefresh = async () => {
    await Promise.all([refreshNative(), refreshTokens()]);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    return num.toFixed(4);
  };

  // Filter tokens with non-zero balance for sweep
  const tokensWithBalance = tokenBalances.filter((t) => t.balance > 0n);

  // Check if user has gas (less than a minimal amount for a transaction)
  const hasNoGas = nativeBalance < 100000000000000n; // Less than 0.0001 ETH
  const hasTokensButNoGas = hasNoGas && tokensWithBalance.length > 0;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="pixel-border">
          {/* Header */}
          <div className="dashboard-header">
            <div className="header-left">
              <h1 className="title">BREAKGLASS</h1>
            </div>
            <div className="header-right">
              <button onClick={() => adapter.logout()} className="logout-btn">
                [EXIT]
              </button>
            </div>
          </div>

          <div className="crt-line" />

          {/* Wallet Info */}
          <div className="wallet-section">
            <div className="provider-row">
              <span className="label">PROVIDER:</span>
              <span className="value">{adapter.providerName.toUpperCase()}</span>
            </div>
            <div className="wallet-address">
              <span className="label">WALLET:</span>
              <span className="address">{walletAddress || '---'}</span>
              {walletAddress && (
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  title="Copy address"
                >
                  📋
                </button>
              )}
            </div>

            {/* Chain Selector */}
            <div className="chain-selector">
              <span className="label">NETWORK:</span>
              <select
                value={chainId}
                onChange={(e) => onChainChange(Number(e.target.value))}
                className="chain-select"
              >
                {Object.entries(SUPPORTED_CHAINS).map(([id, config]) => (
                  <option key={id} value={id}>
                    {config.chain.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gas Warning */}
          {hasNoGas && (
            <div className="gas-warning">
              <span className="warning-icon">⚠️</span>
              <div className="warning-content">
                <strong>LOW GAS BALANCE</strong>
                <p>
                  You have insufficient {chainConfig?.nativeCurrency.symbol || 'ETH'} for gas fees.
                  {hasTokensButNoGas && ' You have tokens but cannot transfer them without gas.'}
                </p>
                <p className="warning-note">
                  Unless the original app enabled gas sponsorship, you'll need to send some {chainConfig?.nativeCurrency.symbol || 'ETH'} to this address first.
                </p>
              </div>
            </div>
          )}

          {/* Native Balance */}
          <div className="balance-section">
            <div className="native-balance">
              <div className="balance-header">
                <span className="token-symbol">{chainConfig?.nativeCurrency.symbol || 'ETH'}</span>
                <button onClick={handleRefresh} className="refresh-btn" disabled={nativeLoading || tokensLoading}>
                  {nativeLoading || tokensLoading ? '↻' : '⟳'}
                </button>
              </div>
              <div className="balance-value">
                {nativeLoading ? 'loading...' : formatBalance(nativeFormatted)}
              </div>
            </div>
          </div>

          {/* Token Balances */}
          <div className="tokens-section">
            <div className="section-header">
              <span className="section-title">TOKENS</span>
              <button onClick={() => setShowAddToken(true)} className="add-token-btn">
                [+ ADD]
              </button>
            </div>

            {tokenBalances.length === 0 ? (
              <p className="no-tokens">No tokens tracked. Add a token address above.</p>
            ) : (
              <div className="token-list">
                {tokenBalances.map((token) => (
                  <div key={token.address} className="token-row">
                    <div className="token-info">
                      <span className="token-symbol">{token.symbol}</span>
                      <span className="token-name">{token.name}</span>
                    </div>
                    <div className="token-balance">
                      {tokensLoading ? 'loading...' : formatBalance(token.formattedBalance)}
                    </div>
                    <button
                      onClick={() => removeToken(token.address)}
                      className="remove-token-btn"
                      title="Remove token"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="actions-section">
            <button
              onClick={() => setShowSweepModal(true)}
              className="sweep-button"
              disabled={nativeBalance === 0n && tokensWithBalance.length === 0}
            >
              📤 TRANSFER
            </button>
            <p className="sweep-hint">
              Send funds to an external wallet
            </p>
          </div>
        </div>

        <div className="scanlines" />
      </div>

      {/* Modals */}
      {showAddToken && (
        <AddToken
          onAdd={addToken}
          onClose={() => setShowAddToken(false)}
        />
      )}

      {showSweepModal && walletAddress && (
        <SweepModal
          adapter={adapter}
          chainId={chainId}
          walletAddress={walletAddress}
          nativeBalance={nativeBalance}
          tokenBalances={tokensWithBalance}
          onClose={() => setShowSweepModal(false)}
          onComplete={handleRefresh}
        />
      )}
    </div>
  );
}
