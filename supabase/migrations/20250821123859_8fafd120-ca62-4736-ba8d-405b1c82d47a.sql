-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  interval_type TEXT NOT NULL DEFAULT 'month', -- month, year
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription invoices table
CREATE TABLE public.subscription_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'paid', -- paid, pending, failed
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (publicly readable for plan selection)
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super_admin');

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super_admin');

-- RLS Policies for subscription_invoices
CREATE POLICY "Users can view their own invoices" 
ON public.subscription_invoices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_subscriptions us 
  WHERE us.id = subscription_invoices.subscription_id 
  AND us.user_id = auth.uid()
));

CREATE POLICY "System can create invoices" 
ON public.subscription_invoices 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins can manage all invoices" 
ON public.subscription_invoices 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super_admin');

-- Create triggers for updated_at columns
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_invoices_updated_at
  BEFORE UPDATE ON public.subscription_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, features) VALUES
('Starter', 350.00, '[
  "Dashboard",
  "Projects Management", 
  "Appointments",
  "Documents Management",
  "Messages",
  "Manage Parties",
  "Invoices",
  "Transactions", 
  "Reports",
  "Cloud Storage"
]'),
('Growth', 750.00, '[
  "All Starter Features",
  "Agencies",
  "Important Links", 
  "Human Resources",
  "Accounts Management",
  "Manage Claims",
  "System Log",
  "Settings",
  "Court Cause List",
  "Drafting Tool",
  "Document Translation",
  "Court Fee Calculator",
  "Firm Recordings",
  "Excel Data Upload"
]');

-- Enable realtime for subscription tables
ALTER TABLE public.subscription_plans REPLICA IDENTITY FULL;
ALTER TABLE public.user_subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.subscription_invoices REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_invoices;