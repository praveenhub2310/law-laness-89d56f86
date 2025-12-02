-- Insert active payment settings for Razorpay
INSERT INTO public.payment_settings (
  is_active,
  enable_razorpay_subscription,
  enable_razorpay_prepaid,
  razorpay_base_uri,
  razorpay_webhook_uri
) VALUES (
  true,
  true,
  true,
  'https://api.razorpay.com/v1',
  NULL
)
ON CONFLICT DO NOTHING;

-- Ensure only one active payment settings record
UPDATE public.payment_settings 
SET is_active = false 
WHERE id NOT IN (
  SELECT id FROM public.payment_settings 
  ORDER BY created_at DESC 
  LIMIT 1
);