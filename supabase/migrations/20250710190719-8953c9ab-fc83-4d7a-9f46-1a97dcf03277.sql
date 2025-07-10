
-- First, let's strengthen the RLS policies to be more restrictive and secure

-- Drop existing weak policies that allow service-level access without proper validation
DROP POLICY IF EXISTS "Service can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service can update all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service can manage usage stats" ON public.bot_usage_stats;
DROP POLICY IF EXISTS "Service can insert billing events" ON public.billing_events;

-- Create more restrictive policies for subscribers table
-- Only allow authenticated users to view their own subscription data
CREATE POLICY "Users can view own subscription only" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Only allow authenticated users to update their own subscription data (limited fields)
CREATE POLICY "Users can update own subscription limited" ON public.subscribers
FOR UPDATE USING (
  user_id = auth.uid() 
  AND auth.uid() IS NOT NULL
) WITH CHECK (
  user_id = auth.uid() 
  AND auth.uid() IS NOT NULL
  -- Prevent users from modifying critical fields
  AND OLD.stripe_customer_id = NEW.stripe_customer_id
  AND OLD.subscription_status = NEW.subscription_status
  AND OLD.subscription_start = NEW.subscription_start
  AND OLD.subscription_end = NEW.subscription_end
);

-- Create service role policy for subscription management (only for authenticated service operations)
CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
  AND auth.uid() IS NOT NULL
);

-- Update bot_usage_stats policies to be more restrictive
-- Users can only view their own usage stats
ALTER POLICY "Users can view their own usage stats" ON public.bot_usage_stats
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Service can only manage usage stats with proper authentication
CREATE POLICY "Authenticated service can manage usage stats" ON public.bot_usage_stats
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role'
  AND auth.uid() IS NOT NULL
);

-- Update billing_events policies
-- Users can only view billing events for servers they own with proper validation
ALTER POLICY "Users can view billing events for own servers" ON public.billing_events
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.servers 
    WHERE servers.id = billing_events.server_id 
    AND servers.owner = auth.uid()
  )
);

-- Service can insert billing events only with proper authentication
CREATE POLICY "Authenticated service can insert billing events" ON public.billing_events
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'service_role'
  AND auth.uid() IS NOT NULL
);

-- Strengthen guild_access policies
-- Users can only manage guild access for their own records
ALTER POLICY "Users can manage their own guild access" ON public.guild_access
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

ALTER POLICY "Users can view their own guild access" ON public.guild_access
USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);

-- Add policy to prevent unauthorized guild access creation
CREATE POLICY "Users can only create own guild access" ON public.guild_access
FOR INSERT WITH CHECK (
  user_id = auth.uid() 
  AND auth.uid() IS NOT NULL
);

-- Strengthen servers table policies with additional validation
ALTER POLICY "Users can view own servers" ON public.servers
USING (auth.uid() = owner AND auth.uid() IS NOT NULL);

ALTER POLICY "Users can update own servers" ON public.servers
USING (auth.uid() = owner AND auth.uid() IS NOT NULL);

ALTER POLICY "Users can insert own servers" ON public.servers
WITH CHECK (auth.uid() = owner AND auth.uid() IS NOT NULL);

ALTER POLICY "Users can delete own servers" ON public.servers
USING (auth.uid() = owner AND auth.uid() IS NOT NULL);

-- Strengthen profiles table policies
ALTER POLICY "Users can view own profile" ON public.profiles
USING (auth.uid() = id AND auth.uid() IS NOT NULL);

ALTER POLICY "Users can update own profile" ON public.profiles
USING (auth.uid() = id AND auth.uid() IS NOT NULL);

ALTER POLICY "Users can insert own profile" ON public.profiles
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- Create a security function to validate service operations
CREATE OR REPLACE FUNCTION public.is_authenticated_service()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.jwt() ->> 'role' = 'service_role' AND auth.uid() IS NOT NULL;
$$;

-- Add audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log sensitive operations (can be expanded to write to an audit table)
  RAISE LOG 'Sensitive operation on table % by user %', TG_TABLE_NAME, auth.uid();
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers for sensitive tables
CREATE TRIGGER audit_subscribers_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

CREATE TRIGGER audit_billing_events_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.billing_events
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

-- Add function to validate subscription status changes
CREATE OR REPLACE FUNCTION public.validate_subscription_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow certain status transitions
  IF OLD.subscription_status IS NOT NULL AND NEW.subscription_status IS NOT NULL THEN
    -- Add business logic validation here
    IF NOT (
      (OLD.subscription_status = 'pending' AND NEW.subscription_status IN ('active', 'cancelled')) OR
      (OLD.subscription_status = 'active' AND NEW.subscription_status IN ('cancelled', 'expired')) OR
      (OLD.subscription_status = 'cancelled' AND NEW.subscription_status = 'active') OR
      (OLD.subscription_status = 'expired' AND NEW.subscription_status = 'active')
    ) THEN
      RAISE EXCEPTION 'Invalid subscription status transition from % to %', OLD.subscription_status, NEW.subscription_status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add validation trigger for subscription updates
CREATE TRIGGER validate_subscription_status_changes
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.validate_subscription_update();
