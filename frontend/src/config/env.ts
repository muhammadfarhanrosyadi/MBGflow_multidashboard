/**
 * src/config/env.ts
 * Centralized, type-safe environment variable access.
 * All VITE_* variables are validated here at startup.
 */

function requireEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    if (fallback !== undefined) return fallback;
    console.warn(`[env] Missing environment variable: ${key}`);
    return '';
  }
  return value;
}

export const ENV = {
  /** Base URL for this project's own backend API */
  API_BASE_URL:    requireEnv('VITE_API_BASE_URL', 'http://localhost:5000/api'),

  /** External microservice module URLs */
  API_PRODUKSI:    requireEnv('VITE_API_PRODUKSI',  'https://mbgflow.pages.dev'),
  API_BAHAN_BAKU:  requireEnv('VITE_API_BAHAN_BAKU', 'https://f6618628.scm-mbg.pages.dev'),
  API_MENU:        requireEnv('VITE_API_MENU',       'https://modul-analisis-gizi-mbgflow-production.up.railway.app'),
  API_LOGISTIK:    requireEnv('VITE_API_LOGISTIK',   'https://scm-modullogistik.vercel.app'),

  /** App config */
  APP_NAME:             requireEnv('VITE_APP_NAME',           'SCM Master Admin MBG'),
  TOKEN_KEY:            requireEnv('VITE_TOKEN_KEY',          'scm_token'),
  REFRESH_INTERVAL_MS:  Number(requireEnv('VITE_REFRESH_INTERVAL_MS', '30000')),

  /** Runtime flags */
  IS_DEV:  import.meta.env.DEV  as boolean,
  IS_PROD: import.meta.env.PROD as boolean,
} as const;

export default ENV;
