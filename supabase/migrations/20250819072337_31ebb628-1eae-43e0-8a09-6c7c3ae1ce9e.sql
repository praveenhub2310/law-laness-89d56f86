-- Fix security vulnerability: Remove company access to view advocate/client personal data
-- This addresses the security issue where companies could access sensitive personal information

-- Drop the problematic policy that allows companies to view advocates and clients
DROP POLICY IF EXISTS "Companies can view their advocates and clients" ON public.profiles;

-- Note: Applications using this data should implement column-level access control
-- to ensure companies only see necessary professional information (first_name, last_name, role)
-- and not sensitive data (email, phone) when querying profiles of their team members