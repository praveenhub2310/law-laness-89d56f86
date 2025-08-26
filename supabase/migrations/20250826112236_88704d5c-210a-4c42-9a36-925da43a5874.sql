-- Fix RLS policies for profiles table to allow advocates to see clients
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Companies can view advocate team members only" ON public.profiles;

-- Create comprehensive policies for profiles access
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'super_admin'::user_role);

CREATE POLICY "Advocates can view all client profiles" ON public.profiles
  FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'advocate'::user_role AND role = 'client'::user_role
  );

CREATE POLICY "Companies can view their team and clients" ON public.profiles
  FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'company'::user_role AND (
      company_id = auth.uid() OR 
      role = 'client'::user_role
    )
  );