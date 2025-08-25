-- Create templates table for dynamic template management
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  preview_type TEXT NOT NULL CHECK (preview_type IN ('pdf', 'docx')),
  description TEXT,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
CREATE POLICY "Anyone can view active templates" 
ON public.templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authorized users can manage templates" 
ON public.templates 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]));

-- Create storage bucket for templates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', true);

-- Create storage policies for templates bucket
CREATE POLICY "Anyone can view template files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'templates');

CREATE POLICY "Authorized users can upload template files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'templates' AND auth.uid() IS NOT NULL AND get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]));

CREATE POLICY "Authorized users can update template files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'templates' AND auth.uid() IS NOT NULL AND get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]));

CREATE POLICY "Authorized users can delete template files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'templates' AND auth.uid() IS NOT NULL AND get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]));

-- Create trigger for updating timestamps
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_active ON public.templates(is_active);
CREATE INDEX idx_templates_created_at ON public.templates(created_at DESC);