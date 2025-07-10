
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
  if (!context) {
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          console.log('✅ User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          console.log('👋 User signed out');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
          setUser(session.user);
          console.log('🔄 Token refreshed');
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't show toast for network errors during initialization
          if (!error.message?.includes('fetch') && !error.message?.includes('network')) {
            toast({
              title: "Authentication Error",
              description: "There was an issue checking your login status.",
              variant: "destructive",
            });
          }
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          console.log('Initial session check:', session ? '✅ Found session' : '❌ No session');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Only show error if it's not a network issue
        if (error instanceof Error && !error.message.includes('fetch') && !error.message.includes('network')) {
          toast({
            title: "Connection Error",
            description: "Unable to verify authentication status. Please refresh the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
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
    } catch (error: any) {
      console.error('Error during sign out:', error);
      
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
