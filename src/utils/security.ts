// Security utilities and validation functions
import { config } from '@/config/environment';

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://vercel.live", "https://*.supabase.co"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "https://*.supabase.co", "https://api.openai.com", "https://speech.googleapis.com", "https://texttospeech.googleapis.com"],
  mediaSrc: ["'self'", "blob:", "data:"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: [],
} as const;

// Input validation and sanitization
export class InputValidator {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate URL format
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Validate file upload
  static validateFile(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { isValid: boolean; error?: string } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/*', 'application/pdf', 'text/*'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx']
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
      };
    }

    // Check file type
    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isTypeAllowed) {
      return {
        isValid: false,
        error: 'File type not allowed'
      };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: 'File extension not allowed'
      };
    }

    return { isValid: true };
  }

  // Validate text input length and content
  static validateText(text: string, options: {
    minLength?: number;
    maxLength?: number;
    allowHtml?: boolean;
    pattern?: RegExp;
  } = {}): { isValid: boolean; error?: string } {
    const {
      minLength = 0,
      maxLength = 10000,
      allowHtml = false,
      pattern
    } = options;

    if (text.length < minLength) {
      return {
        isValid: false,
        error: `Text must be at least ${minLength} characters`
      };
    }

    if (text.length > maxLength) {
      return {
        isValid: false,
        error: `Text must not exceed ${maxLength} characters`
      };
    }

    if (!allowHtml && /<[^>]*>/.test(text)) {
      return {
        isValid: false,
        error: 'HTML content not allowed'
      };
    }

    if (pattern && !pattern.test(text)) {
      return {
        isValid: false,
        error: 'Text format is invalid'
      };
    }

    return { isValid: true };
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private requests: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  static getInstance(key: string, maxRequests: number = 100, windowMs: number = 60000): RateLimiter {
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter(maxRequests, windowMs));
    }
    return this.instances.get(key)!;
  }

  isAllowed(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if we're under the limit
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    return Math.max(0, this.requests[0] + this.windowMs - Date.now());
  }
}

// Security headers utility
export const getSecurityHeaders = (): Record<string, string> => {
  const cspValue = Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabDirective} ${sources.join(' ')}`;
    })
    .join('; ');

  return {
    'Content-Security-Policy': cspValue,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
};

// API key validation
export const validateApiKey = (key: string, service: string): boolean => {
  if (!key || typeof key !== 'string') {
    console.error(`Invalid ${service} API key: missing or not a string`);
    return false;
  }

  if (key.length < 10) {
    console.error(`Invalid ${service} API key: too short`);
    return false;
  }

  // Don't log the actual key in production
  if (config.app.isDevelopment) {
    console.log(`${service} API key validation passed`);
  }

  return true;
};

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Environment-specific security checks
export const performSecurityChecks = (): { passed: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check if running over HTTPS in production
  if (config.app.isProduction && typeof window !== 'undefined') {
    if (window.location.protocol !== 'https:') {
      warnings.push('Application should use HTTPS in production');
    }
  }

  // Check for debug mode in production
  if (config.app.isProduction && config.app.debug) {
    warnings.push('Debug mode should be disabled in production');
  }

  // Check for development URLs in production
  if (config.app.isProduction) {
    if (config.supabase.url.includes('localhost') || config.supabase.url.includes('127.0.0.1')) {
      warnings.push('Production should not use localhost URLs');
    }
  }

  return {
    passed: warnings.length === 0,
    warnings
  };
};