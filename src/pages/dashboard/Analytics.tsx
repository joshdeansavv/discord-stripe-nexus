
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, Users } from "lucide-react";

const Analytics = () => {
  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your bot's performance and server activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Commands", 
            value: "0", 
            icon: Activity, 
            color: "from-blue-500 to-cyan-500",
            description: "Commands executed"
          },
          { 
            title: "Active Servers", 
            value: "0", 
            icon: Users, 
            color: "from-green-500 to-emerald-500",
            description: "Connected servers"
          },
          { 
            title: "Messages Processed", 
            value: "0", 
            icon: TrendingUp, 
            color: "from-purple-500 to-pink-500",
            description: "Messages handled"
          },
          { 
            title: "Uptime", 
            value: "99.9%", 
            icon: BarChart3, 
            color: "from-orange-500 to-red-500",
            description: "Last 30 days"
          }
        ].map((stat, index) => (
          <Card key={stat.title} className="bg-card/50 border-border/50 backdrop-blur-sm card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Usage Analytics
          </CardTitle>
          <CardDescription>
            Detailed analytics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No analytics data</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Analytics data will appear here once your bot starts processing commands and messages in your Discord servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
