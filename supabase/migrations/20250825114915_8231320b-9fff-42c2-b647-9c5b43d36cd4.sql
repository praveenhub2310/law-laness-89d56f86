-- Fix security vulnerability: Restrict template access to authenticated users only

-- Drop the existing public read policy that allows anyone to view templates
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;

-- Create a new policy that requires authentication to view templates
CREATE POLICY "Authenticated users can view active templates" 
ON public.templates 
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NOT NULL
);

-- Keep the existing policy for authorized users to manage templates
-- This policy already exists and is correct:
-- "Authorized users can manage templates" - allows super_admin, company, advocate roles to manage templates