import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbi, encodeFunctionData, isAddress, parseUnits, formatUnits, formatEther } from 'viem';
import { SUPPORTED_CHAINS, getExplorerTxUrl } from '../chains/config';
import type { MPCAdapter } from '../adapters/types';
import type { TokenBalance } from '../hooks/useTokens';
import './SweepModal.css';

const ERC20_TRANSFER_ABI = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);

interface SweepModalProps {
  adapter: MPCAdapter;
  chainId: number;
  walletAddress: `0x${string}`;
  nativeBalance: bigint;
  tokenBalances: TokenBalance[];
  onClose: () => void;
  onComplete: () => void;
}

interface TransferItem {
  type: 'native' | 'token';
  symbol: string;
  address?: `0x${string}`;
  decimals: number;
  balance: bigint;
  amount: string; // User input
  enabled: boolean;
}

interface TxResult {
  type: 'native' | 'token';
  symbol: string;
  hash: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export function SweepModal({
  adapter,
  chainId,
  walletAddress,
  nativeBalance,
  tokenBalances,
  onClose,
  onComplete,
}: SweepModalProps) {
  const [destination, setDestination] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'executing' | 'complete'>('input');
  const [results, setResults] = useState<TxResult[]>([]);
  const [error, setError] = useState('');
  const [transfers, setTransfers] = useState<TransferItem[]>([]);

  const chainConfig = SUPPORTED_CHAINS[chainId];

  // Initialize transfer items from balances
  useEffect(() => {
    const items: TransferItem[] = [];

    // Add native balance
    if (nativeBalance > 0n) {
      items.push({
        type: 'native',
        symbol: chainConfig.nativeCurrency.symbol,
        decimals: 18,
        balance: nativeBalance,
        amount: formatEther(nativeBalance),
        enabled: true,
      });
    }

    // Add tokens
    tokenBalances.forEach((token) => {
      if (token.balance > 0n) {
        items.push({
          type: 'token',
          symbol: token.symbol,
          address: token.address,
          decimals: token.decimals,
          balance: token.balance,
          amount: token.formattedBalance,
          enabled: true,
        });
      }
    });

    setTransfers(items);
  }, [nativeBalance, tokenBalances, chainConfig]);

  const updateTransfer = (index: number, updates: Partial<TransferItem>) => {
    setTransfers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const setMaxAmount = (index: number) => {
    const item = transfers[index];
    const formatted = item.type === 'native' 
      ? formatEther(item.balance)
      : formatUnits(item.balance, item.decimals);
    updateTransfer(index, { amount: formatted });
  };

  const validateAddress = (addr: string): boolean => {
    return isAddress(addr) && addr.toLowerCase() !== walletAddress.toLowerCase();
  };

  const getEnabledTransfers = () => transfers.filter((t) => t.enabled && parseFloat(t.amount) > 0);

  const handleProceed = () => {
    if (!validateAddress(destination)) {
      setError('Invalid destination address');
      return;
    }

    const enabled = getEnabledTransfers();
    if (enabled.length === 0) {
      setError('No assets selected for transfer');
      return;
    }

    // Validate amounts
    for (const item of enabled) {
      try {
        const parsed = item.type === 'native'
          ? parseUnits(item.amount, 18)
          : parseUnits(item.amount, item.decimals);
        
        if (parsed > item.balance) {
          setError(`${item.symbol} amount exceeds balance`);
          return;
        }
        if (parsed <= 0n) {
          setError(`${item.symbol} amount must be greater than 0`);
          return;
        }
      } catch {
        setError(`Invalid amount for ${item.symbol}`);
        return;
      }
    }

    setError('');
    setStep('confirm');
  };

  const executeTransfer = async () => {
    setStep('executing');
    const txResults: TxResult[] = [];

    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.rpcUrl),
    });

    const enabledTransfers = getEnabledTransfers();

    // Transfer tokens first
    for (const item of enabledTransfers.filter((t) => t.type === 'token')) {
      const result: TxResult = {
        type: 'token',
        symbol: item.symbol,
        hash: '',
        status: 'pending',
      };
      txResults.push(result);
      setResults([...txResults]);

      try {
        const amount = parseUnits(item.amount, item.decimals);
        const data = encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [destination as `0x${string}`, amount],
        });

        const hash = await adapter.sendTransaction({
          to: item.address!,
          data,
        });

