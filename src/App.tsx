import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { validateEnvironment, config } from "@/config/environment";
import { initializePerformanceMonitoring } from "@/utils/performance";
import { analytics } from "@/utils/analytics";
import { performSecurityChecks } from "@/utils/security";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HealthCheckIndicator } from "@/components/HealthCheck";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { PageLoader } from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Farms from "./pages/Farms";
import FarmDetails from "./pages/FarmDetails";
import AIAdvisor from "./pages/AIAdvisor";
import MarketInsights from "./pages/MarketInsights";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { Suspense, useEffect } from "react";

// Validate environment variables on app startup
try {
  const validation = validateEnvironment();
  if (!validation.isValid && config.app.isProduction) {
    console.error('Critical environment validation failed:', validation.errors);
  }
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Perform security checks
const securityCheck = performSecurityChecks();
if (!securityCheck.passed) {
  console.warn('Security warnings:', securityCheck.warnings);
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Configure React Query with enhanced settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// App initialization component
function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Track app initialization
    analytics.track('app_initialized', {
      version: config.app.version,
      environment: config.app.env,
      timestamp: Date.now(),
    });

    // Set up global error handling
    const handleUnhandledError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), 'unhandled_error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(
        new Error(event.reason?.message || 'Unhandled promise rejection'), 
        'unhandled_rejection'
      );
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInitializer>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader text="Loading application..." />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/farms" element={<Farms />} />
                <Route path="/farms/:farmId" element={<FarmDetails />} />
                <Route path="/ai-advisor" element={<AIAdvisor />} />
                <Route path="/market-insights" element={<MarketInsights />} />
                <Route path="/analytics" element={<Analytics />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          
          {/* Global UI Components */}
          <HealthCheckIndicator />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <PerformanceDashboard />
        </AppInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
