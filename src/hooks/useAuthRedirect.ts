import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

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
        console.log('🔄 Authenticated user on auth page, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);
};