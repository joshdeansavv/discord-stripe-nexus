import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const AuthTest = () => {
  const { user, session, loading, signOut } = useAuth();

  console.log('🧪 AuthTest component state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    userEmail: user?.email,
    sessionId: session?.user?.id
  });

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User:</strong> {user?.email || 'None'}
        </div>
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        <div>
          <strong>Current Path:</strong> {window.location.pathname}
        </div>
        {user && (
          <Button onClick={signOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        )}
      </CardContent>
    </Card>
  );
};