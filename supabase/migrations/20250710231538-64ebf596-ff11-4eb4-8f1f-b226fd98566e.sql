-- Enhanced security audit logging table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_risk_level ON public.security_audit_logs(risk_level);

-- Enable RLS
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for security audit logs
CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert security logs" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_risk_level TEXT DEFAULT 'low'
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    event_type,
    event_details,
    ip_address,
    user_agent,
    session_id,
    risk_level
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_details,
    p_ip_address,
    p_user_agent,
    p_session_id,
    p_risk_level
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced user profiles security
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}'::jsonb;

-- Function to check account security status
CREATE OR REPLACE FUNCTION public.check_account_security(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_record public.profiles%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  
  result := jsonb_build_object(
    'account_locked', CASE 
      WHEN profile_record.account_locked_until > NOW() THEN true 
      ELSE false 
    END,
    'failed_attempts', COALESCE(profile_record.failed_login_attempts, 0),
    'last_failed_login', profile_record.last_failed_login,
    'account_locked_until', profile_record.account_locked_until,
    'password_age_days', EXTRACT(DAY FROM NOW() - COALESCE(profile_record.last_password_change, profile_record.created_at))
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced server security validation
CREATE OR REPLACE FUNCTION public.validate_server_access(
  p_server_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  server_exists BOOLEAN;
  user_is_owner BOOLEAN;
BEGIN
  -- Check if server exists and user is owner
  SELECT 
    COUNT(*) > 0,
    COUNT(*) FILTER (WHERE owner = p_user_id) > 0
  INTO server_exists, user_is_owner
  FROM public.servers 
  WHERE id = p_server_id;
  
  -- Log access attempt
  PERFORM public.log_security_event(
    p_user_id,
    'server_access_attempt',
    jsonb_build_object(
      'server_id', p_server_id,
      'success', user_is_owner,
      'server_exists', server_exists
    ),
    NULL,
    NULL,
    NULL,
    CASE WHEN NOT user_is_owner THEN 'medium' ELSE 'low' END
  );
  
  RETURN user_is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced subscription security
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS security_notes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS last_verification TIMESTAMP WITH TIME ZONE;

-- Function to validate subscription security
CREATE OR REPLACE FUNCTION public.validate_subscription_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Log subscription changes
  PERFORM public.log_security_event(
    NEW.user_id,
    'subscription_change',
    jsonb_build_object(
      'old_status', COALESCE(OLD.subscription_status::text, 'new'),
      'new_status', NEW.subscription_status::text,
      'subscription_id', NEW.id
    ),
    NULL,
    NULL,
    NULL,
    'medium'
  );
  
  -- Update last verification timestamp
  NEW.last_verification := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription security validation
DROP TRIGGER IF EXISTS subscription_security_validation ON public.subscribers;
CREATE TRIGGER subscription_security_validation
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subscription_security();

-- Clean up old security logs (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.security_audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;