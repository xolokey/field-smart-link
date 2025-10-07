// Performance monitoring utilities for production

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isProduction = import.meta.env.PROD;

  // Measure page load performance
  measurePageLoad() {
    if (!this.isProduction || typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.recordMetric('first_paint', this.getFirstPaint());
        this.recordMetric('largest_contentful_paint', this.getLargestContentfulPaint());
      }
    });
  }

  // Measure API call performance
  measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return apiCall()
      .then((result) => {
        this.recordMetric(`api_${name}_success`, performance.now() - startTime);
        return result;
      })
      .catch((error) => {
        this.recordMetric(`api_${name}_error`, performance.now() - startTime);
        throw error;
      });
  }

  // Record custom metrics
  recordMetric(name: string, value: number, url?: string) {
    if (!this.isProduction) {
      console.log(`Performance Metric: ${name} = ${value}ms`);
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: url || window.location.pathname,
    };

    this.metrics.push(metric);

    // Send to analytics service (example with Vercel Analytics)
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', name, { value, url: metric.url });
    }
  }

  // Get Core Web Vitals
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    return new Promise<number>((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? lastEntry.startTime : 0);
        observer.disconnect();
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      } catch {
        resolve(0);
      }
    }) as any;
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    performanceMonitor.measurePageLoad();
    
    // Monitor route changes for SPA
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        performanceMonitor.recordMetric('route_change', performance.now());
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// Utility function to measure component render time
export function measureRender<T extends (...args: any[]) => any>(
  componentName: string,
  renderFunction: T
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = renderFunction(...args);
    const endTime = performance.now();
    
    performanceMonitor.recordMetric(`render_${componentName}`, endTime - startTime);
    return result;
  }) as T;
}