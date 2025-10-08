// Environment configuration for the application
export const config = {
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://mkwoefwcndwfxzlwfpnn.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd29lZndjbmR3Znh6bHdmcG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzQyMjUsImV4cCI6MjA3NTA1MDIyNX0.quh7s_D3ZBPgg0hg0g8nK-qvjYyVf8idhiOrGRwlavk',
  },
  
  // Application environment
  app: {
    env: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    debug: import.meta.env.VITE_DEBUG === 'true',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  },
  
  // API endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  },

  // Feature flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    pwa: import.meta.env.VITE_ENABLE_PWA !== 'false',
    offlineMode: import.meta.env.VITE_ENABLE_OFFLINE !== 'false',
    voiceFeatures: import.meta.env.VITE_ENABLE_VOICE !== 'false',
    advancedMonitoring: import.meta.env.VITE_ENABLE_MONITORING !== 'false',
  },

  // Performance thresholds
  performance: {
    maxBundleSize: 1000, // KB
    maxPageLoadTime: 3000, // ms
    maxApiResponseTime: 5000, // ms
  },
} as const;

// Enhanced validation function
export function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  // URL format validation
  if (config.supabase.url && !config.supabase.url.startsWith('https://')) {
    warnings.push('Supabase URL should use HTTPS in production');
  }

  // Development warnings
  if (config.app.isDevelopment) {
    if (!config.app.debug) {
      warnings.push('Debug mode is disabled in development');
    }
  }

  // Production validations
  if (config.app.isProduction) {
    if (config.app.debug) {
      warnings.push('Debug mode should be disabled in production');
    }
    
    if (config.supabase.url.includes('localhost')) {
      errors.push('Production should not use localhost URLs');
    }
  }

  // Log results
  if (warnings.length > 0) {
    console.warn('Environment validation warnings:', warnings);
  }

  if (errors.length > 0) {
    console.error('Environment validation errors:', errors);
    if (config.app.isProduction) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
