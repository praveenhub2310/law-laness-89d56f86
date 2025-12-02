-- Update subscription plan prices to new values
UPDATE public.subscription_plans 
SET price = 2350.00, updated_at = now()
WHERE name = 'Starter';

UPDATE public.subscription_plans 
SET price = 4750.00, updated_at = now()
WHERE name = 'Growth';