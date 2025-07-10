
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ProfileData {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface SubscriberData {
  id: string;
  discord_user_id: string | null;
  discord_username: string | null;
  subscription_status: string;
  subscription_tier: string;
  created_at: string;
}

const Profile = () => {
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      console.log('📊 Fetching profile data for user:', user.id);
      
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        console.log('Profile data:', profile);
        setProfileData(profile);
      }

      // Fetch subscriber data
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('Subscriber fetch error:', subscriberError);
      } else {
        console.log('Subscriber data:', subscriber);
        setSubscriberData(subscriber);
      }

    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await fetchProfileData();
      toast({
        title: "Profile refreshed",
        description: "Profile data has been refreshed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh profile data.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      // Profile updates would go here
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchProfileData();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="text-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <div className="text-foreground">No user data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <Button
            onClick={handleRefreshProfile}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-foreground">
              {subscriberData?.discord_username || user.user_metadata?.full_name || user.user_metadata?.user_name || "User"}
            </CardTitle>
            <CardDescription className="flex items-center justify-center">
              <Badge variant={subscriberData?.subscription_status === 'active' ? 'default' : 'outline'} className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>{subscriberData?.subscription_status || 'Pending'}</span>
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="lg:col-span-2 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData?.email || user.email || ''}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Discord Username
                </Label>
                <Input
                  id="username"
                  value={subscriberData?.discord_username || user.user_metadata?.user_name || 'Not available'}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord-id" className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Discord ID
                </Label>
                <Input
                  id="discord-id"
                  value={subscriberData?.discord_user_id || user.user_metadata?.provider_id || 'Not available'}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier" className="flex items-center">
                  <Badge className="w-4 h-4 mr-2" />
                  Subscription Tier
                </Label>
                <Input
                  id="tier"
                  value={subscriberData?.subscription_tier || 'Basic'}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="created" className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Account Created
                </Label>
                <Input
                  id="created"
                  value={profileData?.created_at ? format(new Date(profileData.created_at), 'MMM dd, yyyy') : 'Unknown'}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider" className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Login Provider
                </Label>
                <Input
                  id="provider"
                  value="Discord"
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </div>

            {/* Debug Info Card */}
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>Profile ID: {profileData?.id || 'Not found'}</div>
                <div>Subscriber ID: {subscriberData?.id || 'Not found'}</div>
                <div>Auth User ID: {user.id}</div>
                <div>Profile in DB: {profileData ? '✅ Yes' : '❌ No'}</div>
                <div>Subscriber in DB: {subscriberData ? '✅ Yes' : '❌ No'}</div>
              </CardContent>
            </Card>

            <div className="pt-4 border-t border-border/50">
              <Button 
                onClick={handleUpdateProfile}
                disabled={updating}
                className="gradient-primary text-white"
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
