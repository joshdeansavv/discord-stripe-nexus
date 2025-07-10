import { useEffect, useState } from 'react';
import { Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SecurityEvent {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  event: string;
  details?: string;
  userId?: string;
}

export const SecurityAuditLog = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for security events from console logs
    const originalConsole = {
      info: console.info,
      warn: console.warn,
      error: console.error
    };

    const captureSecurityEvents = (level: 'info' | 'warn' | 'error') => {
      return (...args: any[]) => {
        originalConsole[level](...args);
        
        // Capture security-related logs
        const message = args.join(' ');
        if (message.includes('[SECURITY]')) {
          const event: SecurityEvent = {
            timestamp: new Date().toISOString(),
            level,
            event: message.replace('[SECURITY]', '').trim(),
            userId: user?.id
          };
          
          setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
        }
      };
    };

    console.info = captureSecurityEvents('info');
    console.warn = captureSecurityEvents('warn');
    console.error = captureSecurityEvents('error');

    return () => {
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, [user?.id]);

  if (!user || !isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-40"
      >
        <Shield className="w-4 h-4 mr-2" />
        Security Log
      </Button>
    );
  }

  const getEventIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warn':
        return <Eye className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getEventBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive' as const;
      case 'warn':
        return 'secondary' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <CardTitle className="text-sm">Security Audit Log</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
        <CardDescription className="text-xs">
          Real-time security events and authentication logs
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-64">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No security events recorded
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice().reverse().map((event, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 rounded-lg border border-border/50"
                >
                  {getEventIcon(event.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge
                        variant={getEventBadgeVariant(event.level)}
                        className="text-xs"
                      >
                        {event.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground line-clamp-2">
                      {event.event}
                    </p>
                    {event.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="mt-4 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEvents([])}
            className="w-full text-xs"
          >
            Clear Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};