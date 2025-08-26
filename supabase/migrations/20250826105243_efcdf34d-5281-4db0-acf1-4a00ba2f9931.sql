-- Fix transaction number generation by making it nullable temporarily and using a default
ALTER TABLE public.transactions ALTER COLUMN transaction_number DROP NOT NULL;

-- Update the function to handle the generation properly
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Always generate a transaction number if not provided
  NEW.transaction_number := 'TXN-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('transaction_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger fires before insert
DROP TRIGGER IF EXISTS set_transaction_number ON public.transactions;
CREATE TRIGGER set_transaction_number
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_transaction_number();

-- Update RLS policies for transactions to allow advocates to manage them
DROP POLICY IF EXISTS "Authorized users can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view related transactions" ON public.transactions;

-- Create new policies that allow advocates to manage transactions
CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view transactions" ON public.transactions
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
      auth.uid() = client_id OR
      auth.uid() = lawyer_id OR
      auth.uid() = processed_by
    )
  );

CREATE POLICY "Users can update transactions" ON public.transactions
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
      auth.uid() = processed_by
    )
  );

CREATE POLICY "Users can delete transactions" ON public.transactions
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
      auth.uid() = processed_by
    )
  );