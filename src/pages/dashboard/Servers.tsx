
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, ExternalLink, Activity } from "lucide-react";

const Servers = () => {
  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Connected Servers</h1>
          <p className="text-muted-foreground">Manage your Discord servers and bot integrations</p>
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
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Your Servers
          </CardTitle>
          <CardDescription>
            Discord servers where your bot is active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No servers connected</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add the BuildForMe bot to your Discord servers to get started with AI-powered server building.
            </p>
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1391912825534025879"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gradient-primary text-white shadow-lg btn-hover focus-ring">
                <Plus className="w-4 h-4 mr-2" />
                Add Bot to Server
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servers;
