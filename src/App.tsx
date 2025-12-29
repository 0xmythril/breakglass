import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ConfigScreen, LoginScreen, Dashboard } from './components';
import { usePrivyAdapter } from './adapters/privy';
import { DEFAULT_CHAIN_ID } from './chains/config';
import './index.css';

// Check for environment variable
const ENV_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const STORAGE_KEY = 'breakglass_privy_app_id';

// Error context to pass errors from Privy callbacks to components
interface ErrorContextType {
  error: string;
  setError: (error: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType>({
  error: '',
  setError: () => {},
  clearError: () => {},
});

export function useLoginError() {
  return useContext(ErrorContext);
}

function parsePrivyError(error: unknown): string {
  const errorStr = String(error);
  
  // Check for common Privy error patterns
  if (errorStr.includes('not allowed')) {
    const match = errorStr.match(/Login with (\w+) not allowed/);
    if (match) {
      return `${match[1]} login is not enabled for this app. Try a different login method, or contact the app owner.`;
    }
    return 'This login method is not enabled for this app. Try a different method.';
  }
  
  if (errorStr.includes('403')) {
    return 'Login method not authorized. The app owner may need to enable this login method in their Privy dashboard.';
  }
  
  if (errorStr.includes('domain') || errorStr.includes('origin')) {
    return 'This domain is not whitelisted. The app owner needs to add this URL to their allowed domains.';
  }
  
  if (errorStr.includes('network') || errorStr.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (errorStr.includes('cancelled') || errorStr.includes('canceled') || errorStr.includes('closed')) {
    return ''; // User cancelled, no error to show
  }
  
  if (errorStr.includes('popup') || errorStr.includes('blocked')) {
    return 'Popup was blocked. Please allow popups for this site and try again.';
  }
  
  // Generic fallback
  return 'Authentication failed. Please try again or use a different login method.';
}

function getStoredAppId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function storeAppId(appId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, appId);
  } catch {
    // localStorage not available
  }
}

function clearStoredAppId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

// Component that handles error listening - must be inside PrivyProvider
function PrivyErrorHandler({ onError }: { onError: (error: string) => void }) {
  const { logout } = usePrivy();

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorStr = String(event.reason);
      
      // Check if this is a Privy login error
      if (errorStr.includes('Login with') && errorStr.includes('not allowed')) {
        event.preventDefault(); // Prevent console error
        const parsedError = parsePrivyError(event.reason);
        if (parsedError) {
          // Close Privy modal by triggering logout (resets state)
          // This is a workaround since Privy doesn't expose a closeModal function
          logout().catch(() => {}); // Ignore logout errors
          onError(parsedError);
        }
      } else if (errorStr.includes('privy') || errorStr.includes('oauth/init')) {
        event.preventDefault();
        const parsedError = parsePrivyError(event.reason);
        if (parsedError) {
          logout().catch(() => {});
          onError(parsedError);
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [logout, onError]);

  return null;
}

function AppContent({ onReset, appId }: { onReset: () => void; appId: string }) {
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const adapter = usePrivyAdapter(chainId);
  const { error, clearError } = useLoginError();

  // Show loading state while Privy initializes
  if (adapter.isLoading) {
    return <div className="loading">INITIALIZING</div>;
  }

  // If not authenticated, show login screen
  if (!adapter.isAuthenticated) {
    return (
      <LoginScreen
        onLogin={adapter.login}
        isLoading={adapter.isLoading}
        providerName={adapter.providerName}
        onReset={onReset}
        error={error}
        onClearError={clearError}
        appId={appId}
      />
    );
  }

  // Show dashboard
  return (
    <Dashboard
      adapter={adapter}
      chainId={chainId}
      onChainChange={setChainId}
    />
  );
}

function PrivyWrapper({ appId, onReset }: { appId: string; onReset: () => void }) {
  const [error, setError] = useState('');

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const clearError = () => setError('');

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      <PrivyProvider
        appId={appId}
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#00ff88',
          },
          loginMethods: ['email', 'google', 'apple', 'twitter', 'discord'],
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        <PrivyErrorHandler onError={handleError} />
        <AppContent onReset={onReset} appId={appId} />
      </PrivyProvider>
    </ErrorContext.Provider>
  );
}

export default function App() {
  const storedAppId = getStoredAppId();
  const initialAppId = ENV_APP_ID || storedAppId || '';
  const initialConfigured = !!(ENV_APP_ID || storedAppId);

  const [appId, setAppId] = useState<string>(initialAppId);
  const [isConfigured, setIsConfigured] = useState(initialConfigured);

  const handleConfigure = (id: string) => {
    setAppId(id);
    storeAppId(id);
    setIsConfigured(true);
  };

  const handleReset = () => {
    clearStoredAppId();
    setAppId('');
    setIsConfigured(false);
  };

  // If not configured, show config screen
  if (!isConfigured) {
    return <ConfigScreen onConfigure={handleConfigure} defaultAppId={appId} />;
  }

  return <PrivyWrapper appId={appId} onReset={handleReset} />;
}
