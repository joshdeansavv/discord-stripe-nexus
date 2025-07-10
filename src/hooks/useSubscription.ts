
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionData {
  subscription_status: 'active' | 'cancelled' | 'expired' | 'pending';
  subscription_tier: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkSubscription = async () => {
    if (!user) {
      console.log('No user found, skipping subscription check');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Checking subscription status for user:', user.id);
      
      // First check if we can access the subscribers table directly
      const { data: directData, error: directError } = await supabase
        .from('subscribers')
        .select('subscription_status, subscription_tier, subscription_start, subscription_end, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (directError) {
        console.log('Direct database access failed, trying function:', directError);
        
        // Fallback to using the check-subscription function
        const { data: functionData, error: functionError } = await supabase.functions.invoke('check-subscription');
        
        if (functionError) {
          console.error('Function call also failed:', functionError);
          throw functionError;
        }
        
        console.log('Function response:', functionData);
        setSubscription(functionData);
      } else {
        console.log('Direct database response:', directData);
        setSubscription(directData);
      }
      
      // Verify the subscription status is truly active
      const finalData = directData || subscription;
      if (finalData?.subscription_status === 'active') {
        console.log('✅ Active subscription confirmed');
      } else {
        console.log('❌ No active subscription found, status:', finalData?.subscription_status);
      }
      
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      
      // Handle specific RLS errors
      if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
        console.log('RLS policy blocked access - user may not have subscription record');
        setSubscription({
          subscription_status: 'pending',
          subscription_tier: null,
          subscription_start: null,
          subscription_end: null,
          stripe_customer_id: null
        });
      } else {
        // Set default state on other errors
        setSubscription({
          subscription_status: 'pending',
          subscription_tier: null,
          subscription_start: null,
          subscription_end: null,
          stripe_customer_id: null
        });
        
        toast({
          title: "Error",
          description: "Failed to check subscription status. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a checkout session.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating checkout session for user:', user.id);
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Checkout creation error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the customer portal.",
        variant: "destructive",
      });
      return;
    }

    if (!subscription?.stripe_customer_id) {
      toast({
        title: "No Subscription Found",
        description: "You need an active subscription to access the customer portal.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Opening customer portal for user:', user.id);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Opening portal URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();

      // Listen for auth state changes to recheck subscription
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Auth state changed, rechecking subscription...');
          checkSubscription();
        } else if (event === 'SIGNED_OUT') {
          setSubscription(null);
          setLoading(false);
        }
      });

      return () => authSubscription.unsubscribe();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const isActive = subscription?.subscription_status === 'active';
  
  console.log('Current subscription state:', { 
    subscription, 
    loading, 
    isActive,
    status: subscription?.subscription_status,
    userId: user?.id
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
