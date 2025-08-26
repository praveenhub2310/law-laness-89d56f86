-- Add foreign key constraints to transactions table for better relationships
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_client_id 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_lawyer_id 
FOREIGN KEY (lawyer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_processed_by 
FOREIGN KEY (processed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update transactions table to auto-generate transaction numbers
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL THEN
    NEW.transaction_number := 'TXN-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('transaction_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for transaction numbers
CREATE SEQUENCE IF NOT EXISTS transaction_number_seq START 1;

-- Create trigger for auto-generating transaction numbers
DROP TRIGGER IF EXISTS set_transaction_number ON public.transactions;
CREATE TRIGGER set_transaction_number
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_transaction_number();