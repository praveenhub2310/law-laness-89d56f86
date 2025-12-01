import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useDocumentUpload = (caseId?: string) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadDocument = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload documents');
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const filePath = `ai-documents/${fileName}`;

      console.log('Uploading file to Supabase Storage:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      setUploadProgress(50);

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setUploadProgress(75);

      // Create document record in database
      const { data: documentRecord, error: dbError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          title: file.name,
          file_type: fileExt || 'unknown',
          file_size: `${(file.size / 1024).toFixed(2)} KB`,
          case_id: caseId,
          uploaded_by: user.id,
          category: 'AI Analysis',
          status: 'active',
          cloud_provider: 'supabase',
          cloud_file_id: uploadData.path
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      setUploadProgress(100);

      console.log('Document record created:', documentRecord);

      toast.success('Document uploaded successfully');

      return {
        id: documentRecord.id,
        filename: file.name,
        file_type: fileExt || 'unknown',
        file_size: `${(file.size / 1024).toFixed(2)} KB`,
        publicUrl,
        storagePath: filePath
      };

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadDocument,
    uploading,
    uploadProgress
  };
};