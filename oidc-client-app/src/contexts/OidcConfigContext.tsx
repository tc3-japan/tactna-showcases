// [DEV PURPOSE]
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AuthProviderProps } from 'react-oidc-context';
import { User } from 'oidc-client-ts';
import { appConfig, envConfigs } from '../config';

interface SavedConfig {
  name: string;
  authority: string;
  clientId: string;
  redirectUri: string;
  signupEndpoint: string;
  postSignupRedirectUri: string;
  audience: string;
  teamId: string;
  isFromEnv?: boolean; // Flag to indicate if config is from environment variables
}

interface OidcConfigContextType {
  config: AuthProviderProps;
  authority: string;
  clientId: string;
  redirectUri: string;
  signupEndpoint: string;
  postSignupRedirectUri: string;
  audience: string;
  teamId: string;
  updateConfig: (updates: {
    authority?: string;
    clientId?: string;
    redirectUri?: string;
    signupEndpoint?: string;
    postSignupRedirectUri?: string;
    audience?: string;
    teamId?: string;
  }) => void;
  savedConfigs: SavedConfig[];
  currentConfigName: string | null;
  saveCurrentConfig: (name: string) => void;
  loadConfig: (name: string) => void;
  deleteConfig: (name: string) => void;
}

const OidcConfigContext = createContext<OidcConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'oidc_config';
const SAVED_CONFIGS_KEY = 'oidc_saved_configs';
const CURRENT_CONFIG_NAME_KEY = 'oidc_current_config_name';

interface StoredConfig {
  authority: string;
  clientId: string;
  redirectUri: string;
  signupEndpoint: string;
  postSignupRedirectUri: string;
  audience: string;
  teamId: string;
}

const loadFromStorage = (): Partial<StoredConfig> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load OIDC config from localStorage:', error);
    return null;
  }
};

const saveToStorage = (config: StoredConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save OIDC config to localStorage:', error);
  }
};

const loadSavedConfigs = (): SavedConfig[] => {
  try {
    const stored = localStorage.getItem(SAVED_CONFIGS_KEY);
    const localConfigs = stored ? JSON.parse(stored) : [];

    // Merge with environment configs
    const envConfigsMapped: SavedConfig[] = envConfigs.map(config => ({
      name: config.name,
      authority: config.authority,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      signupEndpoint: config.signupEndpoint,
      postSignupRedirectUri: config.postSignupRedirectUri,
      audience: config.audience,
      teamId: config.teamId,
      isFromEnv: true, // Mark as environment config
    }));

    // Merge: env configs take precedence over local configs with same name
    const mergedConfigs = [...envConfigsMapped];
    localConfigs.forEach((localConfig: SavedConfig) => {
      if (!mergedConfigs.some(c => c.name === localConfig.name)) {
        mergedConfigs.push(localConfig);
      }
    });

    return mergedConfigs;
  } catch (error) {
    console.error('Failed to load saved configs from localStorage:', error);
    return [];
  }
};

const saveSavedConfigs = (configs: SavedConfig[]): void => {
  try {
    // Filter out environment configs before saving to localStorage
    // Environment configs should not be persisted as they come from .env
    const envConfigNames = envConfigs.map(c => c.name);
    const localOnlyConfigs = configs.filter(c => !envConfigNames.includes(c.name));
    localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(localOnlyConfigs));
  } catch (error) {
    console.error('Failed to save configs to localStorage:', error);
  }
};

const loadCurrentConfigName = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_CONFIG_NAME_KEY);
  } catch (error) {
    console.error('Failed to load current config name from localStorage:', error);
    return null;
  }
};

const saveCurrentConfigName = (name: string | null): void => {
  try {
    if (name) {
      localStorage.setItem(CURRENT_CONFIG_NAME_KEY, name);
    } else {
      localStorage.removeItem(CURRENT_CONFIG_NAME_KEY);
    }
  } catch (error) {
    console.error('Failed to save current config name to localStorage:', error);
  }
};

