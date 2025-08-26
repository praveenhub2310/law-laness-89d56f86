-- First, let's ensure we have consistent lawyer data and clean up any duplicates
-- We'll use the first Sarah Johnson profile (with the cleaner UUID)
-- Update any existing references to use the primary profile

-- Check if we need to create advocate record for Sarah Johnson
INSERT INTO public.advocates (id, bar_number, specialization, experience_years, availability_status, bio)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'LIC-2024-001',
  ARRAY['Corporate Law', 'Contract Law', 'Litigation'],
  8,
  'available',
  'Experienced corporate attorney with expertise in contract negotiations and business litigation. Dedicated to providing comprehensive legal solutions for clients.'
) ON CONFLICT (id) DO UPDATE SET
  bar_number = EXCLUDED.bar_number,
  specialization = EXCLUDED.specialization,
  experience_years = EXCLUDED.experience_years,
  availability_status = EXCLUDED.availability_status,
  bio = EXCLUDED.bio;

-- Ensure Sarah Johnson's profile is properly set up
UPDATE public.profiles 
SET 
  first_name = 'Sarah',
  last_name = 'Johnson',
  phone = '+1 (555) 123-4567',
  role = 'advocate'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Function to assign lawyer to all client cases or create a default case
CREATE OR REPLACE FUNCTION assign_lawyer_to_client(client_email text, lawyer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_record RECORD;
  project_count INTEGER;
BEGIN
  -- Get client information
  SELECT id INTO client_record FROM profiles WHERE email = client_email AND role = 'client';
  
  IF client_record.id IS NULL THEN
    RAISE NOTICE 'Client with email % not found', client_email;
    RETURN;
  END IF;
  
  -- Check if client has any projects
  SELECT COUNT(*) INTO project_count FROM projects WHERE client_id = client_record.id;
  
  IF project_count = 0 THEN
    -- Create a default case for the client
    INSERT INTO public.projects (
      case_number,
      title,
      description,
      client_id,
      lawyer_id,
      status,
      start_date
    ) VALUES (
      'CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 10) AS INTEGER)), 0) + 1 FROM projects WHERE case_number LIKE 'CASE-' || EXTRACT(YEAR FROM NOW()) || '-%')::TEXT, 4, '0'),
      'General Legal Consultation',
      'Initial legal consultation and ongoing support',
      client_record.id,
      lawyer_id,
      'active',
      CURRENT_DATE
    );
  ELSE
    -- Update existing projects to assign the lawyer
    UPDATE public.projects 
    SET 
      lawyer_id = lawyer_id,
      updated_at = now()
    WHERE client_id = client_record.id 
    AND (lawyer_id IS NULL OR lawyer_id != lawyer_id);
  END IF;
  
  RAISE NOTICE 'Successfully assigned lawyer % to client %', lawyer_id, client_email;
END;
$$;