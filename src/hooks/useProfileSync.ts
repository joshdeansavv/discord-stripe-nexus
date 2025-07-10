
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useProfileSync = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!user || !session) return;

      try {
        console.log('🔄 Syncing user profile for:', user.email);
        console.log('User metadata:', user.user_metadata);

        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking profile:', fetchError);
          return;
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          console.log('📝 Creating new profile for user:', user.id);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: 'Profile Creation Error',
              description: 'Failed to create user profile. Some features may not work.',
              variant: 'destructive',
            });
          } else {
            console.log('✅ Profile created successfully');
          }
        } else {
          console.log('✅ Profile already exists');
        }

        // Sync Discord subscriber data if user has Discord metadata
        await syncDiscordSubscriberData();

      } catch (error) {
        console.error('Profile sync error:', error);
      }
    };

    const syncDiscordSubscriberData = async () => {
      if (!user?.user_metadata) return;

      try {
        const discordUserId = user.user_metadata.provider_id;
        const discordUsername = user.user_metadata.user_name || user.user_metadata.full_name;

        if (!discordUserId) {
          console.log('No Discord user ID found');
          return;
        }

        // Check if subscriber record exists
        const { data: existingSubscriber, error: fetchError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking subscriber:', fetchError);
          return;
        }

        if (!existingSubscriber) {
          console.log('📝 Creating subscriber record for Discord user:', discordUsername);
          const { error: insertError } = await supabase
            .from('subscribers')
            .insert({
              user_id: user.id,
              email: user.email || '',
              discord_user_id: discordUserId,
              discord_username: discordUsername,
              subscription_status: 'pending',
              subscription_tier: 'basic',
            });

          if (insertError) {
            console.error('Error creating subscriber:', insertError);
          } else {
            console.log('✅ Subscriber record created');
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
            console.log('📝 Updating subscriber with Discord info');
            const { error: updateError } = await supabase
              .from('subscribers')
              .update(updates)
              .eq('id', existingSubscriber.id);

            if (updateError) {
              console.error('Error updating subscriber:', updateError);
            } else {
              console.log('✅ Subscriber updated with Discord info');
            }
          }
        }
      } catch (error) {
        console.error('Discord subscriber sync error:', error);
      }
    };

    if (user && session) {
      // Add a small delay to ensure auth is fully established
      setTimeout(syncUserProfile, 1000);
    }
  }, [user, session]);
};
