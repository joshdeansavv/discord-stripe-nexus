
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateSessionSecurity, secureLog, sanitizeError } from '@/utils/security';

interface SecurityCheck {
  isAuthenticated: boolean;
  hasValidSession: boolean;
  sessionExpiry: Date | null;
  securityLevel: 'high' | 'medium' | 'low';
}

export const useAuthSecurity = () => {
  const [securityCheck, setSecurityCheck] = useState<SecurityCheck>({
    isAuthenticated: false,
    hasValidSession: false,
    sessionExpiry: null,
    securityLevel: 'low'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const performSecurityCheck = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        secureLog('error', 'Auth security check error', sanitizeError(error));
        toast({
          title: 'Security Check Failed',
          description: 'Please sign in again for security verification.',
          variant: 'destructive',
        });
        return;
      }

      if (!session || !session.user) {
        setSecurityCheck({
          isAuthenticated: false,
          hasValidSession: false,
          sessionExpiry: null,
          securityLevel: 'low'
        });
        return;
      }

      // Enhanced security validation
      const securityValidation = validateSessionSecurity(session);
      
      if (!securityValidation.isValid) {
        secureLog('warn', 'Session security issues detected', {
          issues: securityValidation.issues,
          userId: session.user.id
        });
        
        setSecurityCheck({
          isAuthenticated: false,
          hasValidSession: false,
          sessionExpiry: null,
          securityLevel: 'low'
        });
        
        toast({
          title: 'Session Security Issue',
          description: securityValidation.issues.join(', '),
          variant: 'destructive',
        });
        return;
      }

      // Check session validity and expiry
      const now = new Date();
      const expiryTime = new Date(session.expires_at! * 1000);
      const timeToExpiry = expiryTime.getTime() - now.getTime();
      
      // Determine security level based on session age and other factors
      let securityLevel: 'high' | 'medium' | 'low' = 'high';
      
      if (timeToExpiry < 5 * 60 * 1000) { // Less than 5 minutes
        securityLevel = 'low';
        toast({
          title: 'Session Expiring Soon',
          description: 'Your session will expire in less than 5 minutes.',
          variant: 'destructive',
        });
      } else if (timeToExpiry < 30 * 60 * 1000) { // Less than 30 minutes
        securityLevel = 'medium';
      }

      // Additional security checks
      const lastActivity = localStorage.getItem('last_activity');
      const maxInactivity = 2 * 60 * 60 * 1000; // 2 hours
      
      if (lastActivity && (Date.now() - parseInt(lastActivity)) > maxInactivity) {
        securityLevel = 'low';
        secureLog('warn', 'Session inactive for too long', {
          userId: session.user.id,
          lastActivity: new Date(parseInt(lastActivity)).toISOString()
        });
      }

      // Update last activity
      localStorage.setItem('last_activity', Date.now().toString());

      setSecurityCheck({
        isAuthenticated: true,
        hasValidSession: timeToExpiry > 0,
        sessionExpiry: expiryTime,
        securityLevel
      });

      // Log security check completion
      secureLog('info', 'Security check completed', {
        userId: session.user.id,
        securityLevel,
        expiresAt: expiryTime.toISOString()
      });

    } catch (error) {
      secureLog('error', 'Security check failed', sanitizeError(error));
      setSecurityCheck({
        isAuthenticated: false,
        hasValidSession: false,
        sessionExpiry: null,
        securityLevel: 'low'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      secureLog('info', 'Attempting session refresh');
      
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      await performSecurityCheck();
      
      secureLog('info', 'Session refresh successful');
      toast({
        title: 'Session Refreshed',
        description: 'Your session has been successfully refreshed.',
      });
    } catch (error) {
      secureLog('error', 'Session refresh failed', sanitizeError(error));
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh session. Please sign in again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    performSecurityCheck();

    // Set up session monitoring
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          await performSecurityCheck();
        }
      }
    );

    // Check session every 5 minutes
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    securityCheck,
    loading,
    refreshSession,
    performSecurityCheck
  };
};
