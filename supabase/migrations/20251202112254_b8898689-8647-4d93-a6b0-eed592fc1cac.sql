-- Enable RLS on payment_settings (if not already enabled)
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active payment settings
CREATE POLICY "Allow authenticated users to read active payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow admins/super_admins to manage payment settings
CREATE POLICY "Allow admins to manage payment settings"
ON public.payment_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'company')
  )
);