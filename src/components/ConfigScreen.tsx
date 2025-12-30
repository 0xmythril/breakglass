import { useState } from 'react';
import './ConfigScreen.css';

export type MPCProvider = 'privy' | 'air' | 'web3auth' | 'turnkey' | 'dynamic' | 'magic';

interface ProviderOption {
  id: MPCProvider;
  name: string;
  available: boolean;
}

const PROVIDERS: ProviderOption[] = [
  { id: 'privy', name: 'Privy', available: true },
  { id: 'air', name: 'AIR', available: false },
  { id: 'web3auth', name: 'Web3Auth', available: false },
  { id: 'turnkey', name: 'Turnkey', available: false },
  { id: 'dynamic', name: 'Dynamic', available: false },
  { id: 'magic', name: 'Magic', available: false },
];

interface ConfigScreenProps {
  onConfigure: (provider: MPCProvider, appId: string) => void;
  defaultProvider?: MPCProvider;
  defaultAppId?: string;
}

export function ConfigScreen({ 
  onConfigure, 
  defaultProvider = 'privy',
  defaultAppId = '' 
}: ConfigScreenProps) {
  const [provider, setProvider] = useState<MPCProvider>(defaultProvider);
  const [appId, setAppId] = useState(defaultAppId);
  const [error, setError] = useState('');

  const selectedProviderInfo = PROVIDERS.find(p => p.id === provider);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.trim()) {
      setError('App ID is required');
      return;
    }
    if (!selectedProviderInfo?.available) {
      setError(`${selectedProviderInfo?.name} is coming soon`);
      return;
    }
    setError('');
    onConfigure(provider, appId.trim());
  };

  const getAppIdPlaceholder = () => {
    switch (provider) {
      case 'privy':
        return 'clxxxxxxxxxxxxxxxxxx';
      case 'air':
        return 'air_xxxxxxxxxxxxxxxxxx';
      case 'web3auth':
        return 'BPxxxxxxxxxxxxxxxxxx';
      case 'dynamic':
        return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
      case 'turnkey':
        return 'org-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
      case 'magic':
        return 'pk_live_xxxxxxxxxxxxxxxxxx';
      default:
        return 'Enter your app ID';
    }
  };

  const getHelpText = () => {
    switch (provider) {
      case 'privy':
        return (
          <>
            <p>★ Get your App ID from dashboard.privy.io</p>
            <p>★ This domain must be whitelisted on Privy</p>
          </>
        );
      case 'air':
        return (
          <>
            <p>★ Get your App ID from AIR dashboard</p>
            <p>★ This domain must be whitelisted</p>
          </>
        );
      case 'web3auth':
        return (
          <>
            <p>★ Get your Client ID from dashboard.web3auth.io</p>
            <p>★ Configure allowed origins in Web3Auth</p>
          </>
        );
      case 'dynamic':
        return (
          <>
            <p>★ Get your Environment ID from app.dynamic.xyz</p>
            <p>★ Add this domain to allowed origins</p>
          </>
        );
      case 'turnkey':
        return (
          <>
            <p>★ Get your Org ID from app.turnkey.com</p>
            <p>★ Configure allowed origins in Turnkey</p>
          </>
        );
      case 'magic':
        return (
          <>
            <p>★ Get your Publishable Key from dashboard.magic.link</p>
            <p>★ Add this domain to allowed origins</p>
          </>
        );
      default:
        return null;
    }
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
              <span className="prompt">&gt;</span> SELECT MPC PROVIDER_
            </div>

            {/* Provider Selector */}
            <div className="provider-selector">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`provider-btn ${provider === p.id ? 'selected' : ''} ${!p.available ? 'disabled' : ''}`}
                  onClick={() => p.available && setProvider(p.id)}
                  disabled={!p.available}
                >
                  <span className="provider-name">{p.name}</span>
                  {p.available ? (
                    <span className="status-live">LIVE</span>
                  ) : (
                    <span className="status-soon">SOON</span>
                  )}
                </button>
              ))}
            </div>

            <div className="terminal-text blink">
              <span className="prompt">&gt;</span> AWAITING APP_ID INPUT_
            </div>

            <form onSubmit={handleSubmit} className="config-form">
              <label htmlFor="appId" className="form-label">
                ENTER APP ID:
              </label>
              <input
                type="text"
                id="appId"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder={getAppIdPlaceholder()}
                className="pixel-input"
                autoComplete="off"
                spellCheck={false}
                disabled={!selectedProviderInfo?.available}
              />
              {error && <p className="error-text">{error}</p>}

              <button 
                type="submit" 
                className="pixel-button"
                disabled={!selectedProviderInfo?.available}
              >
                <span className="button-text">[ INITIALIZE ]</span>
              </button>
            </form>

            <div className="help-text">
              {getHelpText()}
            </div>

            <footer className="built-by">
              <div className="built-by-label">FORGED IN DESPERATION BY</div>
              <div className="built-by-name">
                <a href="https://x.com/0xmythril" target="_blank" rel="noopener noreferrer">
                  0xMythril
                </a>
              </div>
              <div className="built-by-date">after getting funds trapped 😢 // 2025.12.29</div>
            </footer>
          </div>
        </div>

        <div className="scanlines" />
      </div>
    </div>
  );
}
