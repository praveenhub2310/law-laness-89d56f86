-- Update e_sign_documents table to support Google Drive integration
ALTER TABLE public.e_sign_documents 
ADD COLUMN google_drive_file_id TEXT,
ADD COLUMN google_drive_signed_file_id TEXT;

-- Add index for better performance on Google Drive file lookups
CREATE INDEX idx_e_sign_documents_google_drive_file_id ON public.e_sign_documents(google_drive_file_id);
CREATE INDEX idx_e_sign_documents_google_drive_signed_file_id ON public.e_sign_documents(google_drive_signed_file_id);

-- Update the original_file_url column to be nullable since we'll store Google Drive IDs
ALTER TABLE public.e_sign_documents 
ALTER COLUMN original_file_url DROP NOT NULL;