import { useState } from 'react';
import './ConfigScreen.css';

interface ConfigScreenProps {
  onConfigure: (appId: string) => void;
  defaultAppId?: string;
}

export function ConfigScreen({ onConfigure, defaultAppId = '' }: ConfigScreenProps) {
  const [appId, setAppId] = useState(defaultAppId);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim()) {
      setError('App ID is required');
      return;
    }
    setError('');
    onConfigure(appId.trim());
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        <div className="pixel-border">
          <div className="config-header">
            <h1 className="glitch" data-text="BREAKGLASS">BREAKGLASS</h1>
            <p className="tagline">RECOVER FUNDS FROM EMBEDDED WALLET</p>
          </div>

          <div className="crt-line" />

          <div className="config-content">
            <div className="terminal-text">
              <span className="prompt">&gt;</span> SYSTEM BOOT SEQUENCE...
            </div>
            <div className="terminal-text">
              <span className="prompt">&gt;</span> MPC ADAPTER: PRIVY
            </div>
            <div className="terminal-text blink">
              <span className="prompt">&gt;</span> AWAITING APP_ID INPUT_
            </div>

            <form onSubmit={handleSubmit} className="config-form">
              <label htmlFor="appId" className="form-label">
                ENTER PRIVY APP ID:
              </label>
              <input
                type="text"
                id="appId"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="clxxxxxxxxxxxxxxxxxx"
                className="pixel-input"
                autoComplete="off"
                spellCheck={false}
              />
              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="pixel-button">
                <span className="button-text">[ INITIALIZE ]</span>
              </button>
            </form>

            <div className="help-text">
              <p>★ Get your App ID from dashboard.privy.io</p>
              <p>★ This domain must be whitelisted on Privy</p>
            </div>

            <footer className="built-by">
              <div className="built-by-label">FORGED IN DESPERATION BY</div>
              <div className="built-by-name">0xMythril</div>
              <div className="built-by-date">after getting funds trapped 😢 // 2025.12.29</div>
            </footer>
          </div>
        </div>

        <div className="scanlines" />
      </div>
    </div>
  );
}

