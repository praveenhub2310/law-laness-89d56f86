-- Storage policies for documents bucket (AI document uploads)
-- Allow authenticated users to upload files to ai-documents folder
CREATE POLICY "Users can upload AI documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'ai-documents'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to read their own uploaded AI documents
CREATE POLICY "Users can read their AI documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'ai-documents'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own AI documents
CREATE POLICY "Users can delete their AI documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'ai-documents'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow lawyers and admins to read all AI documents
CREATE POLICY "Lawyers can read all AI documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'ai-documents'
  AND (
    get_user_role(auth.uid()) = 'advocate'
    OR get_user_role(auth.uid()) = 'company'
    OR get_user_role(auth.uid()) = 'super_admin'
  )
);