-- Update templates table schema for real document management
ALTER TABLE templates ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS size_bytes BIGINT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS sha256_hash TEXT;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create templates-src bucket for original files
INSERT INTO storage.buckets (id, name, public) VALUES ('templates-src', 'templates-src', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies for templates-src bucket
CREATE POLICY "Templates source files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'templates-src');

CREATE POLICY "Service role can manage templates source files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'templates-src' AND auth.role() = 'service_role');

-- Create sync_status table for tracking sync operations
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  total_found INTEGER DEFAULT 0,
  total_inserted INTEGER DEFAULT 0,
  total_updated INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on sync_status
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view sync status
CREATE POLICY "Users can view sync status" 
ON sync_status 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow service role to manage sync status
CREATE POLICY "Service role can manage sync status" 
ON sync_status 
FOR ALL 
USING (auth.role() = 'service_role');