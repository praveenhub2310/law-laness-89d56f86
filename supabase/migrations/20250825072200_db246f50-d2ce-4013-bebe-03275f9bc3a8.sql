-- Add proper foreign key constraints for hearings table
ALTER TABLE public.hearings 
ADD CONSTRAINT fk_hearings_client_id 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.hearings 
ADD CONSTRAINT fk_hearings_lawyer_id 
FOREIGN KEY (lawyer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.hearings 
ADD CONSTRAINT fk_hearings_case_id 
FOREIGN KEY (case_id) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Enable realtime for hearings table
ALTER TABLE public.hearings REPLICA IDENTITY FULL;