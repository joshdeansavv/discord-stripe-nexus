
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  // Handle auth redirects
  useAuthRedirect({ user, loading: authLoading });

  useEffect(() => {
    console.log('🔧 Auth page mounted');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔗 Search params:', Object.fromEntries(searchParams.entries()));
    console.log('🔗 Hash fragment:', window.location.hash);

    // Check for OAuth errors in URL parameters
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.log('❌ OAuth error detected:', error, errorDescription);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error === 'access_denied') {
        errorMessage = 'Access was denied. Please make sure you approve the Discord authorization request.';
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/auth');
      return;
    }

    // Check for OAuth callback tokens in URL fragment
    const fragment = window.location.hash;
    if (fragment && (fragment.includes('access_token') || fragment.includes('refresh_token'))) {
      console.log('🔄 OAuth callback detected, processing tokens...');
      setProcessingCallback(true);
      
      // Clean up the URL fragment immediately to prevent reprocessing
      window.history.replaceState({}, document.title, '/auth');
      
      // Let the auth state listener handle the rest - no manual redirect needed
      setProcessingCallback(false);
      return;
    }

    // Check if user is already logged in (only if not processing callback or error)
    if (!error && !fragment) {
      const checkExistingSession = async () => {
        try {
          console.log('🔍 Checking for existing authenticated session...');
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('✅ User already authenticated:', session.user.email);
            console.log('🔄 Redirecting to dashboard...');
            window.location.href = '/dashboard';
          } else {
            console.log('❌ No existing session found');
          }
        } catch (error) {
          console.error('⚠️ Error checking existing session:', error);
        }
      };
      
      checkExistingSession();
    }
  }, [navigate, searchParams, toast]);

  const handleDiscordLogin = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting Discord OAuth flow...');
      
      // Clear any existing auth state first
      try {
        console.log('🧹 Clearing existing auth state...');
        await supabase.auth.signOut();
        
        // Clear localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (err) {
        console.log('⚠️ Error during pre-auth cleanup:', err);
        // Continue even if cleanup fails
      }

      console.log('🔗 Initiating Discord OAuth with redirect to:', `${window.location.origin}/auth`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          skipBrowserRedirect: false
        }
      });
      
      if (error) {
        console.error('❌ OAuth initiation error:', error);
        throw error;
      }
      
      console.log('✅ OAuth initiation successful, redirecting to Discord...');
      // Browser will redirect to Discord, no need for additional logic
    } catch (error: any) {
      console.error('💥 Discord login error:', error);
      
      let errorMessage = error.message || 'Failed to connect to Discord. Please try again.';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network connection issue. Please check your internet connection and try again.';
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasError = searchParams.get('error');

  if (processingCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-lg font-semibold">Completing sign in...</h3>
              <p className="text-muted-foreground">Please wait while we finalize your authentication.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Welcome
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in with Discord to continue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {hasError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Authentication failed. This might happen if you cancelled the Discord authorization or if there's a network issue.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleDiscordLogin}
              disabled={loading || processingCallback}
              className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              {loading ? "Connecting..." : "Continue with Discord"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy.
            </div>

            {hasError && (
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>Having trouble? Try:</p>
                <ul className="text-xs space-y-1">
                  <li>• Refreshing this page</li>
                  <li>• Checking your internet connection</li>
                  <li>• Making sure Discord is accessible</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
