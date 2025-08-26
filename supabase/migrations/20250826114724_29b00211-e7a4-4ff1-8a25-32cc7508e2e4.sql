-- Update RLS policies for documents table to allow proper access

-- First, drop the existing policy that might be too restrictive
DROP POLICY IF EXISTS "Users can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view related documents" ON public.documents;

-- Create comprehensive RLS policies for documents
CREATE POLICY "Users can insert their own documents"
ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can view their own documents"
ON public.documents
FOR SELECT
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own documents"
ON public.documents
FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Lawyers can view case documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = documents.case_id
      AND (p.client_id = auth.uid() OR p.lawyer_id = auth.uid())
    )
  )
);

CREATE POLICY "Lawyers can update case documents"
ON public.documents
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = documents.case_id
      AND p.lawyer_id = auth.uid()
    )
  )
);

-- Create function to auto-create case updates when documents are uploaded
CREATE OR REPLACE FUNCTION public.create_document_upload_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create update if document is associated with a case
  IF NEW.case_id IS NOT NULL THEN
    INSERT INTO public.case_updates (
      case_id,
      created_by,
      update_type,
      title,
      description,
      is_visible_to_client
    ) VALUES (
      NEW.case_id,
      NEW.uploaded_by,
      'document_upload',
      'New Document Uploaded',
      'Document "' || NEW.title || '" has been uploaded to the case.',
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for document uploads
CREATE TRIGGER document_upload_case_update
AFTER INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.create_document_upload_update();