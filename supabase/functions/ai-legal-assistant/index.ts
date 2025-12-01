import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, toolType, documentContext } = await req.json();

    console.log('AI Legal Assistant called:', { 
      conversationId, 
      toolType, 
      messageCount: messages?.length,
      hasDocumentContext: !!documentContext 
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Build system prompt based on tool type
    let systemPrompt = getSystemPrompt(toolType, documentContext);

    // Prepare messages for the AI model
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Use Hugging Face Inference API with open-source models
    // Using Mistral-7B-Instruct for legal analysis
    const HF_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY');
    
    if (!HF_API_KEY) {
      throw new Error('HUGGING_FACE_API_KEY not configured');
    }

    const modelEndpoint = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
    
    // Format conversation for Mistral
    const conversationText = formatConversationForMistral(formattedMessages);

    console.log('Calling Hugging Face API with Mistral model...');

    const hfResponse = await fetch(modelEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: conversationText,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status} - ${errorText}`);
    }

    const hfData = await hfResponse.json();
    console.log('Hugging Face response received');

    // Extract the generated text
    let assistantResponse = '';
    if (Array.isArray(hfData) && hfData[0]?.generated_text) {
      assistantResponse = hfData[0].generated_text.trim();
    } else if (hfData.generated_text) {
      assistantResponse = hfData.generated_text.trim();
    } else {
      throw new Error('Unexpected response format from Hugging Face');
    }

    // Save the assistant's response to the database
    const { error: insertError } = await supabaseClient
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantResponse,
        metadata: { model: 'mistralai/Mistral-7B-Instruct-v0.2', toolType }
      });

    if (insertError) {
      console.error('Error saving message:', insertError);
      throw insertError;
    }

    console.log('AI response saved successfully');

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        conversationId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in AI Legal Assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getSystemPrompt(toolType: string, documentContext?: any): string {
  const basePrompt = "You are an expert legal AI assistant helping lawyers and law firms with case analysis and legal research. Provide clear, accurate, and actionable legal insights.";
  
  const toolPrompts = {
    case_analyser: `${basePrompt} You specialize in analyzing legal cases, identifying key issues, relevant precedents, strengths, weaknesses, and strategic recommendations.`,
    case_summary: `${basePrompt} You specialize in creating comprehensive case summaries, highlighting key facts, legal issues, parties involved, timeline, and critical points.`,
    compliance: `${basePrompt} You specialize in legal compliance, helping ensure adherence to laws, regulations, and standards. Provide detailed compliance guidance and risk assessments.`,
    scenario_guidance: `${basePrompt} You specialize in scenario planning and strategic legal guidance, helping attorneys make informed decisions about case strategy and tactics.`
  };

  let prompt = toolPrompts[toolType as keyof typeof toolPrompts] || basePrompt;

  if (documentContext) {
    prompt += `\n\nDocument Context:\nFile: ${documentContext.filename}\nType: ${documentContext.file_type}\nSize: ${documentContext.file_size}\n`;
    if (documentContext.content) {
      prompt += `\nDocument Content Preview:\n${documentContext.content.substring(0, 2000)}...\n`;
    }
  }

  return prompt;
}

function formatConversationForMistral(messages: Array<{role: string, content: string}>): string {
  let formatted = '';
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      formatted += `<s>[INST] ${msg.content} [/INST]\n`;
    } else if (msg.role === 'user') {
      formatted += `<s>[INST] ${msg.content} [/INST]\n`;
    } else if (msg.role === 'assistant') {
      formatted += `${msg.content}</s>\n`;
    }
  }
  
  return formatted;
}