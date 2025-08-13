-- Create demo users in Supabase auth and profiles
-- Note: This uses Supabase's built-in auth system rather than a custom users table

-- First, we'll create a function to safely create demo users
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email TEXT,
  user_password TEXT,
  user_role user_role,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT DEFAULT NULL,
  bar_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate a consistent UUID based on email for demo users
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users (this simulates what Supabase auth would do)
  -- In practice, these users should be created through Supabase Dashboard or Admin API
  
  -- Insert profile data
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    user_email,
    first_name,
    last_name,
    user_role,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

  -- Create role-specific records
  IF user_role = 'super_admin' THEN
    -- Super admin doesn't need additional records
    NULL;
  ELSIF user_role = 'advocate' THEN
    INSERT INTO public.advocates (
      id,
      bar_number,
      availability_status,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      bar_number,
      'available',
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  ELSIF user_role = 'company' THEN
    INSERT INTO public.companies (
      id,
      company_name,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      company_name,
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  ELSIF user_role = 'client' THEN
    INSERT INTO public.clients (
      id,
      client_type,
      preferred_contact_method,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      'individual',
      'email',
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new_user_id;
END;
$$;

-- Create demo user profiles (the actual auth users need to be created via Supabase Dashboard/Admin API)
-- Super Admin
SELECT create_demo_user(
  'admin@akralegal.com',
  'admin123',
  'super_admin',
  'John',
  'Smith'
);

-- Lawyer/Advocate
SELECT create_demo_user(
  'lawyer@akralegal.com',
  'lawyer123',
  'advocate',
  'Sarah',
  'Johnson',
  NULL,
  'BAR12345'
);

-- Law Firm
SELECT create_demo_user(
  'firm@akralegal.com',
  'firm123',
  'company',
  'Michael',
  'Brown',
  'Brown Legal Associates'
);

-- Client
SELECT create_demo_user(
  'client@akralegal.com',
  'client123',
  'client',
  'Emily',
  'Davis'
);

-- Create some sample projects for demonstration
INSERT INTO public.projects (
  case_number,
  title,
  description,
  client_id,
  lawyer_id,
  status,
  start_date,
  budget,
  created_at,
  updated_at
) 
SELECT 
  'CASE-2024-001',
  'Corporate Contract Dispute',
  'Legal dispute over contract terms and conditions',
  client_profile.id,
  lawyer_profile.id,
  'active',
  CURRENT_DATE - INTERVAL '30 days',
  15000.00,
  now(),
  now()
FROM 
  (SELECT id FROM public.profiles WHERE email = 'client@akralegal.com' LIMIT 1) client_profile,
  (SELECT id FROM public.profiles WHERE email = 'lawyer@akralegal.com' LIMIT 1) lawyer_profile
ON CONFLICT (case_number) DO NOTHING;

INSERT INTO public.projects (
  case_number,
  title,
  description,
  client_id,
  lawyer_id,
  status,
  start_date,
  budget,
  created_at,
  updated_at
) 
SELECT 
  'CASE-2024-002',
  'Employment Law Consultation',
  'Workplace harassment and wrongful termination case',
  client_profile.id,
  lawyer_profile.id,
  'in_progress',
  CURRENT_DATE - INTERVAL '15 days',
  8500.00,
  now(),
  now()
FROM 
  (SELECT id FROM public.profiles WHERE email = 'client@akralegal.com' LIMIT 1) client_profile,
  (SELECT id FROM public.profiles WHERE email = 'lawyer@akralegal.com' LIMIT 1) lawyer_profile
ON CONFLICT (case_number) DO NOTHING;