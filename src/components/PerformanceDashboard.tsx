import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download
} from 'lucide-react';
import { performanceMonitor, PerformanceMetric } from '@/utils/performance';
import { analytics } from '@/utils/analytics';
import { config } from '@/config/environment';
import { cn } from '@/lib/utils';

interface PerformanceStats {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  connectionType: string;
  apiResponseTimes: { [key: string]: number };
}

export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (config.app.isDevelopment || config.features.advancedMonitoring) {
      loadPerformanceData();
      const interval = setInterval(loadPerformanceData, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const loadPerformanceData = async () => {
    try {
      // Get Core Web Vitals
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      // Get memory info if available
      const memoryInfo = (performance as any).memory;
      
      // Get connection info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      const newStats: PerformanceStats = {
        pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: await getLCP(),
        cumulativeLayoutShift: await getCLS(),
        firstInputDelay: await getFID(),
        memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize : 0,
        connectionType: connection?.effectiveType || 'unknown',
        apiResponseTimes: getApiResponseTimes(),
      };

      setStats(newStats);
      setMetrics(performanceMonitor.getMetrics().slice(-50)); // Last 50 metrics
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const getLCP = (): Promise<number> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry ? lastEntry.startTime : 0);
          observer.disconnect();
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 1000);
      } catch {
        resolve(0);
      }
    });
  };

  const getCLS = (): Promise<number> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      let clsValue = 0;
      
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      } catch {
        resolve(0);
      }
    });
  };

  const getFID = (): Promise<number> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          resolve(firstEntry ? (firstEntry as any).processingStart - firstEntry.startTime : 0);
          observer.disconnect();
        });

        observer.observe({ entryTypes: ['first-input'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      } catch {
        resolve(0);
      }
    });
  };

  const getApiResponseTimes = () => {
    const apiMetrics = metrics.filter(m => m.name.startsWith('api_'));
    const responseTimes: { [key: string]: number } = {};
    
    apiMetrics.forEach(metric => {
      const apiName = metric.name.replace('api_', '').replace('_success', '').replace('_error', '');
      if (!responseTimes[apiName] || responseTimes[apiName] > metric.value) {
        responseTimes[apiName] = metric.value;
      }
    });
    
    return responseTimes;
  };

  const getScoreColor = (score: number, thresholds: { good: number; needs_improvement: number }) => {
    if (score <= thresholds.good) return 'text-green-600';
    if (score <= thresholds.needs_improvement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number, thresholds: { good: number; needs_improvement: number }) => {
    if (score <= thresholds.good) return 'good';
    if (score <= thresholds.needs_improvement) return 'needs-improvement';
    return 'poor';
  };

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats,
      metrics: metrics.slice(-100),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!config.app.isDevelopment && !config.features.advancedMonitoring) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
        </Button>
      ) : (
        <Card className="w-96 max-h-96 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Performance Monitor</CardTitle>
                <CardDescription className="text-xs">
                  Real-time application metrics
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadPerformanceData}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportMetrics}
                  className="h-6 w-6 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="vitals" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mx-3 mb-3">
                <TabsTrigger value="vitals" className="text-xs">Core Vitals</TabsTrigger>
                <TabsTrigger value="network" className="text-xs">Network</TabsTrigger>
                <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
              </TabsList>

              <div className="max-h-64 overflow-y-auto px-3 pb-3">
                <TabsContent value="vitals" className="mt-0 space-y-3">
                  {stats && (
                    <>
                      <MetricCard
                        title="Page Load Time"
                        value={`${Math.round(stats.pageLoadTime)}ms`}
                        status={getScoreStatus(stats.pageLoadTime, { good: 1000, needs_improvement: 2500 })}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      
                      <MetricCard
                        title="First Contentful Paint"
                        value={`${Math.round(stats.firstContentfulPaint)}ms`}
                        status={getScoreStatus(stats.firstContentfulPaint, { good: 1800, needs_improvement: 3000 })}
                        icon={<Zap className="h-4 w-4" />}
                      />
                      
                      <MetricCard
                        title="Largest Contentful Paint"
                        value={`${Math.round(stats.largestContentfulPaint)}ms`}
                        status={getScoreStatus(stats.largestContentfulPaint, { good: 2500, needs_improvement: 4000 })}
                        icon={<Activity className="h-4 w-4" />}
                      />
                      
                      <MetricCard
                        title="Cumulative Layout Shift"
                        value={stats.cumulativeLayoutShift.toFixed(3)}
                        status={getScoreStatus(stats.cumulativeLayoutShift, { good: 0.1, needs_improvement: 0.25 })}
                        icon={<TrendingUp className="h-4 w-4" />}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="network" className="mt-0 space-y-3">
                  {stats && (
                    <>
                      <MetricCard
                        title="Connection Type"
                        value={stats.connectionType}
                        status="good"
                        icon={<Wifi className="h-4 w-4" />}
                      />
                      
                      {Object.entries(stats.apiResponseTimes).map(([api, time]) => (
                        <MetricCard
                          key={api}
                          title={`API: ${api}`}
                          value={`${Math.round(time)}ms`}
                          status={getScoreStatus(time, { good: 500, needs_improvement: 1000 })}
                          icon={<Database className="h-4 w-4" />}
                        />
                      ))}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="system" className="mt-0 space-y-3">
                  {stats && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Memory Usage</span>
                          <span>{Math.round(stats.memoryUsage * 100)}%</span>
                        </div>
                        <Progress value={stats.memoryUsage * 100} className="h-2" />
                      </div>
                      
                      <MetricCard
                        title="Active Metrics"
                        value={metrics.length.toString()}
                        status="good"
                        icon={<Activity className="h-4 w-4" />}
                      />
                      
                      <MetricCard
                        title="Environment"
                        value={config.app.env}
                        status="good"
                        icon={<CheckCircle className="h-4 w-4" />}
                      />
                    </>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  status: 'good' | 'needs-improvement' | 'poor';
  icon: React.ReactNode;
}

function MetricCard({ title, value, status, icon }: MetricCardProps) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    'needs-improvement': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200',
  };

  const statusIcons = {
    good: <CheckCircle className="h-3 w-3" />,
    'needs-improvement': <AlertTriangle className="h-3 w-3" />,
    poor: <TrendingDown className="h-3 w-3" />,
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <div className="text-xs font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{value}</div>
        </div>
      </div>
      
      <Badge variant="outline" className={cn('text-xs', statusColors[status])}>
        {statusIcons[status]}
      </Badge>
    </div>
  );
}