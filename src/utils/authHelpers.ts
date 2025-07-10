import { secureLog, sanitizeError } from './security';

/**
 * Clean up authentication tokens from localStorage and sessionStorage
 */
export const cleanupAuthTokens = () => {
  try {
    // Clean localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clean sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    secureLog('info', 'Auth tokens cleaned up successfully');
  } catch (error) {
    secureLog('error', 'Error cleaning auth storage', sanitizeError(error));
  }
};

/**
 * Enhanced secure sign out with cleanup
 */
export const secureSignOut = async (supabaseClient: any) => {
  try {
    secureLog('info', 'Initiating secure sign out');
    
    // Clean up auth state first
    cleanupAuthTokens();
    
    // Attempt global sign out
    const { error } = await supabaseClient.auth.signOut({ scope: 'global' });
    
    if (error) {
      secureLog('warn', 'Sign out error (continuing with cleanup)', sanitizeError(error));
    } else {
      secureLog('info', 'Sign out successful');
    }
    
    // Force page reload for clean state
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
    
    return { error };
  } catch (error) {
    secureLog('error', 'Critical sign out error', sanitizeError(error));
    
    // Force cleanup even on error
    cleanupAuthTokens();
    window.location.href = '/auth';
    
    return { error };
  }
};

/**
 * Validate authentication state for security
 */
export const validateAuthState = (session: any, user: any): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  if (!session || !user) {
    issues.push('Missing session or user data');
    return { isValid: false, issues };
  }
  
  // Check session expiry
  const now = Date.now() / 1000;
  if (session.expires_at && session.expires_at <= now) {
    issues.push('Session expired');
  }
  
  // Check token presence
  if (!session.access_token) {
    issues.push('Missing access token');
  }
  
  // Check user ID consistency
  if (session.user?.id !== user.id) {
    issues.push('User ID mismatch between session and user object');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};