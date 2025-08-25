-- Add case_number column to e_sign_documents table to store formatted case numbers
ALTER TABLE public.e_sign_documents 
ADD COLUMN case_number TEXT;

-- Add index for better performance on case number lookups
CREATE INDEX idx_e_sign_documents_case_number ON public.e_sign_documents(case_number);

-- Add comment to explain the purpose of the field
COMMENT ON COLUMN public.e_sign_documents.case_number IS 'Formatted case number (e.g., CR/123/2024) for new cases not yet in the projects table';