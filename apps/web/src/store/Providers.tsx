"use client";
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthGate } from './AuthGate';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthGate />
      {children}
    </Provider>
  );
}
