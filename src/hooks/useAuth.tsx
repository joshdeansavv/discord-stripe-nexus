
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    console.log('🔧 AuthProvider initializing...');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('⚠️ Component unmounted, ignoring auth event:', event);
          return;
        }
        
        console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
        
        // Update state immediately for all events
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ User signed in successfully:', session.user.email);
          
          // Handle redirect after successful sign in
          const currentPath = window.location.pathname;
          console.log('📍 Current path after sign in:', currentPath);
          
          if (currentPath === '/auth' || currentPath === '/') {
            console.log('🔄 Redirecting to dashboard...');
            setTimeout(() => {
              window.location.replace('/dashboard');
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          
          // Clean up auth tokens
          try {
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });
            console.log('🧹 Auth tokens cleaned up');
          } catch (error) {
            console.log('⚠️ Error cleaning localStorage:', error);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed for:', session.user.email);
        }
        
        // Set loading to false after handling auth events
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (!error.message?.includes('fetch') && !error.message?.includes('network')) {
            toast({
              title: "Authentication Error",
              description: "There was an issue checking your login status.",
              variant: "destructive",
            });
          }
        } else if (mounted) {
          console.log('📊 Initial session check:', session ? `✅ Found session for ${session.user.email}` : '❌ No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('💥 Failed to initialize auth:', error);
        if (error instanceof Error && !error.message.includes('fetch') && !error.message.includes('network')) {
          toast({
            title: "Connection Error",
            description: "Unable to verify authentication status. Please refresh the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete');
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    return () => {
      console.log('🧹 AuthProvider cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      // Clean up auth tokens first
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        console.log('🧹 Local auth tokens cleared');
      } catch (error) {
        console.log('⚠️ Error cleaning localStorage during signout:', error);
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      
      console.log('✅ Signed out successfully');
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      // Redirect to home page
      console.log('🔄 Redirecting to home...');
      window.location.replace(window.location.origin);
    } catch (error: any) {
      console.error('💥 Error during sign out:', error);
      
      // Even if signout fails, clear local state
      setSession(null);
      setUser(null);
      
      toast({
        title: "Sign out error",
        description: error.message || "There was an issue signing you out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  console.log('🎯 AuthProvider rendering with:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading,
    userEmail: user?.email || 'None'
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
