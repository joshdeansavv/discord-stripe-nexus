
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for OAuth errors in URL
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.log('OAuth error detected:', error, errorDescription);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error === 'access_denied') {
        errorMessage = 'Access was denied. Please make sure you approve the Discord authorization request.';
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clean up URL by replacing current state
      window.history.replaceState({}, document.title, '/auth');
    }

    // Check for OAuth callback tokens in URL fragment
    const fragment = window.location.hash;
    if (fragment && fragment.includes('access_token')) {
      console.log('OAuth callback detected, processing tokens...');
      setLoading(true);
      
      // Let Supabase handle the OAuth callback
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session error:', error);
          toast({
            title: "Authentication Error",
            description: "Failed to process authentication. Please try again.",
            variant: "destructive",
          });
        } else if (session) {
          console.log('✅ OAuth session established');
          navigate("/dashboard");
        }
        setLoading(false);
      });
      
      return;
    }

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    if (!error && !fragment) {
      checkUser();
    }
  }, [navigate, searchParams, toast]);

  const handleDiscordLogin = async () => {
    try {
      setLoading(true);
      
      // Clear any existing auth state first
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // Continue even if signout fails
        console.log('Previous signout attempt:', err);
      }

      console.log('Initiating Discord OAuth...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          skipBrowserRedirect: false
        }
      });
      
      if (error) {
        console.error('OAuth initiation error:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Discord login error:', error);
      
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

  const handleRetry = async () => {
    setRetrying(true);
    
    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Test connection to Supabase
      await supabase.auth.getSession();
      
      toast({
        title: "Connection Restored",
        description: "You can now try logging in again.",
      });
    } catch (error) {
      toast({
        title: "Still Having Issues",
        description: "Please check your internet connection and try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  const hasError = searchParams.get('error');

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

            {/* Discord Login Button */}
            <Button 
              onClick={handleDiscordLogin}
              disabled={loading || retrying}
              className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              {loading ? "Connecting..." : retrying ? "Checking connection..." : "Continue with Discord"}
            </Button>

            {hasError && (
              <Button 
                onClick={handleRetry}
                disabled={retrying || loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? "Checking..." : "Try Again"}
              </Button>
            )}

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
