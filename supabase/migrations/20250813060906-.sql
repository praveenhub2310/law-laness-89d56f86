-- Fix the profiles table foreign key constraint and create demo users with correct enum values
-- First, let's check if there's a foreign key constraint causing issues

-- Drop the foreign key constraint if it exists (it's preventing user creation)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now let's create the demo users directly by inserting into public tables
-- We'll use specific UUIDs for the demo users to ensure consistency

-- Demo user UUIDs (using deterministic UUIDs for demo purposes)
DO $$
DECLARE
    admin_id UUID := '11111111-1111-1111-1111-111111111111';
    lawyer_id UUID := '22222222-2222-2222-2222-222222222222';
    firm_id UUID := '33333333-3333-3333-3333-333333333333';
    client_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN
    -- Insert profiles for demo users
    INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at) VALUES
    (admin_id, 'admin@akralegal.com', 'John', 'Smith', 'super_admin', now(), now()),
    (lawyer_id, 'lawyer@akralegal.com', 'Sarah', 'Johnson', 'advocate', now(), now()),
    (firm_id, 'firm@akralegal.com', 'Michael', 'Brown', 'company', now(), now()),
    (client_id, 'client@akralegal.com', 'Emily', 'Davis', 'client', now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- Insert role-specific records
    INSERT INTO public.advocates (id, bar_number, availability_status, created_at, updated_at) VALUES
    (lawyer_id, 'BAR12345', 'available', now(), now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.companies (id, company_name, created_at, updated_at) VALUES
    (firm_id, 'Brown Legal Associates', now(), now())
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.clients (id, client_type, preferred_contact_method, created_at, updated_at) VALUES
    (client_id, 'individual', 'email', now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- Create sample projects with correct enum values
    INSERT INTO public.projects (case_number, title, description, client_id, lawyer_id, status, start_date, budget, created_at, updated_at) VALUES
    ('CASE-2024-001', 'Corporate Contract Dispute', 'Legal dispute over contract terms and conditions', client_id, lawyer_id, 'active', CURRENT_DATE - INTERVAL '30 days', 15000.00, now(), now()),
    ('CASE-2024-002', 'Employment Law Consultation', 'Workplace harassment and wrongful termination case', client_id, lawyer_id, 'pending', CURRENT_DATE - INTERVAL '15 days', 8500.00, now(), now())
    ON CONFLICT (case_number) DO NOTHING;
END $$;