-- Add RLS policy to allow clients to view their assigned lawyer's profile
CREATE POLICY "Clients can view their assigned lawyer profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  role = 'advocate' AND
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.lawyer_id = profiles.id
    AND p.client_id = auth.uid()
  )
);

-- Also add policy to allow clients to view advocate details
CREATE POLICY "Clients can view their assigned lawyer advocate details"
ON public.advocates
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.lawyer_id = advocates.id
    AND p.client_id = auth.uid()
  )
);