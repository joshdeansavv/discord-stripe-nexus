
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Activity, Users, RefreshCw } from "lucide-react";
import { useState } from "react";

const Analytics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-300">Track your bot's performance and server activity</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Commands", 
            value: "0", 
            icon: Activity, 
            color: "bg-blue-500",
            description: "Commands executed",
            change: "+0%"
          },
          { 
            title: "Active Servers", 
            value: "0", 
            icon: Users, 
            color: "bg-green-500",
            description: "Connected servers",
            change: "+0%"
          },
          { 
            title: "Messages Processed", 
            value: "0", 
            icon: TrendingUp, 
            color: "bg-orange-500",
            description: "Messages handled",
            change: "+0%"
          },
          { 
            title: "Uptime", 
            value: "99.9%", 
            icon: BarChart3, 
            color: "bg-purple-500",
            description: "Last 30 days",
            change: "Excellent"
          }
        ].map((stat, index) => (
          <Card key={stat.title} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{stat.description}</p>
                <span className="text-xs text-green-400 font-medium">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Usage Analytics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Detailed analytics and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No analytics data</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Analytics data will appear here once your bot starts processing commands and messages in your Discord servers.
              </p>
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Check for Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Performance Trends
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Response Time</span>
                <span className="text-green-400 font-medium">< 100ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Error Rate</span>
                <span className="text-green-400 font-medium">0.1%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Memory Usage</span>
                <span className="text-yellow-400 font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">CPU Usage</span>
                <span className="text-green-400 font-medium">12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
