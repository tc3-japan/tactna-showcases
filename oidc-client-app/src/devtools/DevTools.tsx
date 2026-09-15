// [DEV PURPOSE] The configuration panel and the plumbing it needs.
// Deleting this folder and rendering <TactnaAuthProvider> directly leaves a
// working app — nothing under src/ outside this folder imports it.
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { TactnaAuthProvider } from '../auth/TactnaAuthProvider';
import ConfigurationPanel from './ConfigurationPanel';
import { DevSettingsProvider, useDevSettings } from './DevSettingsContext';

/** Reports when the provider has finished with any authorization response. */
const WhenReady = ({ onReady }: { onReady: () => void }) => {
  const { isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading) onReady();
  }, [isLoading, onReady]);
  return null;
};

const DevAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useDevSettings();

  // The settings are read once, when the provider builds its UserManager, so a
  // change only takes effect if the provider is re-created — which React does
  // when the key changes. Never mid-callback, though: re-creating the provider
  // while it is consuming an authorization response throws the response away.
  const configKey = Object.values(settings).join('|');
  const [activeKey, setActiveKey] = useState(configKey);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (ready && configKey !== activeKey) {
      setActiveKey(configKey);
    }
  }, [ready, configKey, activeKey]);

  return (
    <TactnaAuthProvider key={activeKey} settings={settings}>
      <WhenReady onReady={markReady} />
      {children}
    </TactnaAuthProvider>
  );
};

export const DevTools: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DevSettingsProvider>
    <ConfigurationPanel />
    <DevAuthProvider>{children}</DevAuthProvider>
  </DevSettingsProvider>
);
