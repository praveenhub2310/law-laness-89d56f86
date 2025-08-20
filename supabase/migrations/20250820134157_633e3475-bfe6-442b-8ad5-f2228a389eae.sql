-- Fix security vulnerability: Restrict company access to client personal information
-- Current issue: Companies can view all team member profiles including sensitive client data

-- Drop the problematic policy that allows companies to view team member profiles
DROP POLICY IF EXISTS "Companies can view basic professional info of their team member" ON public.profiles;

-- Create a more secure policy that only allows companies to view advocate profiles
-- This prevents companies from accessing client personal information
CREATE POLICY "Companies can view advocate team members only" 
ON public.profiles 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'company'::user_role) 
  AND (company_id = auth.uid()) 
  AND (id <> auth.uid()) 
  AND (role = 'advocate'::user_role)
);

-- Ensure clients can only view their own profile data
-- This policy already exists but adding comment for clarity
-- Policy "Users can view their own profile" covers this case

-- Add additional security: Restrict what columns companies can see for advocates
-- Create a view for limited professional information if needed in the future
COMMENT ON POLICY "Companies can view advocate team members only" ON public.profiles IS 
'Restricts company access to only advocate team members, preventing exposure of client personal information. Companies cannot view client profiles even if clients are associated with their company_id.';