
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, debugAuth } from '@/integrations/supabase/client';
import { useProfileSync } from '@/hooks/useProfileSync';
import { cleanupAuthTokens } from '@/utils/authHelpers';
import { secureLog, sanitizeError } from '@/utils/security';

// Import AuthContextType and AuthContext from the separate context file
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugAuth.log('🔐 AuthProvider: Initializing auth state');

    let mounted = true;

    // Get initial session first
    const getInitialSession = async () => {
      try {
        debugAuth.log('🔍 Checking for existing session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          debugAuth.error('❌ Error getting initial session', error);
          throw error;
        }

        if (mounted) {
          debugAuth.log('📱 Initial session check', initialSession ? {
            userId: initialSession.user.id,
            email: initialSession.user.email,
            provider: initialSession.user.app_metadata?.provider,
            expiresAt: new Date(initialSession.expires_at! * 1000).toISOString()
          } : 'No existing session found');

          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        debugAuth.error('💥 Critical error getting initial session', error);
        if (mounted) {
          // Clean up potentially corrupted auth state
          cleanupAuthTokens();
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        debugAuth.log('🔄 Auth state change detected', {
          event,
          hasSession: !!newSession,
          userId: newSession?.user?.id,
          email: newSession?.user?.email,
          provider: newSession?.user?.app_metadata?.provider
        });
        
        // Update state immediately
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN' && newSession?.user) {
          debugAuth.success('✅ User signed in successfully', {
            email: newSession.user.email,
            provider: newSession.user.app_metadata?.provider,
            userId: newSession.user.id
          });
          
          secureLog('info', 'User authenticated successfully', {
            userId: newSession.user.id,
            provider: newSession.user.app_metadata?.provider
          });
          
          // Redirect to dashboard after successful sign in
          setTimeout(() => {
            if (window.location.pathname === '/auth') {
              window.location.href = '/dashboard';
            }
          }, 100);
          
        } else if (event === 'SIGNED_OUT') {
          debugAuth.log('👋 User signed out');
          secureLog('info', 'User signed out');
          cleanupAuthTokens();
        } else if (event === 'TOKEN_REFRESHED') {
          debugAuth.log('🔄 Token refreshed successfully');
          secureLog('info', 'Auth token refreshed');
        }
      }
    );

    // Initialize session check
    getInitialSession();

    return () => {
      mounted = false;
      debugAuth.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    debugAuth.log('👋 Initiating sign out');
    secureLog('info', 'User initiated sign out', { userId: user?.id });
    
    try {
      // Clean up auth state first
      cleanupAuthTokens();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (!error) {
        debugAuth.success('✅ Sign out successful');
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
      } else {
        debugAuth.error('❌ Sign out error', error);
      }
      
      return { error };
    } catch (error) {
      debugAuth.error('💥 Critical sign out error', error);
      // Force cleanup and redirect even on error
      cleanupAuthTokens();
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      <AuthSyncWrapper>
        {children}
      </AuthSyncWrapper>
    </AuthContext.Provider>
  );
};

// Wrapper component to handle profile syncing with debugging
const AuthSyncWrapper = ({ children }: { children: React.ReactNode }) => {
  const syncStatus = useProfileSync();
  
  // Log sync status for debugging
  useEffect(() => {
    if (syncStatus.userId) {
      debugAuth.log('🔄 Profile sync status update', syncStatus);
    }
  }, [syncStatus]);

  return <>{children}</>;
};
