
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkSupabaseConnection = async () => {
    setChecking(true);
    try {
      const { error } = await supabase.auth.getSession();
      setSupabaseConnected(!error);
    } catch (error) {
      console.error('Supabase connection check failed:', error);
      setSupabaseConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection check
    checkSupabaseConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show if there are connection issues
  if (isOnline && supabaseConnected !== false) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">
              {!isOnline ? 'No internet connection' : 'Service connection issue'}
            </p>
            <p className="text-sm">
              {!isOnline 
                ? 'Please check your network connection.' 
                : 'Unable to connect to authentication service.'}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkSupabaseConnection}
              disabled={checking || !isOnline}
              className="w-full"
            >
              <RefreshCw className={`w-3 h-3 mr-2 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Retry Connection'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
