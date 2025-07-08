
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Activity, Users, RefreshCw } from "lucide-react";
import { useState } from "react";

const Analytics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your bot's performance and activity</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Commands", 
            value: "0", 
            icon: Activity, 
            color: "text-blue-500",
            description: "Total executed"
          },
          { 
            title: "Servers", 
            value: "0", 
            icon: Users, 
            color: "text-green-500",
            description: "Connected"
          },
          { 
            title: "Messages", 
            value: "0", 
            icon: TrendingUp, 
            color: "text-orange-500",
            description: "Processed"
          },
          { 
            title: "Uptime", 
            value: "99.9%", 
            icon: BarChart3, 
            color: "text-purple-500",
            description: "Last 30 days"
          }
        ].map((stat) => (
          <Card key={stat.title} className="bg-card border-border hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              Usage Analytics
            </CardTitle>
            <CardDescription>
              Performance metrics and usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-medium text-foreground mb-1">No data available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start using your bot to see analytics here
              </p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Check for Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance
            </CardTitle>
            <CardDescription>
              System performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Response Time", value: "< 100ms", color: "text-green-500" },
                { label: "Error Rate", value: "0.1%", color: "text-green-500" },
                { label: "Memory Usage", value: "45%", color: "text-yellow-500" },
                { label: "CPU Usage", value: "12%", color: "text-green-500" }
              ].map((metric) => (
                <div key={metric.label} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className={`text-sm font-medium ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
