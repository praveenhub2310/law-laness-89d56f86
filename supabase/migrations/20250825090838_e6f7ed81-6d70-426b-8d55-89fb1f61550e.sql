-- Insert sample data with unique identifiers
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role
) VALUES 
(
  'f1234567-1234-1234-1234-123456789abc',
  'advocate.demo@lawfirm.com',
  'Sarah',
  'Johnson',
  'advocate'
),
(
  'g1234567-1234-1234-1234-123456789abc',
  'client.demo1@gmail.com',
  'Michael',
  'Thompson',
  'client'
),
(
  'h1234567-1234-1234-1234-123456789abc',
  'client.demo2@gmail.com',
  'Emily',
  'Davis',
  'client'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects with unique case numbers
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
  'i1234567-1234-1234-1234-123456789abc',
  'DEMO-2024-HR-001',
  'Employment Contract Dispute',
  'Wrongful termination and breach of employment contract',
  'g1234567-1234-1234-1234-123456789abc',
  'f1234567-1234-1234-1234-123456789abc',
  'active',
  '2024-01-10'
),
(
  'j1234567-1234-1234-1234-123456789abc',
  'DEMO-2024-IP-002',
  'Intellectual Property Infringement',
  'Patent violation and trademark dispute',
  'h1234567-1234-1234-1234-123456789abc',
  'f1234567-1234-1234-1234-123456789abc',
  'active',
  '2024-01-25'
);

-- Insert sample hearings
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
  'i1234567-1234-1234-1234-123456789abc',
  'g1234567-1234-1234-1234-123456789abc',
  'f1234567-1234-1234-1234-123456789abc',
  '2024-02-15',
  '10:30',
  '02:00:00',  
  'HR001-H1',
  'Case Management Conference',
  'Initial case management and scheduling hearing',
  'District Court - Employment Division',
  'Room 204',
  'Hon. Judge Patricia Wilson',
  'Motion Hearing',
  'scheduled',
  'Bring employment contract and termination documents'
),
(
  'j1234567-1234-1234-1234-123456789abc',
  'h1234567-1234-1234-1234-123456789abc',
  'f1234567-1234-1234-1234-123456789abc',
  '2024-02-22',
  '14:00',
  '01:30:00',
  'IP002-H1',
  'Preliminary Injunction Hearing',
  'Motion for preliminary injunction to stop patent infringement',
  'Federal Court - IP Division',
  'Room 1A',
  'Hon. Judge Robert Chen',
  'Preliminary Hearing',
  'confirmed',
  'Patent documentation and expert witness testimony ready'
),
(
  'i1234567-1234-1234-1234-123456789abc',
  'g1234567-1234-1234-1234-123456789abc',
  'f1234567-1234-1234-1234-123456789abc',
  '2024-03-05',
  '11:00',
  '02:30:00',
  'HR001-H2',
  'Evidence Presentation Hearing',
  'Presentation of employment records and witness testimonies',
  'District Court - Employment Division',
  'Room 204',
  'Hon. Judge Patricia Wilson',
  'Trial',
  'scheduled',
  'Witness list submitted, evidence exhibits prepared'
),
(
  'j1234567-1234-1234-1234-123456789abc',
  'h1234567-1234-1234-1234-123456789abc',
  'f1234567-1234-1234-1234-123456789abc',
  '2024-01-30',
  '09:15',
  '01:00:00',
  'IP002-H0',
  'Emergency Motion Hearing',
  'Emergency hearing for temporary restraining order',
  'Federal Court - IP Division',
  'Room 1A',
  'Hon. Judge Robert Chen',
  'Motion Hearing',
  'completed',
  'TRO granted, case proceeding to preliminary injunction phase'
);