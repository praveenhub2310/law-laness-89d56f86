-- Add new columns to cause_list table for parsed data
ALTER TABLE public.cause_list 
ADD COLUMN item_number TEXT,
ADD COLUMN court_room_number TEXT,
ADD COLUMN time_slot TEXT,
ADD COLUMN hearing_type TEXT,
ADD COLUMN parsed_from_file BOOLEAN DEFAULT FALSE,
ADD COLUMN original_filename TEXT,
ADD COLUMN mapping_confidence NUMERIC(3,2) DEFAULT 0.0,
ADD COLUMN mapped_case_id UUID REFERENCES public.projects(id),
ADD COLUMN raw_text TEXT;

-- Create index for better performance
CREATE INDEX idx_cause_list_item_number ON public.cause_list(item_number);
CREATE INDEX idx_cause_list_court_room ON public.cause_list(court_room_number);
CREATE INDEX idx_cause_list_mapped_case ON public.cause_list(mapped_case_id);

-- Create table to store uploaded cause list files
CREATE TABLE public.cause_list_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  parsed_entries_count INTEGER DEFAULT 0,
  mapped_entries_count INTEGER DEFAULT 0,
  error_message TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cause_list_uploads
ALTER TABLE public.cause_list_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cause_list_uploads
CREATE POLICY "Users can manage their own uploads" 
ON public.cause_list_uploads 
FOR ALL 
USING ((auth.uid() = uploaded_by) OR (get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])));

-- Add trigger for updated_at
CREATE TRIGGER update_cause_list_uploads_updated_at
  BEFORE UPDATE ON public.cause_list_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON COLUMN public.cause_list.item_number IS 'Item number from parsed cause list';
COMMENT ON COLUMN public.cause_list.court_room_number IS 'Court room number from parsed cause list';
COMMENT ON COLUMN public.cause_list.time_slot IS 'Time slot from parsed cause list';
COMMENT ON COLUMN public.cause_list.parsed_from_file IS 'Whether this entry was parsed from uploaded file';
COMMENT ON COLUMN public.cause_list.mapping_confidence IS 'Confidence score for case mapping (0-1)';
COMMENT ON COLUMN public.cause_list.mapped_case_id IS 'ID of mapped case from projects table';