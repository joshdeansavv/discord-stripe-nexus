
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  Server, 
  Crown,
  Plus,
  ExternalLink,
  Settings,
  AlertTriangle
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { subscription, loading, isActive } = useSubscription();
  const [stats, setStats] = useState({
    totalServers: 0,
    totalUsers: 0,
    messagesModerated: 0,
    uptime: 99.9
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch bot usage stats
        const { data: usageData } = await supabase
          .from('bot_usage_stats')
          .select('*');

        // Fetch guild access data
        const { data: guildData } = await supabase
          .from('guild_access')
          .select('*')
          .eq('is_active', true);

        if (usageData) {
          const totalMessages = usageData.reduce((sum, stat) => sum + (stat.messages_moderated || 0), 0);
          const totalCommands = usageData.reduce((sum, stat) => sum + (stat.commands_used || 0), 0);
          
          setStats(prev => ({
            ...prev,
            messagesModerated: totalMessages,
            totalServers: guildData?.length || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (isActive) {
      fetchStats();
    }
  }, [isActive]);

  // Show access denied for non-subscribers
  if (!loading && !isActive) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discord Bot Pro Dashboard</h1>
            <p className="text-gray-600 mt-1">Subscribe to access premium features</p>
          </div>
        </div>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You need an active subscription to access the Discord Bot Pro dashboard and features.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionStatus />
          
          <Card>
            <CardHeader>
              <CardTitle>What You Get</CardTitle>
              <CardDescription>Premium Discord bot features for $15/month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Advanced moderation tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Custom commands and automation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Analytics and insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your Discord servers</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add to Server
        </Button>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServers}</div>
            <p className="text-xs text-muted-foreground">Active servers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all servers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Moderated</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesModerated}</div>
            <p className="text-xs text-muted-foreground">Total moderated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Servers - Real data will be loaded here */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Connected Servers</CardTitle>
            <CardDescription>Manage your Discord servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No servers connected yet</p>
              <p className="text-sm">Add the bot to your Discord server to get started</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here once you start using the bot</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="w-6 h-6" />
              <span>Add Bot to Server</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="w-6 h-6" />
              <span>Configure Settings</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ExternalLink className="w-6 h-6" />
              <span>View Documentation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
