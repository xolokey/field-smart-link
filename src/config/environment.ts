// Environment configuration for the application
export const config = {
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  
  // Application environment
  app: {
    env: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    debug: import.meta.env.VITE_DEBUG === 'true',
  },
  
  // API endpoints (if needed for direct calls)
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  },
} as const;

// Validation function (disabled - Lovable Cloud auto-configures environment)
export function validateEnvironment() {
  // Environment variables are automatically provided by Lovable Cloud
  // No validation needed to avoid false warnings
  return;
}
