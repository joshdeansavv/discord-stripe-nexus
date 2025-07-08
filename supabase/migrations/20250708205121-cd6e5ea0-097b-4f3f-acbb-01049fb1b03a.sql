
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create servers table
CREATE TABLE public.servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  invite_url text,
  subscription_status text DEFAULT 'inactive',
  monthly_limit integer DEFAULT 1000,
  usage_count integer DEFAULT 0,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create billing_events table
CREATE TABLE public.billing_events (
  id text PRIMARY KEY,
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  stripe_event jsonb NOT NULL,
  inserted_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for servers
CREATE POLICY "Users can view own servers" ON public.servers
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Users can update own servers" ON public.servers
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can insert own servers" ON public.servers
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can delete own servers" ON public.servers
  FOR DELETE USING (auth.uid() = owner);

-- RLS Policies for billing_events
CREATE POLICY "Users can view billing events for own servers" ON public.billing_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.servers 
      WHERE servers.id = billing_events.server_id 
      AND servers.owner = auth.uid()
    )
  );

CREATE POLICY "Service can insert billing events" ON public.billing_events
  FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RPC function for usage tracking
CREATE OR REPLACE FUNCTION public.increment_usage(server_id uuid, amount integer)
RETURNS void AS $$
BEGIN
  UPDATE public.servers 
  SET usage_count = usage_count + amount,
      updated_at = now()
  WHERE id = server_id 
  AND owner = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly usage (for cron job)
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.servers 
  SET usage_count = 0,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
