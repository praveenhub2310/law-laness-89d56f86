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
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim();
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim();

    console.info('[CREATE-ORDER] 🔑 Checking Razorpay credentials...');
    console.info('[CREATE-ORDER] Key ID exists:', !!razorpayKeyId);
    console.info('[CREATE-ORDER] Key Secret exists:', !!razorpayKeySecret);
    
    if (razorpayKeyId) {
      console.info('[CREATE-ORDER] Key ID (masked):', razorpayKeyId.substring(0, 12) + '***');
      console.info('[CREATE-ORDER] Key ID length:', razorpayKeyId.length);
    }
    
    if (razorpayKeySecret) {
      console.info('[CREATE-ORDER] Key Secret length:', razorpayKeySecret.length);
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('[CREATE-ORDER] ❌ Razorpay credentials missing in environment');
      console.error('[CREATE-ORDER] Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('RAZOR')));
      throw new Error('Razorpay credentials not configured in environment');
    }

    console.info('[CREATE-ORDER] ✅ Razorpay credentials found');

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

    console.info('[CREATE-ORDER] 📋 Payment settings:', settings);

    if (!settings.is_active) {
      console.error('[CREATE-ORDER] ❌ Payment gateway is inactive');
      throw new Error('Payment gateway is inactive');
    }

    if (!settings.enable_razorpay_subscription) {
      console.error('[CREATE-ORDER] ❌ Razorpay subscription is disabled');
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

    console.info('[CREATE-ORDER] 🚀 Creating Razorpay order with data:', {
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes
    });

    const razorpayResponse = await fetch(`${settings.razorpay_base_uri}orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    console.info('[CREATE-ORDER] 📡 Razorpay API response status:', razorpayResponse.status);

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('[CREATE-ORDER] ❌ Razorpay API error:', errorText);
      throw new Error(`Razorpay API error (${razorpayResponse.status}): ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();
    console.info('[CREATE-ORDER] ✅ Razorpay order created:', {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      status: razorpayOrder.status
    });

    // Create subscription invoice record
    console.info('[CREATE-ORDER] 📝 Creating invoice record...');
    const { data: invoiceData, error: invoiceError } = await supabaseService
      .from('subscription_invoices')
      .insert({
        subscription_id: null, // Will be updated after successful payment
        invoice_number: `INV_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('[CREATE-ORDER] ⚠️ Error creating invoice:', invoiceError);
      // Don't fail the order creation if invoice fails
    } else {
      console.info('[CREATE-ORDER] ✅ Invoice created:', invoiceData?.id);
    }

    // Return order details for frontend
    const responseData = {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId,
      planId: planId
    };
    
    console.info('[CREATE-ORDER] 🎉 Order created successfully, returning:', {
      ...responseData,
      keyId: razorpayKeyId.substring(0, 8) + '***' // Mask key for logging
    });

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[CREATE-ORDER] 💥 Error creating Razorpay order:', error);
    console.error('[CREATE-ORDER] Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create payment order',
      details: error.stack ? error.stack.split('\n')[0] : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});