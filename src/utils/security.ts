/**
 * Security utilities for input validation and sanitization
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{8,}$/, // At least 8 characters
  serverName: /^[a-zA-Z0-9\s-_]{1,50}$/,
  discordId: /^[0-9]{15,21}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

// Rate limiting configuration
const RATE_LIMITS = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const DEFAULT_RATE_LIMIT = 10; // requests per minute

/**
 * Sanitize user input by removing potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove HTML/JS injection chars
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 1000); // Limit length
};

/**
 * Validate input against patterns
 */
export const validateInput = (
  input: string, 
  pattern: keyof typeof VALIDATION_PATTERNS
): boolean => {
  if (!input || typeof input !== 'string') return false;
  return VALIDATION_PATTERNS[pattern].test(input);
};

/**
 * Rate limiting function
 */
export const checkRateLimit = (
  identifier: string, 
  limit: number = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  let limitData = RATE_LIMITS.get(key);
  
  // Reset if window expired
  if (!limitData || now - limitData.lastReset > RATE_LIMIT_WINDOW) {
    limitData = { count: 0, lastReset: now };
    RATE_LIMITS.set(key, limitData);
  }
  
  const allowed = limitData.count < limit;
  if (allowed) {
    limitData.count++;
  }
  
  return {
    allowed,
    remaining: Math.max(0, limit - limitData.count),
    resetTime: limitData.lastReset + RATE_LIMIT_WINDOW
  };
};

/**
 * Enhanced error sanitizer - removes sensitive information
 */
export const sanitizeError = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || error.toString();
  
  // Remove sensitive patterns
  return message
    .replace(/Bearer\s+[A-Za-z0-9-._~+\/]+=*/g, 'Bearer [REDACTED]')
    .replace(/password['":\s=]+[^'"\s,}]*/gi, 'password: [REDACTED]')
    .replace(/token['":\s=]+[^'"\s,}]*/gi, 'token: [REDACTED]')
    .replace(/key['":\s=]+[^'"\s,}]*/gi, 'key: [REDACTED]')
    .replace(/secret['":\s=]+[^'"\s,}]*/gi, 'secret: [REDACTED]');
};

/**
 * Generate secure CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken || token.length !== 64 || storedToken.length !== 64) {
    return false;
  }
  
  // Constant-time comparison
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
};

/**
 * Secure session validation
 */
export const validateSessionSecurity = (session: any): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!session) {
    issues.push('No session found');
    return { isValid: false, issues, recommendations };
  }
  
  const now = Date.now() / 1000;
  const expiresAt = session.expires_at;
  
  // Check session expiry
  if (!expiresAt || expiresAt <= now) {
    issues.push('Session expired');
    recommendations.push('Refresh session or re-authenticate');
  } else if (expiresAt - now < 300) { // Less than 5 minutes
    recommendations.push('Session expires soon - consider refreshing');
  }
  
  // Check token presence
  if (!session.access_token) {
    issues.push('Missing access token');
  }
  
  if (!session.refresh_token) {
    issues.push('Missing refresh token');
  }
  
  // Check user data
  if (!session.user || !session.user.id) {
    issues.push('Invalid user data in session');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Secure logging that excludes sensitive information
 */
export const secureLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const sanitizedData = data ? sanitizeError(data) : undefined;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(sanitizedData && { data: sanitizedData })
  };
  
  console[level]('[SECURITY]', logEntry);
};