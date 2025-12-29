import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  isLoading: boolean;
  providerName: string;
  onReset?: () => void;
  error?: string;
  onClearError?: () => void;
  appId?: string;
}

export function LoginScreen({ 
  onLogin, 
  isLoading, 
  providerName, 
  onReset,
  error,
  onClearError,
  appId,
}: LoginScreenProps) {
  // Format App ID for display (first 6...last 4 if long)
  const displayAppId = appId && appId.length > 20 
    ? `${appId.slice(0, 10)}...${appId.slice(-6)}` 
    : appId || 'NOT CONFIGURED';

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="pixel-border">
          <div className="login-header">
            <div className="logo-art">
              <pre className="ascii-art">{`
 ██████╗ ██████╗ ███████╗ █████╗ ██╗  ██╗
 ██╔══██╗██╔══██╗██╔════╝██╔══██╗██║ ██╔╝
 ██████╔╝██████╔╝█████╗  ███████║█████╔╝ 
 ██╔══██╗██╔══██╗██╔══╝  ██╔══██║██╔═██╗ 
 ██████╔╝██║  ██║███████╗██║  ██║██║  ██╗
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
              ██████╗ ██╗      █████╗ ███████╗███████╗
             ██╔════╝ ██║     ██╔══██╗██╔════╝██╔════╝
             ██║  ███╗██║     ███████║███████╗███████╗
             ██║   ██║██║     ██╔══██║╚════██║╚════██║
             ╚██████╔╝███████╗██║  ██║███████║███████║
              ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
`}</pre>
            </div>
            <p className="subtitle">RECOVER FUNDS FROM EMBEDDED WALLET</p>
          </div>

          <div className="crt-line" />

          <div className="login-content">
            <div className="status-box">
              <div className="status-row">
                <span className="status-label">PROVIDER:</span>
                <span className="status-value">{providerName.toUpperCase()}</span>
              </div>
              {appId && (
                <div className="status-row">
                  <span className="status-label">APP ID:</span>
                  <span className="status-value" title={appId}>{displayAppId}</span>
                </div>
              )}
              <div className="status-row">
                <span className="status-label">STATUS:</span>
                <span className="status-value status-ready">READY</span>
              </div>
            </div>

            <div className="instructions">
              <p>★ Use the same login method as your original app</p>
              <p>★ Your wallet will be reconstructed in-browser</p>
              <p>★ No data leaves your device</p>
            </div>

            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                <div className="error-content">
                  <strong>LOGIN FAILED</strong>
                  <p>{error}</p>
                </div>
                {onClearError && (
                  <button 
                    className="error-dismiss" 
                    onClick={onClearError}
                    title="Dismiss"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onLogin}
              disabled={isLoading}
              className="pixel-button login-button"
            >
              {isLoading ? (
                <span className="loading-text">loading...</span>
              ) : (
                <span className="button-text">[ AUTHENTICATE ]</span>
              )}
            </button>

            <p className="security-note">
              🔒 Client-side only
              <br />
              🗄️ No data is stored by us
            </p>

            {onReset && (
              <button onClick={onReset} className="reset-link">
                ← Change App ID
              </button>
            )}
          </div>
        </div>

        <div className="scanlines" />
      </div>
    </div>
  );
}
