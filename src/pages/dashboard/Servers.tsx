
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Server, Users, Activity, Trash2, ExternalLink, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ServerData {
  id: string;
  name: string;
  invite_url: string | null;
  subscription_status: string;
  monthly_limit: number;
  usage_count: number;
  created_at: string;
}

const Servers = () => {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [serverName, setServerName] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchServers = async () => {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchServers();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('servers')
        .insert({
          name: serverName.trim(),
          invite_url: inviteUrl.trim() || null,
          owner: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Server registered successfully! You can now add the bot to this server.',
      });

      setServerName('');
      setInviteUrl('');
      setShowForm(false);
      fetchServers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Server removed successfully!',
      });

      fetchServers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getBotStatus = (subscriptionStatus: string, usageCount: number) => {
    if (subscriptionStatus === 'active') {
      return {
        status: 'Active',
        variant: 'default' as const,
        description: 'Bot is active and monitoring'
      };
    } else if (usageCount > 0) {
      return {
        status: 'Inactive',
        variant: 'secondary' as const,
        description: 'Bot was active but subscription expired'
      };
    } else {
      return {
        status: 'Ready to Add',
        variant: 'outline' as const,
        description: 'Server registered, ready for bot invitation'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading servers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discord Servers</h1>
          <p className="text-muted-foreground">
            Manage Discord servers where your bot is active or can be added
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Register Server
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Register New Discord Server
            </CardTitle>
            <CardDescription>
              Register a Discord server to track bot usage and manage access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="serverName" className="block text-sm font-medium mb-2">
                  Server Name *
                </label>
                <Input
                  id="serverName"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="My Discord Server"
                  required
                />
              </div>
              <div>
                <label htmlFor="inviteUrl" className="block text-sm font-medium mb-2">
                  Invite URL (Optional)
                </label>
                <Input
                  id="inviteUrl"
                  value={inviteUrl}
                  onChange={(e) => setInviteUrl(e.target.value)}
                  placeholder="https://discord.gg/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add an invite link to make it easier to access your server
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Server'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => {
          const botStatus = getBotStatus(server.subscription_status, server.usage_count);
          return (
            <Card key={server.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteServer(server.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={botStatus.variant}>
                    {botStatus.status}
                  </Badge>
                  {server.subscription_status === 'active' && (
                    <Bot className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {botStatus.description}
                </p>
                
                {server.subscription_status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Usage</span>
                      <span className="font-medium">
                        {server.usage_count} / {server.monthly_limit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((server.usage_count / server.monthly_limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    Added {new Date(server.created_at).toLocaleDateString()}
                  </div>
                  {server.invite_url && (
                    <a
                      href={server.invite_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Join Server <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {servers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No servers registered yet</h3>
            <p className="text-muted-foreground mb-4">
              Register your first Discord server to start tracking bot usage and manage access
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Register Your First Server
            </Button>
          </CardContent>
        </Card>
      )}

      {servers.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium mb-1">How to add the bot to your server:</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Register your Discord server above</li>
                  <li>Ensure you have "Manage Server" permissions</li>
                  <li>Use the bot invitation link (contact support for the link)</li>
                  <li>Grant necessary permissions to the bot</li>
                  <li>Activate your subscription to start monitoring</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Servers;
