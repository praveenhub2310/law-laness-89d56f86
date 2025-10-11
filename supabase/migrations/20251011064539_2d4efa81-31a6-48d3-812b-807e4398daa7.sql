-- Fix admin user role from client to super_admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE id = '8d89d54f-5783-4fa1-a487-ff2ab5897ee6' 
AND email = 'admin@akralegal.com';