        result.hash = hash;
        result.status = 'success';
      } catch (err: any) {
        result.status = 'failed';
        result.error = err.message || 'Transaction failed';
      }

      setResults([...txResults]);
    }

    // Transfer native balance
    const nativeItem = enabledTransfers.find((t) => t.type === 'native');
    if (nativeItem) {
      const result: TxResult = {
        type: 'native',
        symbol: chainConfig.nativeCurrency.symbol,
        hash: '',
        status: 'pending',
      };
      txResults.push(result);
      setResults([...txResults]);

      try {
        let amount = parseUnits(nativeItem.amount, 18);

        // If sending max, subtract gas estimate
        if (amount === nativeBalance) {
          const gasPrice = await client.getGasPrice();
          const gasLimit = 21000n;
          const gasCost = gasPrice * gasLimit * 2n; // 2x buffer
          amount = nativeBalance - gasCost;
        }

        if (amount > 0n) {
          const hash = await adapter.sendTransaction({
            to: destination as `0x${string}`,
            value: amount,
          });

          result.hash = hash;
          result.status = 'success';
        } else {
          result.status = 'failed';
          result.error = 'Insufficient balance for gas';
        }
      } catch (err: any) {
        result.status = 'failed';
        result.error = err.message || 'Transaction failed';
      }

      setResults([...txResults]);
    }

    setStep('complete');
    onComplete();
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sweep-modal pixel-border" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 TRANSFER FUNDS</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="crt-line" />

        {step === 'input' && (
          <div className="sweep-input">
            <label htmlFor="destination" className="form-label">
              DESTINATION ADDRESS:
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="0x... (your external wallet)"
              className="pixel-input"
              autoComplete="off"
              spellCheck={false}
            />

            <div className="transfer-list">
              <div className="section-title">SELECT ASSETS & AMOUNTS:</div>
              
              {transfers.map((item, index) => (
                <div key={`${item.type}-${item.symbol}`} className={`transfer-row ${!item.enabled ? 'disabled' : ''}`}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => updateTransfer(index, { enabled: e.target.checked })}
                    />
                    <span className="token-symbol">{item.symbol}</span>
                  </label>
                  
                  <div className="amount-input-group">
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => updateTransfer(index, { amount: e.target.value })}
                      disabled={!item.enabled}
                      className="amount-input"
                      placeholder="0.0"
                    />
                    <button
                      type="button"
                      onClick={() => setMaxAmount(index)}
                      disabled={!item.enabled}
                      className="max-btn"
                    >
                      MAX
                    </button>
                  </div>
                  
                  <span className="balance-hint">
                    / {item.type === 'native' 
                      ? parseFloat(formatEther(item.balance)).toFixed(4)
                      : parseFloat(formatUnits(item.balance, item.decimals)).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="modal-actions">
              <button onClick={onClose} className="cancel-btn">
                [CANCEL]
              </button>
              <button onClick={handleProceed} className="pixel-button">
                [CONTINUE]
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="sweep-confirm">
            <div className="confirm-box">
              <div className="confirm-icon">⚠️</div>
              <p className="confirm-text">
                Confirm transfer to:
              </p>
              <div className="confirm-dest">
                <span className="address">{destination}</span>
              </div>

              <div className="confirm-summary">
                {getEnabledTransfers().map((item) => (
                  <div key={`${item.type}-${item.symbol}`} className="summary-row">
                    <span>{item.symbol}</span>
                    <span>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setStep('input')} className="cancel-btn">
                [GO BACK]
              </button>
              <button onClick={executeTransfer} className="pixel-button danger">
                [CONFIRM]
              </button>
            </div>
          </div>
        )}

        {(step === 'executing' || step === 'complete') && (
          <div className="sweep-progress">
            <div className="progress-title">
              {step === 'executing' ? 'TRANSFERRING...' : 'TRANSFER COMPLETE'}
            </div>

            <div className="tx-list">
              {results.map((tx, i) => (
                <div key={i} className={`tx-row ${tx.status}`}>
                  <div className="tx-info">
                    <span className="tx-symbol">{tx.symbol}</span>
                    <span className="tx-status">
                      {tx.status === 'pending' && '⏳'}
                      {tx.status === 'success' && '✅'}
                      {tx.status === 'failed' && '❌'}
                    </span>
                  </div>
                  {tx.hash && (
                    <a
                      href={getExplorerTxUrl(chainId, tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-hash"
                    >
                      {truncateHash(tx.hash)}
                    </a>
                  )}
                  {tx.error && <span className="tx-error">{tx.error}</span>}
                </div>
              ))}
            </div>

            {step === 'complete' && (
              <button onClick={onClose} className="pixel-button" style={{ marginTop: '1rem', width: '100%' }}>
                [CLOSE]
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
