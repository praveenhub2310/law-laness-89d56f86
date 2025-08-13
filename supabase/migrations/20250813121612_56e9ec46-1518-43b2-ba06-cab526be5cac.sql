-- Add INSERT policy for super admins to create new users
CREATE POLICY "Super admins can create new users" 
ON public.profiles 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'super_admin'::user_role);

-- Also add DELETE policy for super admins to manage users
CREATE POLICY "Super admins can delete users" 
ON public.profiles 
FOR DELETE 
USING (get_user_role(auth.uid()) = 'super_admin'::user_role);