
-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- Create subscribers table to track who has paid
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  discord_user_id TEXT,
  discord_username TEXT,
  stripe_customer_id TEXT,
  subscription_status subscription_status DEFAULT 'pending',
  subscription_tier TEXT DEFAULT 'basic',
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create guild_access table to track which Discord servers the user can add the bot to
CREATE TABLE public.guild_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,
  discord_guild_name TEXT,
  bot_added_at TIMESTAMPTZ,
  invite_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, discord_guild_id)
);

-- Create bot_usage_stats table to track actual usage
CREATE TABLE public.bot_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_guild_id TEXT NOT NULL,
  messages_moderated INTEGER DEFAULT 0,
  commands_used INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscribers
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service can insert subscriptions" ON public.subscribers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update all subscriptions" ON public.subscribers
FOR UPDATE USING (true);

-- RLS Policies for guild_access
CREATE POLICY "Users can view their own guild access" ON public.guild_access
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own guild access" ON public.guild_access
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for bot_usage_stats
CREATE POLICY "Users can view their own usage stats" ON public.bot_usage_stats
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can manage usage stats" ON public.bot_usage_stats
FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guild_access_updated_at BEFORE UPDATE ON public.guild_access
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_usage_stats_updated_at BEFORE UPDATE ON public.bot_usage_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
