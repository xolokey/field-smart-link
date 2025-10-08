import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/config/environment';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    environment: boolean;
    supabase: boolean;
    timestamp: number;
  };
}

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'healthy',
    checks: {
      environment: false,
      supabase: false,
      timestamp: Date.now(),
    },
  });

  useEffect(() => {
    const checkHealth = async () => {
      const checks = {
        environment: false,
        supabase: false,
        timestamp: Date.now(),
      };

      // Check environment variables
      try {
        checks.environment = !!(config.supabase.url && config.supabase.anonKey);
      } catch {
        checks.environment = false;
      }

      // Check Supabase connection
      try {
        const { error } = await supabase.auth.getSession();
        checks.supabase = !error;
      } catch {
        checks.supabase = false;
      }

      // Determine overall status
      const healthyChecks = Object.values(checks).filter(Boolean).length - 1; // Exclude timestamp
      const totalChecks = Object.keys(checks).length - 1; // Exclude timestamp
      
      let status: HealthStatus['status'] = 'healthy';
      if (healthyChecks === 0) {
        status = 'unhealthy';
      } else if (healthyChecks < totalChecks) {
        status = 'degraded';
      }

      setHealth({ status, checks });
    };

    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return health;
}

// Health check component for development
export function HealthCheckIndicator() {
  const health = useHealthCheck();

  if (config.app.isProduction) {
    return null; // Don't show in production
  }

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    unhealthy: 'bg-red-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-background border rounded-lg p-2 shadow-lg">
        <div className={`w-3 h-3 rounded-full ${statusColors[health.status]}`} />
        <span className="text-sm font-medium capitalize">{health.status}</span>
        <div className="text-xs text-muted-foreground">
          ENV: {health.checks.environment ? '✓' : '✗'} | 
          DB: {health.checks.supabase ? '✓' : '✗'}
        </div>
      </div>
    </div>
  );
}