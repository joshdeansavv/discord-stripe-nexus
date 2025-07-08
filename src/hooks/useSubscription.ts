
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionData {
  subscription_status: 'active' | 'cancelled' | 'expired' | 'pending';
  subscription_tier: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setLoading(true);
      console.log('Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }
      
      console.log('Subscription check response:', data);
      setSubscription(data);
      
      // Verify the subscription status is truly active
      if (data?.subscription_status === 'active') {
        console.log('✅ Active subscription confirmed');
      } else {
        console.log('❌ No active subscription found, status:', data?.subscription_status);
      }
      
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      // Set default state on error
      setSubscription({
        subscription_status: 'pending',
        subscription_tier: null,
        subscription_start: null,
        subscription_end: null
      });
      toast({
        title: "Error",
        description: "Failed to check subscription status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    try {
      console.log('Creating checkout session...');
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data.url) {
        console.log('Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        console.log('Opening portal URL:', data.url);
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check subscription on mount and when auth state changes
    checkSubscription();

    // Listen for auth state changes to recheck subscription
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed, rechecking subscription...');
        checkSubscription();
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const isActive = subscription?.subscription_status === 'active';
  
  console.log('Current subscription state:', { 
    subscription, 
    loading, 
    isActive,
    status: subscription?.subscription_status 
  });

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isActive
  };
};
