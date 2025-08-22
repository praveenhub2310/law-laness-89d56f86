-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  services JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial', 'overdue')),
  due_date DATE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL CHECK (method IN ('razorpay', 'upi', 'bank_transfer', 'cash', 'check', 'card')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending', 'cancelled')),
  payment_gateway_id TEXT,
  payment_gateway_response JSONB,
  processed_by UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hearings table (enhance existing court_calendar)
CREATE TABLE public.hearings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hearing_number TEXT NOT NULL UNIQUE,
  case_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hearing_date DATE NOT NULL,
  hearing_time TIME,
  duration INTERVAL DEFAULT '1 hour',
  court_name TEXT NOT NULL,
  court_room TEXT,
  judge_name TEXT,
  hearing_type TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'postponed', 'completed', 'cancelled')),
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting_recordings table
CREATE TABLE public.meeting_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  meeting_date DATE NOT NULL,
  duration INTEGER, -- in seconds
  recording_type TEXT NOT NULL CHECK (recording_type IN ('audio', 'video')),
  file_url TEXT,
  file_size BIGINT,
  transcript TEXT,
  participants JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  is_confidential BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create e_sign_documents table
CREATE TABLE public.e_sign_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  original_file_url TEXT NOT NULL,
  signed_file_url TEXT,
  signature_positions JSONB DEFAULT '[]',
  signatures JSONB DEFAULT '[]',
  signing_status TEXT NOT NULL DEFAULT 'pending' CHECK (signing_status IN ('pending', 'partially_signed', 'fully_signed', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_sign_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view related invoices" ON public.invoices
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Lawyers can manage invoices" ON public.invoices
  FOR ALL USING (
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  );

-- RLS Policies for transactions
CREATE POLICY "Users can view related transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Authorized users can manage transactions" ON public.transactions
  FOR ALL USING (
    auth.uid() = lawyer_id OR 
    auth.uid() = processed_by OR
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  );

-- RLS Policies for hearings
CREATE POLICY "Users can view related hearings" ON public.hearings
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Lawyers can manage hearings" ON public.hearings
  FOR ALL USING (
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  );

-- RLS Policies for meeting_recordings
CREATE POLICY "Users can view related recordings" ON public.meeting_recordings
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Lawyers can manage recordings" ON public.meeting_recordings
  FOR ALL USING (
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  );

-- RLS Policies for e_sign_documents
CREATE POLICY "Users can view related e-sign documents" ON public.e_sign_documents
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Lawyers can manage e-sign documents" ON public.e_sign_documents
  FOR ALL USING (
    auth.uid() = lawyer_id OR 
    get_user_role(auth.uid()) = ANY(ARRAY['super_admin'::user_role, 'company'::user_role, 'advocate'::user_role])
  );

-- Update triggers for timestamps
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hearings_updated_at
  BEFORE UPDATE ON public.hearings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at
  BEFORE UPDATE ON public.meeting_recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_e_sign_documents_updated_at
  BEFORE UPDATE ON public.e_sign_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hearings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_recordings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.e_sign_documents;

-- Create indexes for better performance
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_lawyer_id ON public.invoices(lawyer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issued_date ON public.invoices(issued_date);

CREATE INDEX idx_transactions_invoice_id ON public.transactions(invoice_id);
CREATE INDEX idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

CREATE INDEX idx_hearings_client_id ON public.hearings(client_id);
CREATE INDEX idx_hearings_lawyer_id ON public.hearings(lawyer_id);
CREATE INDEX idx_hearings_date ON public.hearings(hearing_date);
CREATE INDEX idx_hearings_status ON public.hearings(status);

CREATE INDEX idx_meeting_recordings_client_id ON public.meeting_recordings(client_id);
CREATE INDEX idx_meeting_recordings_lawyer_id ON public.meeting_recordings(lawyer_id);
CREATE INDEX idx_meeting_recordings_date ON public.meeting_recordings(meeting_date);

CREATE INDEX idx_e_sign_documents_client_id ON public.e_sign_documents(client_id);
CREATE INDEX idx_e_sign_documents_lawyer_id ON public.e_sign_documents(lawyer_id);
CREATE INDEX idx_e_sign_documents_status ON public.e_sign_documents(signing_status);