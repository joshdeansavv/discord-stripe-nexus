
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase, debugAuth } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useProfileSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const syncAttempted = useRef(false);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!user || !session) {
        debugAuth.log('No user or session available for sync');
        return;
      }

      // Prevent multiple sync attempts for the same user
      const syncKey = `sync_${user.id}`;
      if (syncAttempted.current) {
        debugAuth.log('Sync already attempted for this session');
        return;
      }

      syncAttempted.current = true;

      try {
        debugAuth.log('🔄 Starting comprehensive profile sync', {
          userId: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          discordId: user.user_metadata?.provider_id,
          discordUsername: user.user_metadata?.user_name || user.user_metadata?.full_name,
          rawMetadata: user.user_metadata
        });

        // Step 1: Check and create profile
        await ensureProfileExists();
        
        // Step 2: Check and create/update subscriber
        await ensureSubscriberExists();

        debugAuth.success('Profile sync completed successfully');

      } catch (error) {
        debugAuth.error('Profile sync failed', error);
        toast({
          title: 'Profile Sync Error',
          description: 'Failed to sync your profile. Please refresh the page or contact support.',
          variant: 'destructive',
        });
      }
    };

    const ensureProfileExists = async () => {
      debugAuth.log('Checking profile existence');
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        debugAuth.error('Error checking profile', fetchError);
        throw fetchError;
      }

      if (!existingProfile) {
        debugAuth.log('Creating new profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
          });

        if (insertError) {
          debugAuth.error('Error creating profile', insertError);
          throw insertError;
        } else {
          debugAuth.success('Profile created successfully');
        }
      } else {
        debugAuth.log('Profile already exists', existingProfile);
      }
    };

    const ensureSubscriberExists = async () => {
      debugAuth.log('Checking subscriber existence');

      const { data: existingSubscriber, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        debugAuth.error('Error checking subscriber', fetchError);
        throw fetchError;
      }

      const discordUserId = user.user_metadata?.provider_id;
      const discordUsername = user.user_metadata?.user_name || user.user_metadata?.full_name;

      if (!existingSubscriber) {
        debugAuth.log('Creating new subscriber record');
        const subscriberData = {
          user_id: user.id,
          email: user.email || '',
          discord_user_id: discordUserId || null,
          discord_username: discordUsername || null,
          subscription_status: 'pending' as const,
          subscription_tier: 'basic',
        };

        debugAuth.log('Subscriber data to insert', subscriberData);

        const { error: insertError } = await supabase
          .from('subscribers')
          .insert(subscriberData);

        if (insertError) {
          debugAuth.error('Error creating subscriber', insertError);
          throw insertError;
        } else {
          debugAuth.success('Subscriber record created');
        }
      } else {
        // Update existing subscriber with Discord info if missing
        const updates: any = {};
        
        if (!existingSubscriber.discord_user_id && discordUserId) {
          updates.discord_user_id = discordUserId;
        }
        if (!existingSubscriber.discord_username && discordUsername) {
          updates.discord_username = discordUsername;
        }

        if (Object.keys(updates).length > 0) {
          debugAuth.log('Updating subscriber with Discord info', updates);
          
          const { error: updateError } = await supabase
            .from('subscribers')
            .update(updates)
            .eq('id', existingSubscriber.id);

          if (updateError) {
            debugAuth.error('Error updating subscriber', updateError);
            throw updateError;
          } else {
            debugAuth.success('Subscriber updated with Discord info');
          }
        } else {
          debugAuth.log('Subscriber already has complete info', existingSubscriber);
        }
      }
    };

    // Only sync if we have a user and session, and haven't synced yet
    if (user && session && !syncAttempted.current) {
      // Add a small delay to ensure auth is fully established
      const timeoutId = setTimeout(() => {
        syncUserProfile();
      }, 1500);

      return () => clearTimeout(timeoutId);
    }

    // Reset sync flag when user changes
    return () => {
      if (!user) {
        syncAttempted.current = false;
      }
    };
  }, [user, session, toast]);

  // Return sync status for debugging
  return {
    syncAttempted: syncAttempted.current,
    userId: user?.id,
    hasSession: !!session
  };
};
