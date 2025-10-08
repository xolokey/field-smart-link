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

// Validation function to ensure required environment variables are present
export function validateEnvironment() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];
  const missing = required.filter((key) => !import.meta.env[key as any]);
  if (missing.length > 0) {
    // Don't crash the app; log a clear warning instead so preview keeps working
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. ` +
      'The app will run in a degraded mode. Configure them in Project Settings > Environment.'
    );
    return;
  }
}

// Call validation in development
if (config.app.isDevelopment) {
  validateEnvironment();
}