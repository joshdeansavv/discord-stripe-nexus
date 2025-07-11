
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { cleanupAuthTokens } from '@/utils/authHelpers';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { 
    hasUser: !!user, 
    hasSession: !!session,
    loading, 
    userEmail: user?.email || 'None',
    sessionValid: session && session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false
  });

  if (loading) {
    console.log('⏳ ProtectedRoute showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check if we have an invalid session
  if (session && session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
    console.log('⚠️ ProtectedRoute: Session expired, cleaning up and redirecting');
    cleanupAuthTokens();
    return <Navigate to="/auth" replace />;
  }

  if (!user || !session) {
    console.log('❌ ProtectedRoute: No valid user/session, redirecting to /auth');
    cleanupAuthTokens();
    return <Navigate to="/auth" replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
