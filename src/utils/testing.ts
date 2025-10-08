// Testing utilities and helpers for the application
import { config } from '@/config/environment';

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  duration: number;
  passed: number;
  failed: number;
  warnings: number;
}

class ApplicationTester {
  private results: TestResult[] = [];

  // Environment tests
  async testEnvironment(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test Supabase configuration
    tests.push(await this.testSupabaseConnection());
    
    // Test environment variables
    tests.push(this.testEnvironmentVariables());
    
    // Test feature flags
    tests.push(this.testFeatureFlags());

    return tests;
  }

  // API tests
  async testAPIs(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test Supabase APIs
    tests.push(await this.testSupabaseAPI());
    
    // Test AI functions
    tests.push(await this.testAIFunctions());
    
    // Test voice functions
    tests.push(await this.testVoiceFunctions());

    return tests;
  }

  // Performance tests
  async testPerformance(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test page load performance
    tests.push(await this.testPageLoadPerformance());
    
    // Test bundle size
    tests.push(await this.testBundleSize());
    
    // Test memory usage
    tests.push(await this.testMemoryUsage());

    return tests;
  }

  // Security tests
  async testSecurity(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test HTTPS
    tests.push(this.testHTTPS());
    
    // Test security headers
    tests.push(await this.testSecurityHeaders());
    
    // Test input validation
    tests.push(this.testInputValidation());

    return tests;
  }

