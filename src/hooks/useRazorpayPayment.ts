import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  planId: string;
  amount: number;
  currency?: string;
  planName: string;
}

interface RazorpayPaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const useRazorpayPayment = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      console.info('[RZP] 🔧 Checking if Razorpay script already loaded...');
      
      if (window.Razorpay) {
        console.info('[RZP] ✅ Razorpay already loaded');
        resolve(true);
        return;
      }

      console.info('[RZP] 📦 Loading Razorpay script from CDN...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.info('[RZP] ✅ Razorpay script loaded successfully from CDN');
        // Notify parent component
        window.dispatchEvent(new CustomEvent('razorpay-loaded', { detail: { loaded: true } }));
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('[RZP] ❌ Failed to load Razorpay script from CDN:', error);
        console.error('[RZP] 🔍 This might be due to ad-block or CSP restrictions');
        window.dispatchEvent(new CustomEvent('razorpay-loaded', { detail: { loaded: false, error } }));
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async ({ planId, amount, currency = 'INR', planName }: PaymentOptions) => {
    try {
      console.log('💳 DEBUG: ===========================================');
      console.log('💳 DEBUG: STARTING PAYMENT INITIATION PROCESS');
      console.log('💳 DEBUG: ===========================================');
      console.log('💳 DEBUG: Payment parameters:', { planId, amount, currency, planName });
      
      setLoading(true);

      // Step 1: Load Razorpay script
      console.log('📦 DEBUG: STEP 1 - Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error('❌ DEBUG: CRITICAL - Failed to load Razorpay SDK');
        throw new Error('Failed to load Razorpay SDK');
      }
      console.log('✅ DEBUG: STEP 1 COMPLETE - Razorpay script loaded successfully');

      // Step 2: Verify authentication
      console.log('👤 DEBUG: STEP 2 - Verifying user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ DEBUG: Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) {
        console.error('❌ DEBUG: CRITICAL - User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('✅ DEBUG: STEP 2 COMPLETE - User authenticated:', user.email);

      // Step 3: Create order via edge function
      console.log('🌐 DEBUG: STEP 3 - Creating Razorpay order via edge function...');
      console.log('🌐 DEBUG: Calling supabase.functions.invoke with:', {
        functionName: 'create-razorpay-order',
        body: { planId, amount, currency }
      });

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            planId,
            amount,
            currency
          }
        }
      );

      console.log('📋 DEBUG: STEP 3 RESPONSE - Edge function completed');
      console.log('📋 DEBUG: Order data received:', orderData);
      console.log('📋 DEBUG: Order error (if any):', orderError);

      if (orderError) {
        console.error('❌ DEBUG: CRITICAL - Order creation failed:', orderError);
        throw new Error(`Order creation failed: ${orderError.message || JSON.stringify(orderError)}`);
      }
      if (!orderData) {
        console.error('❌ DEBUG: CRITICAL - No order data received from edge function');
        throw new Error('No order data received from payment service');
      }

      console.log('✅ DEBUG: STEP 3 COMPLETE - Order created successfully');
      console.log('✅ DEBUG: Order details:', {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.keyId ? 'Present' : 'Missing'
      });

      // Step 4: Verify Razorpay is available
      console.log('🔍 DEBUG: STEP 4 - Verifying Razorpay SDK availability...');
      if (!window.Razorpay) {
        console.error('❌ DEBUG: CRITICAL - Razorpay not available on window object');
        throw new Error('Razorpay SDK not loaded properly');
      }
      console.log('✅ DEBUG: STEP 4 COMPLETE - Razorpay SDK confirmed available');

      // Step 5: Initialize Razorpay checkout
      console.log('🎯 DEBUG: STEP 5 - Initializing Razorpay checkout...');
      const razorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AkraLegal",
        description: `${planName} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email,
          email: user.email,
          contact: user.user_metadata?.phone || ''
        },
        theme: {
          color: "#0070f3"
        },
        handler: async (response: RazorpayPaymentData) => {
          try {
            console.log('💰 DEBUG: PAYMENT SUCCESS - Response received:', response);
            toast({
              title: "Payment Successful!",
              description: `Welcome to ${planName}! Your subscription is now active.`,
            });
          } catch (error: any) {
            console.error('❌ DEBUG: Error in payment success handler:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Payment completed but verification failed. Please contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: () => {
            console.log('❌ DEBUG: Payment modal dismissed by user');
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "destructive"
            });
          }
        }
      };

      console.log('🎯 DEBUG: Razorpay options prepared:', {
        key: razorpayOptions.key ? 'Present' : 'Missing',
        amount: razorpayOptions.amount,
        currency: razorpayOptions.currency,
        order_id: razorpayOptions.order_id,
        name: razorpayOptions.name
      });

      console.log('🚀 DEBUG: Creating Razorpay instance...');
      const razorpayInstance = new window.Razorpay(razorpayOptions);
      
      console.log('🚀 DEBUG: Opening Razorpay checkout modal...');
      razorpayInstance.open();
      
      console.log('✅ DEBUG: STEP 5 COMPLETE - Razorpay checkout modal opened');
      console.log('✅ DEBUG: ===========================================');
      console.log('✅ DEBUG: PAYMENT INITIATION PROCESS COMPLETED');
      console.log('✅ DEBUG: ===========================================');

    } catch (error: any) {
      console.error('💥 DEBUG: ===========================================');
      console.error('💥 DEBUG: PAYMENT INITIATION FAILED');
      console.error('💥 DEBUG: ===========================================');
      console.error('💥 DEBUG: Error message:', error.message);
      console.error('💥 DEBUG: Error object:', error);
      console.error('💥 DEBUG: Error stack:', error.stack);
      
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('🏁 DEBUG: Setting loading state to false');
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading
  };
};

export default useRazorpayPayment;