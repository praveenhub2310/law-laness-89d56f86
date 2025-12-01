import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: any;
}

export interface AIConversation {
  id: string;
  title: string;
  tool_type: string;
  case_id?: string;
  document_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useAIConversation = (toolType: string, caseId?: string) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Create or load conversation
  const initializeConversation = async (documentId?: string) => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if there's an active conversation for this tool type
      const { data: existingConversations, error: fetchError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('tool_type', toolType)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingConversations && existingConversations.length > 0) {
        // Use existing conversation
        const conv = existingConversations[0];
        setConversation(conv);
        await loadMessages(conv.id);
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            tool_type: toolType,
            case_id: caseId,
            document_id: documentId,
            title: `${toolType} - ${new Date().toLocaleString()}`,
            status: 'active'
          })
          .select()
          .single();

        if (createError) throw createError;

        setConversation(newConv);
        
        // Add system welcome message
        const welcomeMessage = getWelcomeMessage(toolType);
        await supabase
          .from('ai_messages')
          .insert({
            conversation_id: newConv.id,
            role: 'assistant',
            content: welcomeMessage
          });

        await loadMessages(newConv.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize conversation');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages: AIMessage[] = (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant' | 'system'
      }));

      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Send a message
  const sendMessage = async (content: string, documentContext?: any) => {
    if (!conversation || !user) return;

    try {
      setSending(true);

      // Save user message
      const { data: userMessage, error: userMsgError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Add to local state immediately with proper typing
      const typedUserMessage: AIMessage = {
        ...userMessage,
        role: userMessage.role as 'user' | 'assistant' | 'system'
      };
      setMessages(prev => [...prev, typedUserMessage]);

      // Get all messages for context
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('ai-legal-assistant', {
        body: {
          messages: allMessages,
          conversationId: conversation.id,
          toolType: toolType,
          documentContext
        }
      });

      if (error) throw error;

      // Reload messages to get the AI response
      await loadMessages(conversation.id);

      toast.success('AI response received');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Clear conversation
  const clearConversation = async () => {
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ status: 'archived' })
        .eq('id', conversation.id);

      if (error) throw error;

      setConversation(null);
      setMessages([]);
      toast.success('Conversation cleared');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast.error('Failed to clear conversation');
    }
  };

  return {
    conversation,
    messages,
    loading,
    sending,
    initializeConversation,
    sendMessage,
    clearConversation
  };
};

function getWelcomeMessage(toolType: string): string {
  const messages = {
    case_analyser: "Hello! I'm here to help analyze your legal cases. I can identify key issues, relevant precedents, and provide strategic recommendations. Upload a document or describe your case to get started.",
    case_summary: "Hello! I can help generate comprehensive case summaries. Share case details or upload documents, and I'll create a structured summary with key facts, legal issues, and important points.",
    compliance: "Hello! I'm your legal compliance assistant. I can help ensure adherence to laws and regulations, conduct risk assessments, and provide compliance guidance. What would you like to check?",
    scenario_guidance: "Hello! I provide strategic legal guidance and scenario planning. Describe your situation, and I'll help you analyze options and make informed decisions."
  };

  return messages[toolType as keyof typeof messages] || "Hello! How can I assist you today?";
}