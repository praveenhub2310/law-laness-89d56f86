-- Create payroll table for managing employee payroll
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  salary_amount NUMERIC NOT NULL DEFAULT 0,
  bonus_amount NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Super admins and companies can manage all payroll
CREATE POLICY "Super admins and companies can manage payroll"
  ON public.payroll
  FOR ALL
  USING (
    get_user_role(auth.uid()) = 'super_admin' OR 
    get_user_role(auth.uid()) = 'company'
  );

-- Employees can view their own payroll
CREATE POLICY "Employees can view their own payroll"
  ON public.payroll
  FOR SELECT
  USING (auth.uid() = employee_id);

-- Create index for better query performance
CREATE INDEX idx_payroll_employee_id ON public.payroll(employee_id);
CREATE INDEX idx_payroll_pay_period ON public.payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_payroll_payment_date ON public.payroll(payment_date);

-- Add comment for documentation
COMMENT ON TABLE public.payroll IS 'Stores employee payroll records including salary, bonuses, deductions, and payment information';