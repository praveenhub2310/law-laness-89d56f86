-- Create payment settings table for admin configuration
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT, -- Will be encrypted
  razorpay_webhook_uri TEXT,
  razorpay_webhook_secret TEXT, -- Will be encrypted
  razorpay_base_uri TEXT DEFAULT 'https://api.razorpay.com/v1/',
  enable_razorpay_prepaid BOOLEAN DEFAULT true,
  enable_razorpay_subscription BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for payment settings
CREATE POLICY "Super admins can manage payment settings" 
ON public.payment_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super_admin');

-- Create trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for payment_settings
ALTER TABLE public.payment_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_settings;

-- Update subscription_invoices table to include Razorpay details
ALTER TABLE public.subscription_invoices ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.subscription_invoices ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.subscription_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.subscription_invoices ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Update user_subscriptions table to include more payment details
ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Enable realtime for subscription_invoices only (user_subscriptions is already added)
ALTER TABLE public.subscription_invoices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_invoices;

-- Insert default payment settings (admin needs to configure)
INSERT INTO public.payment_settings (
  razorpay_base_uri,
  enable_razorpay_prepaid,
  enable_razorpay_subscription,
  is_active
) VALUES (
  'https://api.razorpay.com/v1/',
  true,
  true,
  false -- Default to inactive until admin configures
);