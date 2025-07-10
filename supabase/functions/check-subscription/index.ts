
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Security headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Rate limiting
const rateLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // requests per minute

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  let limitData = rateLimits.get(identifier);
  
  if (!limitData || now - limitData.lastReset > RATE_LIMIT_WINDOW) {
    limitData = { count: 0, lastReset: now };
    rateLimits.set(identifier, limitData);
  }
  
  if (limitData.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limitData.count++;
  return true;
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Security validations
  const clientIP = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  
  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    logStep("Rate limit exceeded", { ip: clientIP });
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      headers: corsHeaders,
      status: 429,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started", { ip: clientIP });

    // Enhanced auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid authorization header format");
    }
    
    const token = authHeader.replace("Bearer ", "");
    if (!token || token.length < 20) {
      throw new Error("Invalid token format");
    }
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    // Validate user email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error("Invalid email format");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email.substring(0, 3) + "***" });

    // First check if user already has subscription status in database
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();
    
    logStep("Existing subscriber data", existingSubscriber);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, updating unsubscribed state");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscription_status: 'pending',
        subscription_tier: null,
        subscription_start: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ 
        subscription_status: 'pending',
        subscription_tier: null,
        subscription_start: null,
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionStatus = 'pending';
    let subscriptionStart = null;
    let subscriptionEnd = null;
    let subscriptionTier = 'basic';

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionStatus = 'active';
      subscriptionStart = new Date(subscription.current_period_start * 1000).toISOString();
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("✅ ACTIVE subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        startDate: subscriptionStart,
        endDate: subscriptionEnd 
      });
    } else {
      // Check for cancelled or past_due subscriptions
      const allSubs = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
      });
      if (allSubs.data.length > 0) {
        const latestSub = allSubs.data[0];
        if (latestSub.status === 'canceled') {
          subscriptionStatus = 'cancelled';
        } else if (latestSub.status === 'past_due') {
          subscriptionStatus = 'expired';
        }
        subscriptionStart = new Date(latestSub.current_period_start * 1000).toISOString();
        subscriptionEnd = new Date(latestSub.current_period_end * 1000).toISOString();
      }
      logStep("❌ No active subscription found", { status: subscriptionStatus });
    }

    // Update database with current status
    const dbUpdate = {
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      discord_user_id: user.user_metadata?.provider_id || null,
      discord_username: user.user_metadata?.user_name || null,
      subscription_status: subscriptionStatus,
      subscription_tier: subscriptionTier,
      subscription_start: subscriptionStart,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    };

    await supabaseClient.from("subscribers").upsert(dbUpdate, { onConflict: 'email' });

    logStep("Updated database with subscription info", { 
      subscription_status: subscriptionStatus, 
      subscription_tier: subscriptionTier,
      isActive: subscriptionStatus === 'active'
    });
    
    const response = {
      subscription_status: subscriptionStatus,
      subscription_tier: subscriptionTier,
      subscription_start: subscriptionStart,
      subscription_end: subscriptionEnd
    };

    logStep("Returning response", response);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscription_status: 'pending',
      subscription_tier: null,
      subscription_start: null,
      subscription_end: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
