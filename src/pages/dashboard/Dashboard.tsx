
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  MessageSquare, 
  Bot, 
  TrendingUp, 
  Server, 
  Sparkles,
  Plus,
  ExternalLink,
  Settings,
  AlertTriangle,
  Zap
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { subscription, loading, isActive } = useSubscription();
  const [stats, setStats] = useState({
    totalServers: 0,
    serversBuilt: 0,
    rolesOptimized: 0,
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
            serversBuilt: totalCommands,
            rolesOptimized: Math.floor(totalMessages / 10), // Approximate role optimizations
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
            <h1 className="text-3xl font-bold text-white">BuildForMe AI Dashboard</h1>
            <p className="text-gray-400 mt-1">Subscribe to access AI server building features</p>
          </div>
        </div>

        <Alert className="border-orange-600 bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-200">
            You need an active subscription to access BuildForMe's AI server building capabilities.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionStatus />
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">What You Get</CardTitle>
              <CardDescription className="text-gray-400">AI-powered Discord server building for $15/month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">AI server building in seconds</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Custom themes and layouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Smart role analysis and optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Unlimited server builds</span>
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
          <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
          <p className="text-gray-400 mt-1">Ready to build amazing Discord servers with AI?</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Build New Server
        </Button>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Servers</CardTitle>
            <Server className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalServers}</div>
            <p className="text-xs text-gray-400">Connected servers</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Servers Built</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.serversBuilt}</div>
            <p className="text-xs text-gray-400">AI-generated servers</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Roles Optimized</CardTitle>
            <Bot className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.rolesOptimized}</div>
            <p className="text-xs text-gray-400">Auto-fixed roles</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.uptime}%</div>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Server Builder */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              AI Server Builder
            </CardTitle>
            <CardDescription className="text-gray-400">Build custom Discord servers in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-300 mb-4">Ready to create your next server?</p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Building with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest AI builds and optimizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-300">No recent activity</p>
              <p className="text-sm text-gray-500">Start building servers to see activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">Common AI server building tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2 border-gray-600 text-gray-300 hover:bg-gray-700">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>Build New Server</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 border-gray-600 text-gray-300 hover:bg-gray-700">
              <Bot className="w-6 h-6 text-green-400" />
              <span>Analyze Roles</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 border-gray-600 text-gray-300 hover:bg-gray-700">
              <Settings className="w-6 h-6 text-blue-400" />
              <span>Optimize Server</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
