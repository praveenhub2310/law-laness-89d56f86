-- Clean up duplicate profiles and ensure proper data
DELETE FROM public.profiles 
WHERE email = 'client@akralegal.com' 
AND (first_name IS NULL OR first_name = '');

-- Ensure there's only one clean record
UPDATE public.profiles 
SET 
  first_name = 'Sarah',
  last_name = 'Johnson',
  phone = '+1 555 234 5678',
  is_active = true
WHERE email = 'client@akralegal.com' AND role = 'client';