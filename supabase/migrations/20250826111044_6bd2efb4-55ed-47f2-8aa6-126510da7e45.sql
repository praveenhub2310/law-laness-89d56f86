-- Create a demo client account using a simpler approach
-- First check if the email already exists
DO $$
DECLARE
    demo_client_id uuid;
    existing_user_id uuid;
BEGIN
    -- Check if user already exists
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'democlient@akralegal.com';
    
    IF existing_user_id IS NULL THEN
        -- Create new user ID
        demo_client_id := gen_random_uuid();
        
        -- Insert into auth.users manually (this would normally be done by Supabase Auth)
        -- For demo purposes, we'll just create the profile and client records
        
        -- Insert profile for demo client
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            phone,
            is_active
        ) VALUES (
            demo_client_id,
            'democlient@akralegal.com',
            'John',
            'Doe',
            'client',
            '+1 555 987 6543',
            true
        );
        
        -- Insert client-specific data
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
        );
        
        RAISE NOTICE 'Demo client created with ID: %', demo_client_id;
    ELSE
        -- Update existing user data
        UPDATE public.profiles 
        SET 
            first_name = 'John',
            last_name = 'Doe',
            phone = '+1 555 987 6543',
            is_active = true
        WHERE id = existing_user_id;
        
        -- Update or insert client data
        INSERT INTO public.clients (
            id,
            client_type,
            preferred_contact_method,
            emergency_contact_name,
            emergency_contact_phone
        ) VALUES (
            existing_user_id,
            'individual',
            'email',
            'Jane Doe',
            '+1 555 123 4567'
        ) ON CONFLICT (id) DO UPDATE SET
            client_type = EXCLUDED.client_type,
            preferred_contact_method = EXCLUDED.preferred_contact_method,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone;
            
        RAISE NOTICE 'Demo client updated with ID: %', existing_user_id;
    END IF;
END $$;