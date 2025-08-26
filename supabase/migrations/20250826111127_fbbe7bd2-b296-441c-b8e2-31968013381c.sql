-- Create a project/case that connects the demo lawyer to the demo client
DO $$
DECLARE
    demo_client_id uuid;
    demo_lawyer_id uuid;
BEGIN
    -- Get the demo client ID
    SELECT id INTO demo_client_id FROM public.profiles WHERE email = 'democlient@akralegal.com' AND role = 'client';
    
    -- Get the demo lawyer ID (current logged in user should be advocate/lawyer)
    SELECT id INTO demo_lawyer_id FROM public.profiles WHERE role = 'advocate' LIMIT 1;
    
    IF demo_client_id IS NOT NULL AND demo_lawyer_id IS NOT NULL THEN
        -- Create a demo case/project connecting them
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
            'CASE-2025-DEMO-001',
            'Contract Review and Legal Consultation',
            'Review of business contract terms and legal consultation for new partnership agreement',
            demo_client_id,
            demo_lawyer_id,
            'active',
            CURRENT_DATE,
            5000.00
        ) ON CONFLICT (case_number) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            client_id = EXCLUDED.client_id,
            lawyer_id = EXCLUDED.lawyer_id,
            status = EXCLUDED.status;
            
        RAISE NOTICE 'Demo case created connecting lawyer % to client %', demo_lawyer_id, demo_client_id;
    ELSE
        RAISE NOTICE 'Could not find demo lawyer or client. Lawyer: %, Client: %', demo_lawyer_id, demo_client_id;
    END IF;
END $$;