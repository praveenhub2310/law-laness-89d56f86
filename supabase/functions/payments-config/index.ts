import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.info('[CONFIG] 🔧 Fetching payment configuration...');

    // Debug: Log all environment variables
    console.info('[CONFIG] 🔍 Environment vars check:', {
      supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      serviceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      allEnvKeys: Object.keys(Deno.env.toObject()).filter(k => k.startsWith('RAZORPAY')),
    });

    // Create service client to read payment settings
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get Razorpay credentials from environment (secure)
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    console.info('[CONFIG] 🔍 Environment check:', {
      keyIdPresent: !!razorpayKeyId,
      keyIdValue: razorpayKeyId ? `${razorpayKeyId.slice(0, 8)}...` : 'null',
      keySecretPresent: !!razorpayKeySecret,
      keySecretValue: razorpayKeySecret ? `${razorpayKeySecret.slice(0, 8)}...` : 'null',
      webhookSecretPresent: !!razorpayWebhookSecret,
      webhookSecretValue: razorpayWebhookSecret ? `${razorpayWebhookSecret.slice(0, 8)}...` : 'null'
    });

    // Fetch payment settings from database
    const { data: paymentSettings, error: settingsError } = await supabaseService
      .from('payment_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.info('[CONFIG] 📊 Database settings:', paymentSettings);

    // Return safe configuration (never expose secrets to client)
    const config = {
      key_id: razorpayKeyId, // Safe to expose
      prepaid_enabled: paymentSettings?.enable_razorpay_prepaid ?? true,
      subscription_enabled: paymentSettings?.enable_razorpay_subscription ?? true,
      gateway_active: paymentSettings?.is_active ?? true,
      credentials_configured: !!(razorpayKeyId && razorpayKeySecret),
      webhook_configured: !!razorpayWebhookSecret,
      base_uri: paymentSettings?.razorpay_base_uri ?? 'https://api.razorpay.com/v1/',
      webhook_uri: paymentSettings?.razorpay_webhook_uri ?? 'https://ibaqunlwzzoonbsnajbk.supabase.co/functions/v1/razorpay-webhook'
    };

    console.info('[CONFIG] ✅ Returning config:', config);

    return new Response(JSON.stringify(config), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[CONFIG] ❌ Error fetching payment config:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch payment configuration',
      key_id: null,
      prepaid_enabled: false,
      subscription_enabled: false,
      gateway_active: false,
      credentials_configured: false,
      webhook_configured: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});