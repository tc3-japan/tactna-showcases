// [DEV PURPOSE] Named configurations offered by the panel, from VITE_OIDC_CONFIGS.
import { EditableSettings } from './DevSettingsContext';

export interface PresetConfig extends EditableSettings {
  name: string;
}

const parse = (): PresetConfig[] => {
  const json = import.meta.env.VITE_OIDC_CONFIGS;
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      console.warn('VITE_OIDC_CONFIGS is not an array');
      return [];
    }
    // `federationId` was added later, so older configurations omit it.
    return parsed.map((c: PresetConfig) => ({ ...c, federationId: c.federationId ?? '' }));
  } catch (error) {
    console.error('Failed to parse VITE_OIDC_CONFIGS:', error);
    return [];
  }
};

export const presetConfigs = parse();
