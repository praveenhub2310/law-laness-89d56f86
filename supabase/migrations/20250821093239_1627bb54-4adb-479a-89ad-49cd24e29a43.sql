-- Create enum for cause list status
CREATE TYPE public.cause_status AS ENUM ('scheduled', 'in_progress', 'completed', 'adjourned');

-- Create cause_list table
CREATE TABLE public.cause_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  parties TEXT NOT NULL,
  court_name TEXT NOT NULL,
  judge_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status cause_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cause_list ENABLE ROW LEVEL SECURITY;

-- Create policies for cause_list
CREATE POLICY "Users can view cause list entries" 
ON public.cause_list 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create cause list entries" 
ON public.cause_list 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
);

CREATE POLICY "Users can update cause list entries" 
ON public.cause_list 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
);

CREATE POLICY "Users can delete cause list entries" 
ON public.cause_list 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  get_user_role(auth.uid()) = ANY (ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_cause_list_updated_at
  BEFORE UPDATE ON public.cause_list
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for cause_list table
ALTER TABLE public.cause_list REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cause_list;