export const useOidcConfig = () => {
  const context = useContext(OidcConfigContext);
  if (!context) {
    throw new Error('useOidcConfig must be used within OidcConfigProvider');
  }
  return context;
};

interface OidcConfigProviderProps {
  children: React.ReactNode;
  initialAuthority?: string;
  initialClientId?: string;
  initialRedirectUri?: string;
  initialSignupEndpoint?: string;
  initialPostSignupRedirectUri?: string;
  initialAudience?: string;
  initialTeamId?: string;
}

export const OidcConfigProvider: React.FC<OidcConfigProviderProps> = ({
  children,
  initialAuthority = appConfig.authority,
  initialClientId = appConfig.clientId,
  initialRedirectUri = appConfig.redirectUri,
  initialSignupEndpoint = appConfig.signupEndpoint,
  initialPostSignupRedirectUri = appConfig.postSignupRedirectUri,
  initialAudience = appConfig.audience,
  initialTeamId = '',
}) => {
  // Load from localStorage or use initial values
  const storedConfig = loadFromStorage();

  const [authority, setAuthority] = useState(storedConfig?.authority ?? initialAuthority);
  const [clientId, setClientId] = useState(storedConfig?.clientId ?? initialClientId);
  const [redirectUri, setRedirectUri] = useState(storedConfig?.redirectUri ?? initialRedirectUri);
  const [signupEndpoint, setSignupEndpoint] = useState(storedConfig?.signupEndpoint ?? initialSignupEndpoint);
  const [postSignupRedirectUri, setPostSignupRedirectUri] = useState(storedConfig?.postSignupRedirectUri ?? initialPostSignupRedirectUri);
  const [audience, setAudience] = useState(storedConfig?.audience ?? initialAudience);
  const [teamId, setTeamId] = useState(storedConfig?.teamId ?? initialTeamId);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>(() => loadSavedConfigs());
  const [currentConfigName, setCurrentConfigName] = useState<string | null>(() => loadCurrentConfigName());

  // Save to localStorage whenever config values change
  useEffect(() => {
    saveToStorage({
      authority,
      clientId,
      redirectUri,
      signupEndpoint,
      postSignupRedirectUri,
      audience,
      teamId,
    });
  }, [authority, clientId, redirectUri, signupEndpoint, postSignupRedirectUri, audience, teamId]);

  // Save current config name to localStorage whenever it changes
  useEffect(() => {
    saveCurrentConfigName(currentConfigName);
  }, [currentConfigName]);

  // Load the last selected config on initial mount
  useEffect(() => {
    const lastConfigName = loadCurrentConfigName();
    if (lastConfigName) {
      const config = savedConfigs.find(c => c.name === lastConfigName);
      if (config) {
        setAuthority(config.authority);
        setClientId(config.clientId);
        setRedirectUri(config.redirectUri);
        setSignupEndpoint(config.signupEndpoint);
        setPostSignupRedirectUri(config.postSignupRedirectUri);
        setAudience(config.audience);
        setTeamId(config.teamId);
      }
    }
  }, []); // Run only once on mount

  // Create default configuration on initial load if it doesn't exist
  useEffect(() => {
    const hasDefault = savedConfigs.some(config => config.name === "Default");
    if (!hasDefault) {
      const defaultConfig: SavedConfig = {
        name: "Default",
        authority: initialAuthority,
        clientId: initialClientId,
        redirectUri: initialRedirectUri,
        signupEndpoint: initialSignupEndpoint,
        postSignupRedirectUri: initialPostSignupRedirectUri,
        audience: initialAudience,
        teamId: initialTeamId,
      };
      const updatedConfigs = [...savedConfigs, defaultConfig];
      setSavedConfigs(updatedConfigs);
      saveSavedConfigs(updatedConfigs);
    }
  }, []); // Run only once on mount

  const updateConfig = useCallback((updates: {
    authority?: string;
    clientId?: string;
    redirectUri?: string;
    signupEndpoint?: string;
    postSignupRedirectUri?: string;
    audience?: string;
    teamId?: string;
  }) => {
    if (updates.authority !== undefined) setAuthority(updates.authority);
    if (updates.clientId !== undefined) setClientId(updates.clientId);
    if (updates.redirectUri !== undefined) setRedirectUri(updates.redirectUri);
    if (updates.signupEndpoint !== undefined) setSignupEndpoint(updates.signupEndpoint);
    if (updates.postSignupRedirectUri !== undefined) setPostSignupRedirectUri(updates.postSignupRedirectUri);
    if (updates.audience !== undefined) setAudience(updates.audience);
    if (updates.teamId !== undefined) setTeamId(updates.teamId);
  }, []);

  const saveCurrentConfig = useCallback((name: string) => {
    const newConfig: SavedConfig = {
      name,
      authority,
      clientId,
      redirectUri,
      signupEndpoint,
      postSignupRedirectUri,
      audience,
      teamId,
    };

    const updatedConfigs = [...savedConfigs.filter(c => c.name !== name), newConfig];
    setSavedConfigs(updatedConfigs);
    saveSavedConfigs(updatedConfigs);
    setCurrentConfigName(name);
  }, [authority, clientId, redirectUri, signupEndpoint, postSignupRedirectUri, audience, teamId, savedConfigs]);

  const loadConfig = useCallback((name: string) => {
    const config = savedConfigs.find(c => c.name === name);
    if (config) {
      setAuthority(config.authority);
      setClientId(config.clientId);
      setRedirectUri(config.redirectUri);
      setSignupEndpoint(config.signupEndpoint);
      setPostSignupRedirectUri(config.postSignupRedirectUri);
      setAudience(config.audience);
      setTeamId(config.teamId);
      setCurrentConfigName(name);
    }
  }, [savedConfigs]);

  const deleteConfig = useCallback((name: string) => {
    // Prevent deletion of environment configs
    const configToDelete = savedConfigs.find(c => c.name === name);
    if (configToDelete?.isFromEnv) {
      console.warn(`Cannot delete environment config: ${name}`);
      return;
    }

    const updatedConfigs = savedConfigs.filter(c => c.name !== name);
    setSavedConfigs(updatedConfigs);
    saveSavedConfigs(updatedConfigs);
    // Clear current config name if we deleted the currently selected config
    if (currentConfigName === name) {
      setCurrentConfigName(null);
    }
  }, [savedConfigs, currentConfigName]);

  const config: AuthProviderProps = useMemo(() => {
    const extraQueryParams: Record<string, string> = {};

    // Only add audience if it's not blank
    if (audience && audience.trim().length > 0) {
      extraQueryParams.audience = audience;
    }

    // Only add team_id if it's not blank
    if (teamId && teamId.trim().length > 0) {
      extraQueryParams.team_id = teamId;
    }

    return {
      authority,
      client_id: clientId,
      redirect_uri: redirectUri,
      post_logout_redirect_uri: appConfig.postSignupRedirectUri,
      scope: 'openid email',
      extraQueryParams,
      onSigninCallback: (user: User | void): void => {
        const redirectUri = user?.state as string | undefined;
        if (redirectUri && redirectUri.length > 0) {
          window.location.replace(redirectUri);
        }
      },
    };
  }, [authority, clientId, redirectUri, audience, teamId]);

  const contextValue = useMemo(() => ({
    config,
    authority,
    clientId,
    redirectUri,
    signupEndpoint,
    postSignupRedirectUri,
    audience,
    teamId,
    updateConfig,
    savedConfigs,
    currentConfigName,
    saveCurrentConfig,
    loadConfig,
    deleteConfig,
  }), [config, authority, clientId, redirectUri, signupEndpoint, postSignupRedirectUri, audience, teamId, updateConfig, savedConfigs, currentConfigName, saveCurrentConfig, loadConfig, deleteConfig]);

  return (
    <OidcConfigContext.Provider value={contextValue}>
      {children}
    </OidcConfigContext.Provider>
  );
};
