import { useState } from 'react';
import type { TokenConfig } from '../chains/config';
import './AddToken.css';

interface AddTokenProps {
  onAdd: (address: string) => Promise<TokenConfig | null>;
  onClose: () => void;
}

export function AddToken({ onAdd, onClose }: AddTokenProps) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Address required');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await onAdd(address.trim());
    
    if (result) {
      onClose();
    } else {
      setError('Failed to add token. Check the address.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pixel-border" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ADD TOKEN</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="crt-line" />

        <form onSubmit={handleSubmit} className="add-token-form">
          <label htmlFor="tokenAddress" className="form-label">
            TOKEN CONTRACT ADDRESS:
          </label>
          <input
            type="text"
            id="tokenAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="pixel-input"
            autoComplete="off"
            spellCheck={false}
            disabled={isLoading}
          />
          
          {error && <p className="error-text">{error}</p>}

          <div className="form-hint">
            <p>★ Paste any ERC20 token contract address</p>
            <p>★ Token info will be fetched automatically</p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              [CANCEL]
            </button>
            <button type="submit" disabled={isLoading} className="pixel-button">
              {isLoading ? 'LOADING...' : '[ADD TOKEN]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

