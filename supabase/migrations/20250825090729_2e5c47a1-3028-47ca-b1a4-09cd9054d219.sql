-- First insert sample projects (cases) and profiles
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role
) VALUES 
(
  'a1234567-1234-1234-1234-123456789abc',
  'lawyer1@example.com',
  'Advocate',
  'Kumar',
  'advocate'
),
(
  'b1234567-1234-1234-1234-123456789abc',
  'client1@example.com',
  'Rajesh',
  'Patel',
  'client'
),
(
  'c1234567-1234-1234-1234-123456789abc',
  'client2@example.com',
  'Priya',
  'Sharma',
  'client'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects (cases)
INSERT INTO public.projects (
  id,
  case_number,
  title,
  description,
  client_id,
  lawyer_id,
  status,
  start_date
) VALUES 
(
  'd1234567-1234-1234-1234-123456789abc',
  'CASE-2024-001',
  'Property Dispute Resolution',
  'Land ownership dispute between parties',
  'b1234567-1234-1234-1234-123456789abc',
  'a1234567-1234-1234-1234-123456789abc',
  'active',
  '2024-01-15'
),
(
  'e1234567-1234-1234-1234-123456789abc',
  'CASE-2024-002',
  'Contract Breach Settlement',
  'Commercial contract violation case',
  'c1234567-1234-1234-1234-123456789abc',
  'a1234567-1234-1234-1234-123456789abc',
  'active',
  '2024-01-20'
);

-- Now insert sample hearings with valid references
INSERT INTO public.hearings (
  case_id,
  client_id, 
  lawyer_id,
  hearing_date,
  hearing_time,
  duration,
  hearing_number,
  title,
  description,
  court_name,
  court_room,
  judge_name,
  hearing_type,
  status,
  notes
) VALUES 
(
  'd1234567-1234-1234-1234-123456789abc',
  'b1234567-1234-1234-1234-123456789abc',
  'a1234567-1234-1234-1234-123456789abc',
  '2024-02-15',
  '10:00',
  '02:00:00',
  'H001-2024',
  'Initial Case Review Hearing',
  'First hearing to review case documents and establish timeline',
  'High Court of Delhi',
  'Court Room 12',
  'Justice Rajesh Kumar',
  'Motion Hearing',
  'scheduled',
  'Client needs to bring original documents'
),
(
  'e1234567-1234-1234-1234-123456789abc',
  'c1234567-1234-1234-1234-123456789abc',
  'a1234567-1234-1234-1234-123456789abc',
  '2024-02-20',
  '14:30',
  '01:30:00',
  'H002-2024',
  'Evidence Submission Hearing',
  'Hearing for submission of key evidence and witness statements',
  'District Court Mumbai',
  'Court Room 8',
  'Justice Priya Sharma',
  'Trial',
  'confirmed',
  'All evidence documents prepared and verified'
),
(
  'd1234567-1234-1234-1234-123456789abc',
  'b1234567-1234-1234-1234-123456789abc',
  'a1234567-1234-1234-1234-123456789abc',
  '2024-03-01',
  '09:45',
  '03:00:00',
  'H003-2024',
  'Final Judgment Hearing',
  'Final hearing for case judgment and verdict',
  'Supreme Court of India',
  'Court Room 2',
  'Chief Justice Meera Singh',
  'Final Hearing',
  'scheduled',
  'Prepare final arguments and closing statements'
);