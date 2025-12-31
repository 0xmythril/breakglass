import { createContext, useContext } from 'react';

// Error context to pass errors from Privy callbacks to components
export interface ErrorContextType {
  error: string;
  setError: (error: string) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextType>({
  error: '',
  setError: () => {},
  clearError: () => {},
});

export function useLoginError() {
  return useContext(ErrorContext);
}


