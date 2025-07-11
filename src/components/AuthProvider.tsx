
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, debugAuth } from '@/integrations/supabase/client';
import { useProfileSync } from '@/hooks/useProfileSync';
import { validateAuthState, secureSignOut } from '@/utils/authHelpers';
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
    debugAuth.log('🔐 AuthProvider: Setting up auth state listener');

    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        debugAuth.log('🔄 Auth state change', {
          event,
          hasSession: !!newSession,
          userId: newSession?.user?.id,
          email: newSession?.user?.email,
          provider: newSession?.user?.app_metadata?.provider,
          discordMetadata: newSession?.user?.user_metadata
        });
        
        // Update state immediately
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Handle different auth events with security validation
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Validate auth state security
          const authValidation = validateAuthState(newSession, newSession.user);
          
          if (!authValidation.isValid) {
            secureLog('warn', 'Auth state validation failed on sign in', {
              issues: authValidation.issues,
              userId: newSession.user.id
            });
            // Force sign out if validation fails
            setTimeout(() => secureSignOut(supabase), 0);
            return;
          }
          
          debugAuth.success('✅ User signed in successfully', {
            email: newSession.user.email,
            provider: newSession.user.app_metadata?.provider,
            discordId: newSession.user.user_metadata?.provider_id,
            discordUsername: newSession.user.user_metadata?.user_name
          });
          
          secureLog('info', 'User authenticated successfully', {
            userId: newSession.user.id,
            provider: newSession.user.app_metadata?.provider
          });
          
          // Redirect to dashboard after successful sign in
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
          
        } else if (event === 'SIGNED_OUT') {
          debugAuth.log('👋 User signed out');
          secureLog('info', 'User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          debugAuth.log('🔄 Token refreshed');
          secureLog('info', 'Auth token refreshed');
        }
      }
    );

    // THEN get initial session
    const getInitialSession = async () => {
      try {
        debugAuth.log('Checking for initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          debugAuth.error('Error getting initial session', error);
          setLoading(false);
        } else {
          debugAuth.log('📱 Initial session check', initialSession ? {
            userId: initialSession.user.id,
            email: initialSession.user.email,
            provider: initialSession.user.app_metadata?.provider,
            discordId: initialSession.user.user_metadata?.provider_id
          } : 'No session found');
          
          // Only set state if we don't have a session yet (avoid race condition)
          if (!session) {
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
          }
          setLoading(false);
        }
      } catch (error) {
        debugAuth.error('Error in getInitialSession', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      debugAuth.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    debugAuth.log('👋 Signing out user');
    secureLog('info', 'User initiated sign out', { userId: user?.id });
    
    const result = await secureSignOut(supabase);
    
    if (!result.error) {
      setUser(null);
      setSession(null);
      debugAuth.success('Sign out successful');
    } else {
      debugAuth.error('Sign out error', result.error);
    }
    return result;
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
      debugAuth.log('Sync status update', syncStatus);
    }
  }, [syncStatus]);

  return <>{children}</>;
};
