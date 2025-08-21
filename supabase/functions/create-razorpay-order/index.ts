import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RazorpayOrderRequest {
  planId: string;
  amount: number;
  currency: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    // Get request body
    const { planId, amount, currency = 'INR' }: RazorpayOrderRequest = await req.json();

    if (!planId || !amount) {
      throw new Error('Plan ID and amount are required');
    }

    // Get Razorpay credentials from environment variables (more secure)
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('🔑 Checking Razorpay credentials...');
    console.log('Key ID exists:', !!razorpayKeyId);
    console.log('Key Secret exists:', !!razorpayKeySecret);

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('❌ Razorpay credentials missing in environment');
      throw new Error('Razorpay credentials not configured in environment');
    }

    console.log('✅ Razorpay credentials found');

    // Create service client to verify payment settings are active
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify payment settings are active (but don't fetch credentials from DB)
    const { data: paymentSettings, error: settingsError } = await supabaseService
      .from('payment_settings')
      .select('is_active, enable_razorpay_subscription, razorpay_base_uri')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Use default settings if none exist in database
    const settings = paymentSettings || {
      is_active: true,
      enable_razorpay_subscription: true,
      razorpay_base_uri: 'https://api.razorpay.com/v1/'
    };

    console.log('📋 Payment settings:', settings);

    if (!settings.is_active) {
      throw new Error('Payment gateway is inactive');
    }

    if (!settings.enable_razorpay_subscription) {
      throw new Error('Razorpay subscription is disabled');
    }

    // Create Razorpay order
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paisa
      currency: currency,
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: planId
      }
    };

    const razorpayResponse = await fetch(`${settings.razorpay_base_uri}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      throw new Error(`Razorpay API error: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();

    // Create subscription invoice record
    const { error: invoiceError } = await supabaseService
      .from('subscription_invoices')
      .insert({
        subscription_id: null, // Will be updated after successful payment
        invoice_number: `INV_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
    }

    // Return order details for frontend
    return new Response(JSON.stringify({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId, // Use environment variable instead
      planId: planId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create payment order' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});