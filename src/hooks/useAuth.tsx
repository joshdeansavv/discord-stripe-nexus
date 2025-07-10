
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

    // Set up auth state listener FIRST - no async operations inside
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          console.log('⚠️ Component unmounted, ignoring auth event:', event);
          return;
        }
        
        console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');
        
        // Update state immediately - synchronous only
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          // Clean up will be handled by signOut function
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
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
      }
      
      console.log('✅ Signed out successfully');
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      // Force page reload to ensure clean state
      console.log('🔄 Redirecting to home...');
      window.location.href = '/';
    } catch (error: any) {
      console.error('💥 Error during sign out:', error);
      
      // Even if signout fails, clear local state and redirect
      setSession(null);
      setUser(null);
      
      toast({
        title: "Sign out error",
        description: error.message || "There was an issue signing you out.",
        variant: "destructive",
      });
      
      // Force redirect anyway
      window.location.href = '/';
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
