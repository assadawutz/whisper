export type LlmProvider =
  | "openai"
  | "gemini"
  | "anthropic"
  | "azure"
  | "custom";

export type ProviderConfig = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeout?: number;
};

export type WhisperConfig = {
  llmProvider: LlmProvider;
  providers: Record<LlmProvider, Partial<ProviderConfig>>;
  activeProfile?: string;
  preferences: {
    autoSave: boolean;
    theme: "light" | "dark" | "auto";
    editorFontSize: number;
    enableTelemetry: boolean;
    maxWorkspaces: number;
    cacheEnabled: boolean;
  };
  experimental: {
    enabled: boolean;
    features: string[];
  };
  version: string;
};

const KEY = "whisper.ide.config.v2";
const PROFILES_KEY = "whisper.ide.profiles.v1";
const ENCRYPTED_KEY_PREFIX = "whisper.encrypted.";

// Default configuration
const DEFAULT_CONFIG: WhisperConfig = {
  llmProvider: "openai",
  providers: {
    openai: { model: "gpt-4o-mini", temperature: 0.7, maxTokens: 4000 },
    gemini: {
      model: "gemini-2.0-flash-exp",
      temperature: 0.7,
      maxTokens: 4000,
    },
    anthropic: {
      model: "claude-3-5-sonnet-20241022",
      temperature: 0.7,
      maxTokens: 4000,
    },
    azure: {},
    custom: {},
  },
  preferences: {
    autoSave: true,
    theme: "auto",
    editorFontSize: 14,
    enableTelemetry: false,
    maxWorkspaces: 20,
    cacheEnabled: true,
  },
  experimental: {
    enabled: false,
    features: [],
  },
  version: "2.0.0",
};

// Simple encryption (for demo - use proper encryption in production)
function encryptValue(value: string): string {
  return btoa(value);
}

function decryptValue(value: string): string {
  try {
    return atob(value);
  } catch {
    return value;
  }
}

export function loadConfig(): WhisperConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_CONFIG);

    const parsed = JSON.parse(raw) as Partial<WhisperConfig>;

    // Decrypt sensitive data
    if (parsed.providers) {
      Object.keys(parsed.providers).forEach((provider) => {
        const providerKey = provider as LlmProvider;
        if (parsed.providers![providerKey]?.apiKey) {
          const encrypted = localStorage.getItem(
            `${ENCRYPTED_KEY_PREFIX}${provider}`,
          );
          if (encrypted) {
            parsed.providers![providerKey]!.apiKey = decryptValue(encrypted);
          }
        }
      });
    }

    // Merge with defaults to handle version upgrades
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      providers: {
        ...DEFAULT_CONFIG.providers,
        ...parsed.providers,
      },
      preferences: {
        ...DEFAULT_CONFIG.preferences,
        ...parsed.preferences,
      },
      experimental: {
        ...DEFAULT_CONFIG.experimental,
        ...parsed.experimental,
      },
    };
  } catch (err) {
    console.error("[ConfigStore] Load error:", err);
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(cfg: WhisperConfig) {
  try {
    // Encrypt and separate API keys
    const toSave = structuredClone(cfg);
    Object.keys(toSave.providers).forEach((provider) => {
      const providerKey = provider as LlmProvider;
      if (toSave.providers[providerKey]?.apiKey) {
        const apiKey = toSave.providers[providerKey]!.apiKey!;
        localStorage.setItem(
          `${ENCRYPTED_KEY_PREFIX}${provider}`,
          encryptValue(apiKey),
        );
        delete toSave.providers[providerKey]!.apiKey;
      }
    });

    localStorage.setItem(KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error("[ConfigStore] Save error:", err);
  }
}

export function validateConfig(cfg: WhisperConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check active provider has API key
  const activeProvider = cfg.providers[cfg.llmProvider];
  if (!activeProvider?.apiKey) {
    errors.push(`Active provider '${cfg.llmProvider}' requires an API key`);
  }

  if (!activeProvider?.model) {
    errors.push(`Active provider '${cfg.llmProvider}' requires a model`);
  }

  // Validate preferences
  if (
    cfg.preferences.editorFontSize < 8 ||
    cfg.preferences.editorFontSize > 32
  ) {
    errors.push("Editor font size must be between 8 and 32");
  }

  if (
    cfg.preferences.maxWorkspaces < 1 ||
    cfg.preferences.maxWorkspaces > 100
  ) {
    errors.push("Max workspaces must be between 1 and 100");
  }

  return { valid: errors.length === 0, errors };
}

// Profile management
export type ConfigProfile = {
  id: string;
  name: string;
  config: WhisperConfig;
  createdAt: number;
  updatedAt: number;
};

export function loadProfiles(): ConfigProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProfile(profile: ConfigProfile) {
  const profiles = loadProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);

  if (index >= 0) {
    profiles[index] = { ...profile, updatedAt: Date.now() };
  } else {
    profiles.push({ ...profile, createdAt: Date.now(), updatedAt: Date.now() });
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function deleteProfile(profileId: string) {
  const profiles = loadProfiles().filter((p) => p.id !== profileId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function loadProfile(profileId: string): WhisperConfig | null {
  const profiles = loadProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  return profile ? profile.config : null;
}

// Export/Import configuration
export function exportConfig(cfg: WhisperConfig): string {
  const exported = structuredClone(cfg);
  // Remove sensitive data from export
  Object.keys(exported.providers).forEach((provider) => {
    const providerKey = provider as LlmProvider;
    if (exported.providers[providerKey]?.apiKey) {
      exported.providers[providerKey]!.apiKey = "[REDACTED]";
    }
  });
  return JSON.stringify(exported, null, 2);
}

export function importConfig(jsonStr: string): {
  success: boolean;
  config?: WhisperConfig;
  error?: string;
} {
  try {
    const imported = JSON.parse(jsonStr) as WhisperConfig;
    const validation = validateConfig(imported);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(", ") };
    }
    return { success: true, config: imported };
  } catch (err) {
    return { success: false, error: "Invalid JSON format" };
  }
}

// Reset to defaults
export function resetConfig() {
  localStorage.removeItem(KEY);
  // Clear encrypted keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(ENCRYPTED_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// Get active provider config
export function getActiveProviderConfig(
  cfg: WhisperConfig,
): ProviderConfig | null {
  return (cfg.providers[cfg.llmProvider] as ProviderConfig) || null;
}
