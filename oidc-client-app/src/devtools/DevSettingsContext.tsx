// [DEV PURPOSE] Runtime-editable settings for the configuration panel.
// The application never imports this — it reads `useSettings()` instead.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { envSettings, TactnaSettings } from '../auth/settings';
import { presetConfigs } from './presets';

/** The fields the panel can edit. Everything else stays as configured in .env. */
export type EditableSettings = Pick<
  TactnaSettings,
  | 'authority'
  | 'clientId'
  | 'redirectUri'
  | 'signupEndpoint'
  | 'postSignupRedirectUri'
  | 'audience'
  | 'teamId'
  | 'federationId'
>;

export interface NamedConfig extends EditableSettings {
  name: string;
  /** Came from VITE_OIDC_CONFIGS, so it is read-only and not persisted. */
  isFromEnv?: boolean;
}

interface DevSettingsContextType {
  /** What the app runs with: .env, with the panel's edits applied. */
  settings: TactnaSettings;
  updateSettings: (updates: Partial<EditableSettings>) => void;
  savedConfigs: NamedConfig[];
  currentConfigName: string | null;
  saveCurrentConfig: (name: string) => void;
  loadConfig: (name: string) => void;
  deleteConfig: (name: string) => void;
}

const DevSettingsContext = createContext<DevSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'oidc_config';
const SAVED_CONFIGS_KEY = 'oidc_saved_configs';
const CURRENT_CONFIG_NAME_KEY = 'oidc_current_config_name';
const DEFAULT_CONFIG_NAME = 'Default';

const read = <T,>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage:`, error);
    return null;
  }
};

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to localStorage:`, error);
  }
};

const editableOf = (settings: TactnaSettings): EditableSettings => ({
  authority: settings.authority,
  clientId: settings.clientId,
  redirectUri: settings.redirectUri,
  signupEndpoint: settings.signupEndpoint,
  postSignupRedirectUri: settings.postSignupRedirectUri,
  audience: settings.audience,
  teamId: settings.teamId,
  federationId: settings.federationId,
});

/** Presets from .env plus the ones saved here, with a "Default" from .env. */
const loadSavedConfigs = (): NamedConfig[] => {
  const fromEnv: NamedConfig[] = presetConfigs.map((config) => ({ ...config, isFromEnv: true }));
  const local = read<NamedConfig[]>(SAVED_CONFIGS_KEY) ?? [];
  const merged = [...fromEnv, ...local.filter((c) => !fromEnv.some((e) => e.name === c.name))];
  return merged.some((c) => c.name === DEFAULT_CONFIG_NAME)
    ? merged
    : [...merged, { name: DEFAULT_CONFIG_NAME, ...editableOf(envSettings) }];
};

const saveSavedConfigs = (configs: NamedConfig[]): void => {
  // Env presets are not persisted: they come from VITE_OIDC_CONFIGS.
  write(SAVED_CONFIGS_KEY, configs.filter((c) => !c.isFromEnv));
};

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its context
export const useDevSettings = () => {
  const context = useContext(DevSettingsContext);
  if (!context) {
    throw new Error('useDevSettings must be used within DevSettingsProvider');
  }
  return context;
};

export const DevSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = read<Partial<EditableSettings>>(STORAGE_KEY);
  const [initialConfigs] = useState(loadSavedConfigs);

  // `?clientId=` selects a saved config.
  const urlClientId = new URLSearchParams(window.location.search).get('clientId');
  const urlMatched = urlClientId ? initialConfigs.find((c) => c.clientId === urlClientId) : undefined;

  const [edits, setEdits] = useState<EditableSettings>(() => ({
    ...editableOf(envSettings),
    ...stored,
    ...(urlMatched ? editableOf({ ...envSettings, ...urlMatched }) : {}),
    // The URL always wins for these two: an explicit request must not lose to
    // what a previous visit left in localStorage.
    ...(envSettings.teamId ? { teamId: envSettings.teamId } : {}),
    ...(envSettings.federationId ? { federationId: envSettings.federationId } : {}),
  }));
  const [savedConfigs, setSavedConfigs] = useState<NamedConfig[]>(initialConfigs);
  const [currentConfigName, setCurrentConfigName] = useState<string | null>(
    urlMatched?.name ?? localStorage.getItem(CURRENT_CONFIG_NAME_KEY),
  );

  useEffect(() => {
    // `teamId` / `federationId` are per-visit requests, not configuration:
    // persisting them would make this browser ask for the same team for whoever
    // signs in next, which is the trap the README warns about. A named config
    // may still pin them, because that is an explicit choice.
    write(STORAGE_KEY, { ...edits, teamId: '', federationId: '' });
  }, [edits]);
  useEffect(() => {
    if (currentConfigName) {
      localStorage.setItem(CURRENT_CONFIG_NAME_KEY, currentConfigName);
    } else {
      localStorage.removeItem(CURRENT_CONFIG_NAME_KEY);
    }
  }, [currentConfigName]);

  const updateSettings = useCallback((updates: Partial<EditableSettings>) => {
    setEdits((current) => ({ ...current, ...updates }));
  }, []);

  const saveCurrentConfig = useCallback(
    (name: string) => {
      setSavedConfigs((configs) => {
        const updated = [...configs.filter((c) => c.name !== name), { name, ...edits }];
        saveSavedConfigs(updated);
        return updated;
      });
      setCurrentConfigName(name);
    },
    [edits],
  );

  const loadConfig = useCallback(
    (name: string) => {
      const config = savedConfigs.find((c) => c.name === name);
      if (!config) return;
      setEdits(editableOf({ ...envSettings, ...config }));
      setCurrentConfigName(name);
    },
    [savedConfigs],
  );

  const deleteConfig = useCallback(
    (name: string) => {
      setSavedConfigs((configs) => {
        if (configs.find((c) => c.name === name)?.isFromEnv) return configs;
        const updated = configs.filter((c) => c.name !== name);
        saveSavedConfigs(updated);
        return updated;
      });
      setCurrentConfigName((current) => (current === name ? null : current));
    },
    [],
  );

  const value = useMemo<DevSettingsContextType>(
    () => ({
      settings: { ...envSettings, ...edits, appName: currentConfigName ?? envSettings.appName },
      updateSettings,
      savedConfigs,
      currentConfigName,
      saveCurrentConfig,
      loadConfig,
      deleteConfig,
    }),
    [edits, currentConfigName, savedConfigs, updateSettings, saveCurrentConfig, loadConfig, deleteConfig],
  );

  return <DevSettingsContext.Provider value={value}>{children}</DevSettingsContext.Provider>;
};
