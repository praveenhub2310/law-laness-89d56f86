-- Create table for AI conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL, -- 'case_analyser', 'case_summary', 'compliance', 'scenario_guidance'
  case_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create table for AI messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- For storing additional context like document info, analysis results, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.ai_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.ai_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.ai_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_case_id ON public.ai_conversations(case_id);
CREATE INDEX idx_ai_conversations_tool_type ON public.ai_conversations(tool_type);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.ai_conversations IS 'Stores AI tool conversation sessions for legal analysis';
COMMENT ON TABLE public.ai_messages IS 'Stores individual messages within AI conversations';