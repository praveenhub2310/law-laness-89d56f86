-- Add the specific client account client@akralegal.com with proper relationships
DO $$
DECLARE
    akra_client_id uuid;
    demo_lawyer_id uuid;
    existing_client_id uuid;
BEGIN
    -- Check if the client already exists
    SELECT id INTO existing_client_id FROM public.profiles WHERE email = 'client@akralegal.com';
    
    IF existing_client_id IS NULL THEN
        -- Create new client ID
        akra_client_id := gen_random_uuid();
        
        -- Insert profile for akra legal client
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            phone,
            is_active
        ) VALUES (
            akra_client_id,
            'client@akralegal.com',
            'Sarah',
            'Johnson',
            'client',
            '+1 555 234 5678',
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
            akra_client_id,
            'business',
            'email',
            'Mike Johnson',
            '+1 555 345 6789'
        );
        
        RAISE NOTICE 'Akra Legal client created with ID: %', akra_client_id;
    ELSE
        akra_client_id := existing_client_id;
        
        -- Update existing client data
        UPDATE public.profiles 
        SET 
            first_name = 'Sarah',
            last_name = 'Johnson',
            phone = '+1 555 234 5678',
            is_active = true,
            role = 'client'
        WHERE id = existing_client_id;
        
        -- Update or insert client data
        INSERT INTO public.clients (
            id,
            client_type,
            preferred_contact_method,
            emergency_contact_name,
            emergency_contact_phone
        ) VALUES (
            existing_client_id,
            'business',
            'email',
            'Mike Johnson',
            '+1 555 345 6789'
        ) ON CONFLICT (id) DO UPDATE SET
            client_type = EXCLUDED.client_type,
            preferred_contact_method = EXCLUDED.preferred_contact_method,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone;
            
        RAISE NOTICE 'Akra Legal client updated with ID: %', existing_client_id;
    END IF;
    
    -- Get the demo lawyer ID (current logged in user should be advocate/lawyer)
    SELECT id INTO demo_lawyer_id FROM public.profiles WHERE role = 'advocate' LIMIT 1;
    
    -- Create multiple cases/projects connecting them for realistic data
    IF demo_lawyer_id IS NOT NULL THEN
        -- Case 1: Corporate Contract Review
        INSERT INTO public.projects (
            case_number,
            title,
            description,
            client_id,
            lawyer_id,
            status,
            start_date,
            budget
        ) VALUES (
            'CASE-2025-AKRA-001',
            'Corporate Contract Review',
            'Comprehensive review of vendor agreements and partnership contracts for Akra Legal business operations',
            akra_client_id,
            demo_lawyer_id,
            'active',
            CURRENT_DATE - INTERVAL '15 days',
            8500.00
        ) ON CONFLICT (case_number) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            client_id = EXCLUDED.client_id,
            lawyer_id = EXCLUDED.lawyer_id,
            status = EXCLUDED.status;
        
        -- Case 2: Intellectual Property Protection
        INSERT INTO public.projects (
            case_number,
            title,
            description,
            client_id,
            lawyer_id,
            status,
            start_date,
            budget
        ) VALUES (
            'CASE-2025-AKRA-002',
            'Intellectual Property Protection',
            'Trademark registration and IP protection strategy for Akra Legal software platform',
            akra_client_id,
            demo_lawyer_id,
            'active',
            CURRENT_DATE - INTERVAL '30 days',
            12000.00
        ) ON CONFLICT (case_number) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            client_id = EXCLUDED.client_id,
            lawyer_id = EXCLUDED.lawyer_id,
            status = EXCLUDED.status;
        
        -- Case 3: Employment Law Compliance (Closed)
        INSERT INTO public.projects (
            case_number,
            title,
            description,
            client_id,
            lawyer_id,
            status,
            start_date,
            end_date,
            budget
        ) VALUES (
            'CASE-2024-AKRA-003',
            'Employment Law Compliance',
            'Review and update of employee handbook and compliance policies',
            akra_client_id,
            demo_lawyer_id,
            'closed',
            CURRENT_DATE - INTERVAL '90 days',
            CURRENT_DATE - INTERVAL '60 days',
            6500.00
        ) ON CONFLICT (case_number) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            client_id = EXCLUDED.client_id,
            lawyer_id = EXCLUDED.lawyer_id,
            status = EXCLUDED.status;
        
        -- Create some invoices for realistic financial data
        INSERT INTO public.invoices (
            invoice_number,
            client_id,
            lawyer_id,
            services,
            subtotal,
            tax_amount,
            discount_amount,
            total_amount,
            status,
            issued_date,
            due_date
        ) VALUES (
            'INV-2025-AKRA-001',
            akra_client_id,
            demo_lawyer_id,
            '[
                {"description": "Contract Review Services", "hours": 15, "rate": 350, "amount": 5250},
                {"description": "Legal Research", "hours": 8, "rate": 300, "amount": 2400}
            ]'::jsonb,
            7650.00,
            765.00,
            0.00,
            8415.00,
            'paid',
            CURRENT_DATE - INTERVAL '20 days',
            CURRENT_DATE - INTERVAL '5 days'
        ) ON CONFLICT (invoice_number) DO UPDATE SET
            services = EXCLUDED.services,
            subtotal = EXCLUDED.subtotal,
            total_amount = EXCLUDED.total_amount;
        
        -- Create some transactions related to this client
        INSERT INTO public.transactions (
            transaction_type,
            amount,
            currency,
            method,
            status,
            payment_gateway_id,
            description,
            client_id,
            processed_by
        ) VALUES (
            'payment',
            8415.00,
            'USD',
            'bank_transfer',
            'success',
            'akra_payment_001',
            'Payment for Corporate Contract Review - Invoice INV-2025-AKRA-001',
            akra_client_id,
            demo_lawyer_id
        );
        
        RAISE NOTICE 'Created multiple cases and financial records for Akra Legal client';
    END IF;
END $$;