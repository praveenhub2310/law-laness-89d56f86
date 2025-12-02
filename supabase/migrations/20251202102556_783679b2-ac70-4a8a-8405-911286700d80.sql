-- Add razorpay_plan_id column to subscription_plans table
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.subscription_plans.razorpay_plan_id IS 'Razorpay subscription plan ID for payment processing';