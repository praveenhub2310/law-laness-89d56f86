-- Create a case for the current client user and assign Sarah Johnson as lawyer
INSERT INTO public.projects (
  case_number,
  title,
  description,
  client_id,
  lawyer_id,
  status,
  start_date
) VALUES (
  'CASE-2025-CLIENT-001',
  'General Legal Consultation',
  'Initial legal consultation and ongoing support',
  '06fcc15e-85d6-48e3-b93a-1522dd126c5a',
  '22222222-2222-2222-2222-222222222222',
  'active',
  CURRENT_DATE
) ON CONFLICT (case_number) DO NOTHING;