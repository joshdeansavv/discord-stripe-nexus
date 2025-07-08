import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  Server, 
  Crown,
  Plus,
  ExternalLink,
  Settings
} from "lucide-react";

const Dashboard = () => {
  // Mock data - replace with real data from your API
  const stats = {
    totalServers: 3,
    totalUsers: 1250,
    messagesModerated: 456,
    uptime: 99.9
  };

  const recentActivity = [
    { id: 1, action: "Server added", server: "Gaming Community", time: "2 hours ago" },
    { id: 2, action: "Auto-mod triggered", server: "Study Group", time: "4 hours ago" },
    { id: 3, action: "Custom command created", server: "Art Studio", time: "1 day ago" },
  ];

  const connectedServers = [
    { 
      id: 1, 
      name: "Gaming Community", 
      members: 850, 
      status: "active", 
      plan: "Pro",
      icon: "🎮"
    },
    { 
      id: 2, 
      name: "Study Group", 
      members: 250, 
      status: "active", 
      plan: "Free",
      icon: "📚"
    },
    { 
      id: 3, 
      name: "Art Studio", 
      members: 150, 
      status: "active", 
      plan: "Free",
      icon: "🎨"
    },
  ];

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServers}</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Moderated</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesModerated}</div>
            <p className="text-xs text-muted-foreground">This week</p>
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
        {/* Connected Servers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Connected Servers</CardTitle>
            <CardDescription>Manage your Discord servers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedServers.map((server) => (
                <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      {server.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{server.name}</h3>
                      <p className="text-sm text-gray-600">{server.members} members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={server.plan === "Pro" ? "default" : "secondary"}>
                      {server.plan === "Pro" && <Crown className="w-3 h-3 mr-1" />}
                      {server.plan}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
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
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.server}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
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
              <Crown className="w-6 h-6" />
              <span>Upgrade to Pro</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
