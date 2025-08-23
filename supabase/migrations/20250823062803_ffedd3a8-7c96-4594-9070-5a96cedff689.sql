-- Add foreign key constraints to invoices table
ALTER TABLE public.invoices
ADD CONSTRAINT invoices_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(id)
ON DELETE SET NULL;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_lawyer_id_fkey 
FOREIGN KEY (lawyer_id) REFERENCES public.profiles(id)
ON DELETE SET NULL;