
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Eye, EyeOff, Database, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, debugAuth } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  email: string;
  created_at: string;
}

interface SubscriberData {
  id: string;
  user_id: string;
  email: string;
  discord_user_id: string | null;
  discord_username: string | null;
  subscription_status: string;
  subscription_tier: string;
  created_at: string;
}

export const AuthDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const fetchDebugData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      debugAuth.log('Fetching debug data for user', user.id);

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        debugAuth.error('Profile fetch error', profileError);
      } else {
        setProfileData(profile);
        debugAuth.log('Profile data fetched', profile);
      }

      // Fetch subscriber
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError && subscriberError.code !== 'PGRST116') {
        debugAuth.error('Subscriber fetch error', subscriberError);
      } else {
        setSubscriberData(subscriber);
        debugAuth.log('Subscriber data fetched', subscriber);
      }

    } catch (error) {
      debugAuth.error('Debug data fetch failed', error);
    } finally {
      setLoading(false);
    }
  };

  const forceProfileSync = async () => {
    if (!user) return;

    setLoading(true);
    try {
      debugAuth.log('Force creating profile and subscriber');

      // Force create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
        });

      if (profileError) {
        debugAuth.error('Force profile creation error', profileError);
        throw profileError;
      }

      // Force create subscriber
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          discord_user_id: user.user_metadata?.provider_id || null,
          discord_username: user.user_metadata?.user_name || user.user_metadata?.full_name || null,
          subscription_status: 'pending',
          subscription_tier: 'basic',
        });

      if (subscriberError) {
        debugAuth.error('Force subscriber creation error', subscriberError);
        throw subscriberError;
      }

      debugAuth.success('Force sync completed');
      toast({
        title: 'Sync Completed',
        description: 'Profile and subscriber data have been synced successfully.',
      });

      await fetchDebugData();

    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isVisible) {
      fetchDebugData();
    }
  }, [user, isVisible]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {isVisible && (
          <Card className="w-96 max-h-96 overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Auth Debug Panel
              </CardTitle>
              <CardDescription className="text-xs">
                Current authentication and database status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Auth Status */}
              <div className="space-y-2">
                <div className="font-medium">Authentication Status</div>
                <div className="space-y-1 pl-2">
                  <div>User ID: {user.id}</div>
                  <div>Email: {user.email}</div>
                  <div>Provider: {user.app_metadata?.provider}</div>
                  <div>Session: {session ? '✅ Active' : '❌ None'}</div>
                  <div>Discord ID: {user.user_metadata?.provider_id || 'None'}</div>
                  <div>Discord Username: {user.user_metadata?.user_name || user.user_metadata?.full_name || 'None'}</div>
                </div>
              </div>

              {/* Profile Status */}
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  Profile Status
                  <Badge variant={profileData ? 'default' : 'destructive'}>
                    {profileData ? 'Found' : 'Missing'}
                  </Badge>
                </div>
                {profileData && (
                  <div className="space-y-1 pl-2">
                    <div>ID: {profileData.id}</div>
                    <div>Email: {profileData.email}</div>
                    <div>Created: {new Date(profileData.created_at).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Subscriber Status */}
              <div className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  Subscriber Status
                  <Badge variant={subscriberData ? 'default' : 'destructive'}>
                    {subscriberData ? 'Found' : 'Missing'}
                  </Badge>
                </div>
                {subscriberData && (
                  <div className="space-y-1 pl-2">
                    <div>ID: {subscriberData.id}</div>
                    <div>Status: {subscriberData.subscription_status}</div>
                    <div>Tier: {subscriberData.subscription_tier}</div>
                    <div>Discord ID: {subscriberData.discord_user_id || 'None'}</div>
                    <div>Discord Username: {subscriberData.discord_username || 'None'}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={fetchDebugData} 
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={forceProfileSync} 
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  Force Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={() => setIsVisible(!isVisible)}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Debug
        </Button>
      </div>
    </div>
  );
};