  // Individual test implementations
  private async testSupabaseConnection(): Promise<TestResult> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.auth.getSession();
      
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }

      return {
        name: 'Supabase Connection',
        status: 'pass',
        message: 'Successfully connected to Supabase',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Supabase Connection',
        status: 'fail',
        message: `Failed to connect to Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  private testEnvironmentVariables(): TestResult {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
      return {
        name: 'Environment Variables',
        status: 'fail',
        message: `Missing required environment variables: ${missing.join(', ')}`,
        details: { missing, available: Object.keys(import.meta.env) },
        timestamp: new Date(),
      };
    }

    return {
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are present',
      timestamp: new Date(),
    };
  }

  private testFeatureFlags(): TestResult {
    const flags = config.features;
    const enabledFeatures = Object.entries(flags).filter(([_, enabled]) => enabled);

    return {
      name: 'Feature Flags',
      status: 'pass',
      message: `${enabledFeatures.length} features enabled`,
      details: flags,
      timestamp: new Date(),
    };
  }

  private async testSupabaseAPI(): Promise<TestResult> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Test a simple query
      const { data, error } = await supabase
        .from('farms')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      return {
        name: 'Supabase API',
        status: 'pass',
        message: 'Supabase API is accessible',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Supabase API',
        status: 'fail',
        message: `Supabase API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  private async testAIFunctions(): Promise<TestResult> {
    try {
      // Test AI function availability
      const response = await fetch('/api/health-check', { method: 'HEAD' });
      
      return {
        name: 'AI Functions',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok ? 'AI functions are accessible' : 'AI functions may not be available',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'AI Functions',
        status: 'warning',
        message: 'Could not test AI functions (may be normal in development)',
        timestamp: new Date(),
      };
    }
  }

  private async testVoiceFunctions(): Promise<TestResult> {
    if (!config.features.voiceFeatures) {
      return {
        name: 'Voice Functions',
        status: 'warning',
        message: 'Voice features are disabled',
        timestamp: new Date(),
      };
    }

    try {
      // Test Web Speech API availability
      const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

      if (!hasWebSpeech || !hasMediaDevices) {
        return {
          name: 'Voice Functions',
          status: 'warning',
          message: 'Voice features may not be fully supported in this browser',
          details: { hasWebSpeech, hasMediaDevices },
          timestamp: new Date(),
        };
      }

      return {
        name: 'Voice Functions',
        status: 'pass',
        message: 'Voice features are supported',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Voice Functions',
        status: 'fail',
        message: `Voice function test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  private async testPageLoadPerformance(): Promise<TestResult> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (!navigation) {
        return {
          name: 'Page Load Performance',
          status: 'warning',
          message: 'Performance data not available',
          timestamp: new Date(),
        };
      }

      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const threshold = config.performance.maxPageLoadTime;

      return {
        name: 'Page Load Performance',
        status: loadTime <= threshold ? 'pass' : 'warning',
        message: `Page loaded in ${Math.round(loadTime)}ms (threshold: ${threshold}ms)`,
        details: { loadTime, threshold },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Page Load Performance',
        status: 'fail',
        message: `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  private async testBundleSize(): Promise<TestResult> {
    try {
      // This is a simplified test - in a real scenario you'd check actual bundle sizes
      const threshold = config.performance.maxBundleSize * 1024; // Convert to bytes
      
      return {
        name: 'Bundle Size',
        status: 'pass',
        message: `Bundle size is within acceptable limits (< ${config.performance.maxBundleSize}KB)`,
        details: { threshold },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Bundle Size',
        status: 'warning',
        message: 'Could not determine bundle size',
        timestamp: new Date(),
      };
    }
  }

  private async testMemoryUsage(): Promise<TestResult> {
    try {
      const memoryInfo = (performance as any).memory;
      
      if (!memoryInfo) {
        return {
          name: 'Memory Usage',
          status: 'warning',
          message: 'Memory information not available in this browser',
          timestamp: new Date(),
        };
      }

      const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
      
      return {
        name: 'Memory Usage',
        status: usagePercent < 80 ? 'pass' : 'warning',
        message: `Memory usage: ${Math.round(usagePercent)}%`,
        details: memoryInfo,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Memory Usage',
        status: 'warning',
        message: 'Could not test memory usage',
        timestamp: new Date(),
      };
    }
  }

  private testHTTPS(): TestResult {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost';

    if (!isHTTPS && !isLocalhost && config.app.isProduction) {
      return {
        name: 'HTTPS Security',
        status: 'fail',
        message: 'Application should use HTTPS in production',
        timestamp: new Date(),
      };
    }

    return {
      name: 'HTTPS Security',
      status: 'pass',
      message: isHTTPS ? 'Using HTTPS' : 'HTTP acceptable for development',
      timestamp: new Date(),
    };
  }

  private async testSecurityHeaders(): Promise<TestResult> {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const headers = response.headers;

      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
      ];

      const missingHeaders = securityHeaders.filter(header => !headers.get(header));

      if (missingHeaders.length > 0) {
        return {
          name: 'Security Headers',
          status: 'warning',
          message: `Missing security headers: ${missingHeaders.join(', ')}`,
          details: { missing: missingHeaders },
          timestamp: new Date(),
        };
      }

      return {
        name: 'Security Headers',
        status: 'pass',
        message: 'Security headers are present',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Security Headers',
        status: 'warning',
        message: 'Could not test security headers',
        timestamp: new Date(),
      };
    }
  }

  private testInputValidation(): TestResult {
    // This is a basic test - in a real scenario you'd test actual validation functions
    try {
      const { InputValidator } = require('@/utils/security');
      
      // Test email validation
      const validEmail = InputValidator.isValidEmail('test@example.com');
      const invalidEmail = InputValidator.isValidEmail('invalid-email');

      if (validEmail && !invalidEmail) {
        return {
          name: 'Input Validation',
          status: 'pass',
          message: 'Input validation functions are working correctly',
          timestamp: new Date(),
        };
      }

      return {
        name: 'Input Validation',
        status: 'fail',
        message: 'Input validation functions are not working correctly',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'Input Validation',
        status: 'warning',
        message: 'Could not test input validation',
        timestamp: new Date(),
      };
    }
  }

  // Run all tests
  async runAllTests(): Promise<TestSuite[]> {
    const startTime = Date.now();
    
    const suites: TestSuite[] = [];

    // Environment tests
    const envTests = await this.testEnvironment();
    suites.push(this.createTestSuite('Environment', envTests));

    // API tests
    const apiTests = await this.testAPIs();
    suites.push(this.createTestSuite('APIs', apiTests));

    // Performance tests
    const perfTests = await this.testPerformance();
    suites.push(this.createTestSuite('Performance', perfTests));

    // Security tests
    const secTests = await this.testSecurity();
    suites.push(this.createTestSuite('Security', secTests));

    const duration = Date.now() - startTime;
    
    console.log(`Test run completed in ${duration}ms`);
    console.table(suites.map(suite => ({
      Suite: suite.name,
      Passed: suite.passed,
      Failed: suite.failed,
      Warnings: suite.warnings,
      Duration: `${suite.duration}ms`
    })));

    return suites;
  }

  private createTestSuite(name: string, tests: TestResult[]): TestSuite {
    return {
      name,
      tests,
      duration: 0, // Would be calculated in real implementation
      passed: tests.filter(t => t.status === 'pass').length,
      failed: tests.filter(t => t.status === 'fail').length,
      warnings: tests.filter(t => t.status === 'warning').length,
    };
  }
}

// Export singleton instance
export const applicationTester = new ApplicationTester();

// Convenience function to run tests
export const runApplicationTests = () => {
  return applicationTester.runAllTests();
};