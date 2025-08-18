-- Create court_calendar table
CREATE TABLE public.court_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  court_name TEXT NOT NULL,
  hearing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_tracker table
CREATE TABLE public.time_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID,
  task_description TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- duration in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID,
  expense_title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  expense_date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.court_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for court_calendar
CREATE POLICY "Users can view court calendar entries"
ON public.court_calendar
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = 'super_admin'::user_role OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = court_calendar.case_id 
      AND (p.client_id = auth.uid() OR p.lawyer_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can create court calendar entries"
ON public.court_calendar
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  )
);

CREATE POLICY "Users can update court calendar entries"
ON public.court_calendar
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = court_calendar.case_id 
      AND (p.client_id = auth.uid() OR p.lawyer_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can delete court calendar entries"
ON public.court_calendar
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  )
);

-- RLS Policies for time_tracker
CREATE POLICY "Users can view their own time entries"
ON public.time_tracker
FOR SELECT
USING (
  auth.uid() = user_id OR
  get_user_role(auth.uid()) = 'super_admin'::user_role OR
  (
    get_user_role(auth.uid()) = 'company'::user_role AND
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = time_tracker.user_id 
      AND p.company_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create their own time entries"
ON public.time_tracker
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
ON public.time_tracker
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
ON public.time_tracker
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses"
ON public.expenses
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = 'super_admin'::user_role OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = expenses.case_id 
      AND (p.client_id = auth.uid() OR p.lawyer_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can create expenses"
ON public.expenses
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role, 'client'::user_role])
  )
);

CREATE POLICY "Users can update expenses"
ON public.expenses
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role]) OR
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = expenses.case_id 
      AND (p.client_id = auth.uid() OR p.lawyer_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can delete expenses"
ON public.expenses
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND (
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_court_calendar_updated_at
  BEFORE UPDATE ON public.court_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_tracker_updated_at
  BEFORE UPDATE ON public.time_tracker
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.court_calendar;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_tracker;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;