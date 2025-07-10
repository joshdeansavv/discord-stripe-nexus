
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthSecurity } from '@/hooks/useAuthSecurity';
import { useAuth } from '@/hooks/useAuth';

export const SecurityMonitor = () => {
  const { securityCheck, refreshSession } = useAuthSecurity();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  if (!user) return null;

  const getSecurityIcon = () => {
    switch (securityCheck.securityLevel) {
      case 'high':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSecurityMessage = () => {
    if (!securityCheck.hasValidSession) {
      return 'Session expired. Please sign in again.';
    }
    
    switch (securityCheck.securityLevel) {
      case 'high':
        return 'Security status: Optimal';
      case 'medium':
        return 'Session expiring soon. Consider refreshing.';
      case 'low':
        return 'Immediate attention required. Session expires soon.';
    }
  };

  const formatTimeRemaining = () => {
    if (!securityCheck.sessionExpiry) return 'Unknown';
    
    const now = new Date();
    const expiry = new Date(securityCheck.sessionExpiry);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert 
        variant={securityCheck.securityLevel === 'low' ? 'destructive' : 'default'}
        className="cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {getSecurityIcon()}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span className="text-sm">{getSecurityMessage()}</span>
            <Badge variant="outline" className="ml-2">
              {securityCheck.securityLevel.toUpperCase()}
            </Badge>
          </div>
          
          {showDetails && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Session Status:</span>
                <span className={securityCheck.hasValidSession ? 'text-green-600' : 'text-red-600'}>
                  {securityCheck.hasValidSession ? 'Valid' : 'Invalid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time Remaining:</span>
                <span>{formatTimeRemaining()}</span>
              </div>
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={securityCheck.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {securityCheck.isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              
              {securityCheck.securityLevel !== 'high' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshSession();
                  }}
                  className="w-full mt-2"
                >
                  Refresh Session
                </Button>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
