/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_URL: string;
  readonly VITE_API_PATH: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_DEV_MODE: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_AUTH_STORAGE_KEY: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_HF_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
