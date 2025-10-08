// Advanced analytics and user behavior tracking
import { config } from '@/config/environment';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
}

class AnalyticsManager {
  private session: UserSession | null = null;
  private isEnabled: boolean;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private maxQueueSize: number = 100;

  constructor() {
    this.isEnabled = config.features.analytics && config.app.isProduction;
    
    if (typeof window !== 'undefined' && this.isEnabled) {
      this.initializeSession();
      this.setupEventListeners();
      this.startPeriodicFlush();
    }
  }

  private initializeSession() {
    const sessionId = this.generateSessionId();
    
    this.session = {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };

    // Store session in sessionStorage for persistence across page reloads
    sessionStorage.setItem('analytics_session', JSON.stringify(this.session));
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Track page views
    window.addEventListener('load', () => {
      this.trackPageView();
    });

    // Track user activity
    ['click', 'scroll', 'keydown', 'mousemove'].forEach(event => {
      window.addEventListener(event, this.updateLastActivity.bind(this), { passive: true });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden');
      } else {
        this.track('page_visible');
        this.updateLastActivity();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  private updateLastActivity() {
    if (this.session) {
      this.session.lastActivity = Date.now();
    }
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // Public API
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled || !this.session) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        page: window.location.pathname,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      sessionId: this.session.id,
    };

    this.queue.push(event);
    this.session.events.push(event);
    this.updateLastActivity();

    // Auto-flush if queue is getting large
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  trackPageView(path?: string) {
    if (!this.session) return;

    this.session.pageViews++;
    
    this.track('page_view', {
      path: path || window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }

  trackUserAction(action: string, target?: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      target,
      ...properties,
    });
  }

  trackError(error: Error, context?: string) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
    });
  }

  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance', {
      metric,
      value,
      unit,
      url: window.location.pathname,
    });
  }

  trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>) {
    this.track('feature_usage', {
      feature,
      action,
      ...properties,
    });
  }

  setUserId(userId: string) {
    if (this.session) {
      this.session.userId = userId;
    }
  }

  flush() {
    if (!this.isEnabled || this.queue.length === 0) return;

    // In a real implementation, you would send this to your analytics service
    // For now, we'll use Vercel Analytics if available
    if (typeof window !== 'undefined' && (window as any).va) {
      this.queue.forEach(event => {
        (window as any).va('track', event.name, event.properties);
      });
    }

    // Log to console in development
    if (config.app.isDevelopment) {
      console.log('Analytics flush:', this.queue);
    }

    this.queue = [];
  }

  getSession(): UserSession | null {
    return this.session;
  }

  getSessionDuration(): number {
    if (!this.session) return 0;
    return Date.now() - this.session.startTime;
  }

  isActive(): boolean {
    if (!this.session) return false;
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
    return Date.now() - this.session.lastActivity < inactiveThreshold;
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackPageView = (path?: string) => {
  analytics.trackPageView(path);
};

export const trackUserAction = (action: string, target?: string, properties?: Record<string, any>) => {
  analytics.trackUserAction(action, target, properties);
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackError(error, context);
};

export const trackPerformance = (metric: string, value: number, unit?: string) => {
  analytics.trackPerformance(metric, value, unit);
};

export const trackFeatureUsage = (feature: string, action: string, properties?: Record<string, any>) => {
  analytics.trackFeatureUsage(feature, action, properties);
};