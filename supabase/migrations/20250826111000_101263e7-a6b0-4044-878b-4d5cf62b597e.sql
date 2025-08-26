-- Create a demo client account with real profile data
-- First, check if we have an existing client to connect to the lawyer
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role
) VALUES (
  gen_random_uuid(),
  'democlient@akralegal.com',
  crypt('DemoClient123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "John", "last_name": "Doe", "role": "client", "email_verified": true}',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the demo client
-- The profile will be automatically created by the trigger, but let's make sure client data exists
DO $$
DECLARE
    demo_client_id uuid;
BEGIN
    -- Get the demo client user ID
    SELECT id INTO demo_client_id FROM auth.users WHERE email = 'democlient@akralegal.com';
    
    -- Update the client-specific data
    IF demo_client_id IS NOT NULL THEN
        INSERT INTO public.clients (
            id,
            client_type,
            preferred_contact_method,
            emergency_contact_name,
            emergency_contact_phone
        ) VALUES (
            demo_client_id,
            'individual',
            'email',
            'Jane Doe',
            '+1 555 123 4567'
        ) ON CONFLICT (id) DO UPDATE SET
            client_type = EXCLUDED.client_type,
            preferred_contact_method = EXCLUDED.preferred_contact_method,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone;
            
        -- Update the profile with phone number
        UPDATE public.profiles 
        SET phone = '+1 555 987 6543'
        WHERE id = demo_client_id;
    END IF;
END $$;