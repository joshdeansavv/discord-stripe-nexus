
import { secureLog, sanitizeError } from './security';

/**
 * Clean up authentication tokens from localStorage and sessionStorage
 */
export const cleanupAuthTokens = () => {
  try {
    debugAuth.log('🧹 Starting auth token cleanup');
    
    // Clean localStorage - be more thorough
    const localStorageKeys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    localStorageKeys.forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') || 
          key.startsWith('sb.') ||
          key.includes('supabase-auth-token') ||
          key === 'supabase.auth.token') {
        localStorage.removeItem(key);
        cleanedCount++;
        debugAuth.log(`🗑️ Removed localStorage key: ${key}`);
      }
    });
    
    // Clean sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage || {});
    sessionStorageKeys.forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') || 
          key.startsWith('sb.') ||
          key.includes('supabase-auth-token')) {
        sessionStorage.removeItem(key);
        cleanedCount++;
        debugAuth.log(`🗑️ Removed sessionStorage key: ${key}`);
      }
    });
    
    debugAuth.log(`✅ Auth cleanup completed. Removed ${cleanedCount} keys.`);
    secureLog('info', 'Auth tokens cleaned up successfully', { keysRemoved: cleanedCount });
  } catch (error) {
    debugAuth.error('❌ Error during auth cleanup', error);
    secureLog('error', 'Error cleaning auth storage', sanitizeError(error));
  }
};

/**
 * Enhanced secure sign out with cleanup
 */
export const secureSignOut = async (supabaseClient: any) => {
  try {
    debugAuth.log('🚪 Initiating secure sign out');
    secureLog('info', 'Initiating secure sign out');
    
    // Clean up auth state first
    cleanupAuthTokens();
    
    // Attempt global sign out
    const { error } = await supabaseClient.auth.signOut({ scope: 'global' });
    
    if (error) {
      debugAuth.error('⚠️ Sign out error (continuing with cleanup)', error);
      secureLog('warn', 'Sign out error (continuing with cleanup)', sanitizeError(error));
    } else {
      debugAuth.success('✅ Sign out successful');
      secureLog('info', 'Sign out successful');
    }
    
    // Force page reload for clean state
    setTimeout(() => {
      debugAuth.log('🔄 Redirecting to auth page');
      window.location.href = '/auth';
    }, 100);
    
    return { error };
  } catch (error) {
    debugAuth.error('💥 Critical sign out error', error);
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
  
  // Check token validity (basic format check)
  if (session.access_token && !session.access_token.includes('.')) {
    issues.push('Invalid access token format');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Add debugAuth for use in this file
const debugAuth = {
  log: (message: string, data?: any) => {
    console.log(`🔍 [AUTH DEBUG] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [AUTH ERROR] ${message}`, error || '');
  },
  success: (message: string, data?: any) => {
    console.log(`✅ [AUTH SUCCESS] ${message}`, data || '');
  }
};
