import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create service client
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get payment settings for webhook validation
    const { data: paymentSettings, error: settingsError } = await supabaseService
      .from('payment_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (settingsError || !paymentSettings) {
      throw new Error('Payment settings not found');
    }

    // Get webhook body and signature
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      throw new Error('Missing Razorpay signature');
    }

    // Verify webhook signature
    if (paymentSettings.razorpay_webhook_secret) {
      const expectedSignature = await generateSignature(body, paymentSettings.razorpay_webhook_secret);
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;

    console.log('Webhook received:', event, paymentEntity);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
      case 'order.paid':
        await handlePaymentSuccess(supabaseService, paymentEntity, payload);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(supabaseService, paymentEntity, payload);
        break;
        
      case 'subscription.activated':
        await handleSubscriptionActivated(supabaseService, paymentEntity, payload);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabaseService, paymentEntity, payload);
        break;
        
      default:
        console.log('Unhandled webhook event:', event);
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Webhook processing failed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function generateSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handlePaymentSuccess(supabase: any, paymentEntity: any, payload: any) {
  console.log('Processing successful payment:', paymentEntity);
  
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const amount = paymentEntity.amount / 100; // Convert from paisa to rupees
  
  // Get order notes to find user and plan info
  const notes = paymentEntity.notes || {};
  const userId = notes.user_id;
  const planId = notes.plan_id;
  
  if (!userId || !planId) {
    console.error('Missing user_id or plan_id in payment notes');
    return;
  }

  // Create transaction record
  const transactionNumber = `TXN-${new Date().getFullYear()}-${Date.now()}`;
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      transaction_number: transactionNumber,
      client_id: userId,
      amount: amount,
      currency: paymentEntity.currency?.toUpperCase() || 'INR',
      method: paymentEntity.method || 'card',
      status: 'completed',
      payment_gateway_id: paymentId,
      transaction_type: 'payment',
      description: `Subscription payment - Plan ID: ${planId}`,
      payment_gateway_response: paymentEntity
    });

  if (transactionError) {
    console.error('Error creating transaction record:', transactionError);
  } else {
    console.log('Transaction record created successfully:', transactionNumber);
  }

  // Update subscription invoice
  const { error: invoiceError } = await supabase
    .from('subscription_invoices')
    .update({
      status: 'paid',
      payment_date: new Date().toISOString(),
      razorpay_payment_id: paymentId,
      payment_method: paymentEntity.method || 'unknown'
    })
    .eq('razorpay_order_id', orderId);

  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError);
  }

  // Create or update user subscription
  const currentDate = new Date();
  const nextBillingDate = new Date(currentDate);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const { data: existingSubscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (existingSubscription) {
    // Update existing subscription
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: planId,
        current_period_start: currentDate.toISOString(),
        current_period_end: nextBillingDate.toISOString(),
        next_billing_date: nextBillingDate.toISOString(),
        payment_status: 'paid',
        payment_method: paymentEntity.method || 'unknown'
      })
      .eq('id', existingSubscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }
  } else {
    // Create new subscription
    const { error: createError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        current_period_start: currentDate.toISOString(),
        current_period_end: nextBillingDate.toISOString(),
        next_billing_date: nextBillingDate.toISOString(),
        payment_status: 'paid',
        payment_method: paymentEntity.method || 'unknown'
      });

    if (createError) {
      console.error('Error creating subscription:', createError);
    }
  }
}

async function handlePaymentFailed(supabase: any, paymentEntity: any, payload: any) {
  console.log('Processing failed payment:', paymentEntity);
  
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const amount = paymentEntity.amount / 100;
  
  // Get order notes to find user info
  const notes = paymentEntity.notes || {};
  const userId = notes.user_id;
  const planId = notes.plan_id;
  
  // Create failed transaction record
  if (userId) {
    const transactionNumber = `TXN-${new Date().getFullYear()}-${Date.now()}`;
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        transaction_number: transactionNumber,
        client_id: userId,
        amount: amount,
        currency: paymentEntity.currency?.toUpperCase() || 'INR',
        method: paymentEntity.method || 'card',
        status: 'failed',
        payment_gateway_id: paymentId,
        transaction_type: 'payment',
        description: `Failed subscription payment - Plan ID: ${planId}`,
        payment_gateway_response: paymentEntity
      });

    if (transactionError) {
      console.error('Error creating failed transaction record:', transactionError);
    }
  }
  
  // Update subscription invoice status
  const { error: invoiceError } = await supabase
    .from('subscription_invoices')
    .update({
      status: 'failed'
    })
    .eq('razorpay_order_id', orderId);

  if (invoiceError) {
    console.error('Error updating failed invoice:', invoiceError);
  }
}

async function handleSubscriptionActivated(supabase: any, subscriptionEntity: any, payload: any) {
  console.log('Processing subscription activation:', subscriptionEntity);
  // Handle subscription activation logic if needed
}

async function handleSubscriptionCancelled(supabase: any, subscriptionEntity: any, payload: any) {
  console.log('Processing subscription cancellation:', subscriptionEntity);
  
  // Update user subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('razorpay_subscription_id', subscriptionEntity.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }
}