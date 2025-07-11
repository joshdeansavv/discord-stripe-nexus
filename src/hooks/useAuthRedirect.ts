
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { debugAuth } from '@/integrations/supabase/client';

interface UseAuthRedirectProps {
  user: User | null;
  loading: boolean;
}

export const useAuthRedirect = ({ user, loading }: UseAuthRedirectProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth is not loading and we have a definitive auth state
    if (!loading) {
      const currentPath = window.location.pathname;
      
      if (user && currentPath === '/auth') {
        debugAuth.log('🔄 Authenticated user on auth page, redirecting to dashboard');
        // Use window.location for a clean redirect
        window.location.href = '/dashboard';
      }
    }
  }, [user, loading, navigate]);
};
