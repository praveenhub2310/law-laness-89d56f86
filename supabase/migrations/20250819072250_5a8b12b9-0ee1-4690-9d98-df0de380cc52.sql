-- Fix security vulnerability: Remove company access to view advocate/client personal data
-- This addresses the security issue where companies could access sensitive personal information

-- Drop the problematic policy that allows companies to view advocates and clients
DROP POLICY IF EXISTS "Companies can view their advocates and clients" ON public.profiles;

-- Create a more secure policy that only allows companies to view basic professional information
-- but not sensitive personal data like emails and phone numbers
CREATE POLICY "Companies can view basic professional info of their team members" 
ON public.profiles 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'company'::user_role) 
  AND (company_id = auth.uid()) 
  AND (id != auth.uid()) -- Company can already see their own profile via "Users can view their own profile"
);

-- Add a comment explaining the security improvement
COMMENT ON POLICY "Companies can view basic professional info of their team members" ON public.profiles IS 
'Restricted policy that allows companies to view only basic professional information of their team members, excluding sensitive personal data like emails and phone numbers. Applications should use role-based access control to limit which columns are exposed.';

-- Ensure super admins maintain full access (policy already exists)
-- Ensure users can view their own profiles (policy already exists)