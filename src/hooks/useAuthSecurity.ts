
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        console.error('Auth security check error:', error);
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

      setSecurityCheck({
        isAuthenticated: true,
        hasValidSession: timeToExpiry > 0,
        sessionExpiry: expiryTime,
        securityLevel
      });

    } catch (error) {
      console.error('Security check failed:', error);
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
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      await performSecurityCheck();
      toast({
        title: 'Session Refreshed',
        description: 'Your session has been successfully refreshed.',
      });
    } catch (error) {
      console.error('Session refresh failed:', error);
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
