-- Remove sensitive payment credentials from database table
-- Keep only non-sensitive configuration settings

ALTER TABLE public.payment_settings 
DROP COLUMN IF EXISTS razorpay_key_id,
DROP COLUMN IF EXISTS razorpay_key_secret, 
DROP COLUMN IF EXISTS razorpay_webhook_secret;

-- Add a comment to clarify security approach
COMMENT ON TABLE public.payment_settings IS 'Stores non-sensitive payment gateway configuration. Sensitive credentials (API keys, secrets) are managed via Supabase environment secrets for security.';