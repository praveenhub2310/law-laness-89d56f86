-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.advocates REPLICA IDENTITY FULL;
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advocates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Create some demo users data that matches the login credentials
-- Note: These will be linked to actual auth users when they sign up

-- Insert sample project data
INSERT INTO public.projects (case_number, title, description, status, created_at, updated_at) VALUES
('CASE-2024-001', 'Johnson vs. State Insurance Co.', 'Personal injury case involving a car accident with comprehensive insurance coverage dispute.', 'active', NOW(), NOW()),
('CASE-2024-002', 'Smith Property Dispute', 'Real estate boundary dispute requiring surveying and legal documentation review.', 'active', NOW(), NOW()),
('CASE-2024-003', 'Corporate Contract Review', 'Review and negotiation of multi-million dollar acquisition contract for TechCorp Inc.', 'closed', NOW(), NOW()),
('CASE-2024-004', 'Employment Discrimination Case', 'Workplace discrimination case involving harassment and wrongful termination claims.', 'active', NOW(), NOW()),
('CASE-2024-005', 'Medical Malpractice Suit', 'Complex medical malpractice case involving surgical complications and patient care standards.', 'active', NOW(), NOW());

-- Insert sample documents data
INSERT INTO public.documents (filename, title, category, file_type, status, confidential, created_at) VALUES
('contract_draft_v1.pdf', 'Initial Contract Draft', 'Legal Documents', 'PDF', 'active', false, NOW()),
('evidence_photos.zip', 'Accident Scene Photos', 'Evidence', 'ZIP', 'active', true, NOW()),
('medical_records.pdf', 'Patient Medical History', 'Medical Records', 'PDF', 'active', true, NOW()),
('witness_statements.docx', 'Witness Testimonies', 'Evidence', 'DOCX', 'active', false, NOW()),
('financial_analysis.xlsx', 'Damage Assessment Report', 'Financial', 'XLSX', 'active', false, NOW());