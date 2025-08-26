-- Create case_updates table for tracking case status changes and activities
CREATE TABLE public.case_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  update_type TEXT NOT NULL DEFAULT 'status_change',
  title TEXT NOT NULL,
  description TEXT,
  old_status TEXT,
  new_status TEXT,
  is_visible_to_client BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_updates
CREATE POLICY "Users can view case updates for their cases"
ON public.case_updates
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    -- Super admins can see all
    get_user_role(auth.uid()) = 'super_admin' OR
    -- Users can see updates for cases they're involved in
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = case_updates.case_id
      AND (p.client_id = auth.uid() OR p.lawyer_id = auth.uid())
    )
  )
);

CREATE POLICY "Lawyers can create case updates"
ON public.case_updates
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  )
);

CREATE POLICY "Users can update their own case updates"
ON public.case_updates
FOR UPDATE
USING (
  auth.uid() = created_by OR
  get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
);

CREATE POLICY "Users can delete their own case updates"
ON public.case_updates
FOR DELETE
USING (
  auth.uid() = created_by OR
  get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_case_updates_updated_at
BEFORE UPDATE ON public.case_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample case updates
INSERT INTO public.case_updates (case_id, created_by, update_type, title, description, is_visible_to_client) 
SELECT 
  p.id,
  NULL, -- Will be set by lawyers later
  'status_change',
  'Case Progress Update',
  'Case has been moved to discovery phase. All initial documents have been reviewed.',
  true
FROM public.projects p
WHERE p.status = 'active'
LIMIT 3;