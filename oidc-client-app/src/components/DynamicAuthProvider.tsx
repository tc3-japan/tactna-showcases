// [DEV PURPOSE]
import React, { useEffect, useState, useRef } from 'react';
import { AuthProvider } from 'react-oidc-context';
import { useOidcConfig } from '../contexts/OidcConfigContext';

interface DynamicAuthProviderProps {
  children: React.ReactNode;
}

export const DynamicAuthProvider: React.FC<DynamicAuthProviderProps> = ({ children }) => {
  const { config, authority, clientId, redirectUri, audience, teamId } = useOidcConfig();
  const [key, setKey] = useState(0);
  const isAuthFlowInProgress = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const previousConfigRef = useRef({ authority, clientId, redirectUri, audience, teamId });

  // Check if we're in the middle of an OAuth callback
  useEffect(() => {
    const currentUrl = window.location.href;
    const hasOAuthParams = currentUrl.includes('code=') || currentUrl.includes('state=');

    if (hasOAuthParams) {
      isAuthFlowInProgress.current = true;

      // Reset the flag after callback is processed (give it some time)
      const timer = setTimeout(() => {
        isAuthFlowInProgress.current = false;
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Mark as initialized once we have a valid config
  useEffect(() => {
    if (config && authority && clientId && !isInitialized) {
      setIsInitialized(true);
    }
  }, [config, authority, clientId, isInitialized]);

  // Force re-mount of AuthProvider when critical config changes
  // BUT only if we're not in the middle of an authentication flow
  // AND only if values actually changed (to prevent unnecessary re-mounts)
  useEffect(() => {
    if (!isInitialized) return;

    const configChanged =
      previousConfigRef.current.authority !== authority ||
      previousConfigRef.current.clientId !== clientId ||
      previousConfigRef.current.redirectUri !== redirectUri ||
      previousConfigRef.current.audience !== audience ||
      previousConfigRef.current.teamId !== teamId;

    if (configChanged && !isAuthFlowInProgress.current) {
      previousConfigRef.current = { authority, clientId, redirectUri, audience, teamId };
      setKey(prev => prev + 1);
    }
  }, [authority, clientId, redirectUri, audience, teamId, isInitialized]);

  // Don't render children until config is available
  // This ensures AuthProvider is always mounted when children try to use useAuth()
  if (!config || !authority || !clientId) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthProvider key={key} {...config}>
      {children}
    </AuthProvider>
  );
};
