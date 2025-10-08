import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { validateEnvironment } from "@/config/environment";
import { initializePerformanceMonitoring } from "@/utils/performance";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HealthCheckIndicator } from "@/components/HealthCheck";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Farms from "./pages/Farms";
import FarmDetails from "./pages/FarmDetails";
import AIAdvisor from "./pages/AIAdvisor";
import MarketInsights from "./pages/MarketInsights";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

// Validate environment variables on app startup
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  // In production, you might want to show a user-friendly error page
}

// Initialize performance monitoring
initializePerformanceMonitoring();

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
        <HealthCheckIndicator />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
