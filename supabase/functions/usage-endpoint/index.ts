
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[USAGE-ENDPOINT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    logStep("Usage endpoint called");

    // Create Supabase client with service role for enhanced security
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false 
        } 
      }
    );

    const { server_id, amount = 1, discord_guild_id } = await req.json();
    logStep("Request payload", { server_id, amount, discord_guild_id });

    if (!server_id) {
      logStep("ERROR: Missing server_id");
      return new Response(JSON.stringify({ error: "server_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate the server exists and has an active subscription
    const { data: serverData, error: serverError } = await supabaseServiceRole
      .from('servers')
      .select('id, subscription_status, monthly_limit, usage_count, owner')
      .eq('id', server_id)
      .single();

    if (serverError) {
      logStep("ERROR: Server validation failed", serverError);
      return new Response(JSON.stringify({ error: "Invalid server ID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (serverData.subscription_status !== 'active') {
      logStep("ERROR: Server subscription not active", { 
        server_id, 
        status: serverData.subscription_status 
      });
      return new Response(JSON.stringify({ 
        error: "Server subscription is not active",
        current_status: serverData.subscription_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Check if usage would exceed monthly limit
    const newUsageCount = serverData.usage_count + amount;
    if (newUsageCount > serverData.monthly_limit) {
      logStep("ERROR: Usage limit exceeded", {
        current: serverData.usage_count,
        requested: amount,
        limit: serverData.monthly_limit
      });
      return new Response(JSON.stringify({ 
        error: "Monthly usage limit exceeded",
        current_usage: serverData.usage_count,
        limit: serverData.monthly_limit
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Update server usage using direct SQL for better security
    const { error: updateError } = await supabaseServiceRole
      .from('servers')
      .update({ 
        usage_count: newUsageCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', server_id);

    if (updateError) {
      logStep("ERROR: Failed to update usage", updateError);
      return new Response(JSON.stringify({ error: "Failed to update usage count" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Log usage stats if discord_guild_id provided
    if (discord_guild_id) {
      const { error: statsError } = await supabaseServiceRole
        .from('bot_usage_stats')
        .upsert({
          user_id: serverData.owner,
          discord_guild_id,
          commands_used: amount,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,discord_guild_id',
          ignoreDuplicates: false
        });

      if (statsError) {
        logStep("WARNING: Failed to update usage stats", statsError);
        // Don't fail the request if stats logging fails
      } else {
        logStep("Usage stats updated successfully");
      }
    }

    logStep("Usage updated successfully", {
      server_id,
      new_usage: newUsageCount,
      remaining: serverData.monthly_limit - newUsageCount
    });

    return new Response(JSON.stringify({ 
      success: true,
      usage_count: newUsageCount,
      remaining: serverData.monthly_limit - newUsageCount,
      limit: serverData.monthly_limit
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("UNEXPECTED ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
