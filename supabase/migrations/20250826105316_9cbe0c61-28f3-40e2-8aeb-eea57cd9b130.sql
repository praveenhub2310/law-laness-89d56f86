-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Always generate a transaction number if not provided
  NEW.transaction_number := 'TXN-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('transaction_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;