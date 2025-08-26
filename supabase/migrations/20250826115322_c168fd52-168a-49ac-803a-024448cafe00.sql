-- Fix the function search path security issue
DROP FUNCTION IF EXISTS assign_lawyer_to_client(text, uuid);

CREATE OR REPLACE FUNCTION assign_lawyer_to_client(client_email text, lawyer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_record RECORD;
  project_count INTEGER;
BEGIN
  -- Get client information
  SELECT id INTO client_record FROM public.profiles WHERE email = client_email AND role = 'client';
  
  IF client_record.id IS NULL THEN
    RAISE NOTICE 'Client with email % not found', client_email;
    RETURN;
  END IF;
  
  -- Check if client has any projects
  SELECT COUNT(*) INTO project_count FROM public.projects WHERE client_id = client_record.id;
  
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
      'CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 10) AS INTEGER)), 0) + 1 FROM public.projects WHERE case_number LIKE 'CASE-' || EXTRACT(YEAR FROM NOW()) || '-%')::TEXT, 4, '0'),
      'General Legal Consultation',
      'Initial legal consultation and ongoing support',
      client_record.id,
      assign_lawyer_to_client.lawyer_id,
      'active',
      CURRENT_DATE
    );
  ELSE
    -- Update existing projects to assign the lawyer
    UPDATE public.projects 
    SET 
      lawyer_id = assign_lawyer_to_client.lawyer_id,
      updated_at = now()
    WHERE client_id = client_record.id 
    AND (lawyer_id IS NULL OR lawyer_id != assign_lawyer_to_client.lawyer_id);
  END IF;
  
  RAISE NOTICE 'Successfully assigned lawyer % to client %', assign_lawyer_to_client.lawyer_id, client_email;
END;
$$;