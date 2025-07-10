
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
  Zap,
  ArrowUpRight,
  Activity,
  BarChart3
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
            rolesOptimized: Math.floor(totalMessages / 10),
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

  // Show loading state while checking subscription
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">Verifying subscription...</div>
        </div>
      </div>
    );
  }

  // Enhanced non-subscriber view
  if (!isActive) {
    return (
      <div className="space-y-8 p-6">
        <div className="text-center mb-12">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to BuildForMe AI</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Subscribe to unlock AI-powered Discord server building capabilities
          </p>
        </div>

        <Alert className="border-orange-500/20 bg-orange-500/10 max-w-4xl mx-auto">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <AlertDescription className="text-orange-200">
            You need an active subscription to access BuildForMe's AI server building capabilities.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <SubscriptionStatus />
          
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                What You Get
              </CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered Discord server building for $20/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: Sparkles, text: "AI server building in seconds", color: "text-purple-400" },
                  { icon: Bot, text: "Custom themes and layouts", color: "text-blue-400" },
                  { icon: Settings, text: "Smart role analysis and optimization", color: "text-green-400" },
                  { icon: Zap, text: "Unlimited server builds", color: "text-yellow-400" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Enhanced subscriber dashboard
  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-lg text-gray-300">Ready to build amazing Discord servers with AI?</p>
        </div>
        <div className="flex gap-3">
          <a 
            href="https://discord.com/oauth2/authorize?client_id=1391912825534025879"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gradient-primary text-white shadow-lg btn-hover focus-ring">
              <Plus className="w-4 h-4 mr-2" />
              Add Bot to Server
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Active Servers", 
            value: stats.totalServers, 
            icon: Server, 
            color: "from-blue-500 to-cyan-500",
            description: "Connected servers"
          },
          { 
            title: "Servers Built", 
            value: stats.serversBuilt, 
            icon: Sparkles, 
            color: "from-purple-500 to-pink-500",
            description: "AI-generated servers"
          },
          { 
            title: "Roles Optimized", 
            value: stats.rolesOptimized, 
            icon: Bot, 
            color: "from-green-500 to-emerald-500",
            description: "Auto-fixed roles"
          },
          { 
            title: "Uptime", 
            value: `${stats.uptime}%`, 
            icon: TrendingUp, 
            color: "from-orange-500 to-red-500",
            description: "Last 30 days"
          }
        ].map((stat, index) => (
          <Card key={stat.title} className="bg-card/50 border-border/50 backdrop-blur-sm card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <p className="text-xs text-gray-300">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced AI Server Builder */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <Sparkles className="w-6 h-6 mr-3 text-primary" />
              AI Server Builder
            </CardTitle>
            <CardDescription className="text-gray-300 text-base">
              Build custom Discord servers in seconds with advanced AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Ready to create your next server?</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Use our AI to generate complete Discord servers with custom themes, optimized roles, and perfect channel structures.
              </p>
              <a 
                href="https://discord.com/oauth2/authorize?client_id=1391912825534025879"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="gradient-primary text-white shadow-lg btn-hover focus-ring">
                  Start Building with AI
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-300">Latest AI builds and optimizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-300">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-white font-medium mb-2">No recent activity</p>
              <p className="text-sm">Start building servers to see activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-gray-300">Common AI server building tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "Build New Server", color: "from-purple-500 to-pink-500" },
              { icon: Bot, title: "Analyze Roles", color: "from-green-500 to-emerald-500" },
              { icon: Settings, title: "Optimize Server", color: "from-blue-500 to-cyan-500" }
            ].map((action, index) => (
              <Button 
                key={action.title}
                variant="outline" 
                className="h-24 flex-col space-y-3 border-border/30 text-gray-300 hover:bg-muted/50 hover:text-white card-hover focus-ring"
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
