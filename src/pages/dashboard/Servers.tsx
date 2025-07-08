
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, ExternalLink, Activity, Server, Settings } from "lucide-react";
import { useState } from "react";

const Servers = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddBot = () => {
    setIsConnecting(true);
    // Reset state after opening the OAuth link
    setTimeout(() => setIsConnecting(false), 1000);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Connected Servers</h1>
          <p className="text-gray-300">Manage your Discord servers and bot integrations</p>
        </div>
        <div className="flex gap-3">
          <a 
            href="https://discord.com/oauth2/authorize?client_id=1391912825534025879"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAddBot}
          >
            <Button 
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isConnecting ? 'Opening Discord...' : 'Add Bot to Server'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Server className="w-5 h-5 mr-2 text-blue-400" />
              Server Status
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current bot status across servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Online Servers</span>
                <Badge className="bg-green-600 text-white hover:bg-green-700">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Servers</span>
                <Badge variant="secondary" className="bg-gray-600 text-gray-200">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Bot Status</span>
                <Badge className="bg-green-600 text-white hover:bg-green-700">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Activity className="w-5 h-5 mr-2 text-orange-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest bot interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm">No recent activity</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your bot settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Bot Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white justify-start"
              >
                <Activity className="w-4 h-4 mr-2" />
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Your Servers
          </CardTitle>
          <CardDescription className="text-gray-400">
            Discord servers where your bot is active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No servers connected</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Add the BuildForMe bot to your Discord servers to get started with AI-powered server building.
            </p>
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1391912825534025879"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAddBot}
            >
              <Button 
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isConnecting ? 'Opening Discord...' : 'Add Bot to Server'}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servers;
