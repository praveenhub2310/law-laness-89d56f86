import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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

export const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async ({ planId, amount, currency = 'INR', planName }: PaymentOptions) => {
    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order via edge function
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

      if (orderError) throw orderError;
      if (!orderData) throw new Error('No order data received');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Legal Management System',
        description: `Subscription: ${planName}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          email: user.email,
        },
        theme: {
          color: '#2563eb' // Primary color
        },
        handler: async (response: RazorpayPaymentData) => {
          try {
            // Payment successful
            toast({
              title: "Payment Successful!",
              description: `Your ${planName} subscription is now active.`,
            });

            // The webhook will handle the backend updates
            // You can add additional UI updates here if needed
            window.location.reload();
          } catch (error: any) {
            console.error('Payment handler error:', error);
            toast({
              title: "Payment Processing Error",
              description: "Payment was successful but there was an issue updating your subscription. Please contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "destructive"
            });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    loading
  };
};