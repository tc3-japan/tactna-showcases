import React, { createContext, useContext } from 'react';
import { AuthProvider } from 'react-oidc-context';
import { buildAuthProviderProps, envSettings, TactnaSettings } from './settings';

const SettingsContext = createContext<TactnaSettings>(envSettings);

/** The settings this app is running with. */
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export const useSettings = () => useContext(SettingsContext);

interface TactnaAuthProviderProps {
  children: React.ReactNode;
  /** Defaults to the .env values; the debug panel passes its own. */
  settings?: TactnaSettings;
}

export const TactnaAuthProvider: React.FC<TactnaAuthProviderProps> = ({
  children,
  settings = envSettings,
}) => (
  <SettingsContext.Provider value={settings}>
    <AuthProvider {...buildAuthProviderProps(settings)}>{children}</AuthProvider>
  </SettingsContext.Provider>
);
