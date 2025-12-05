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

    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1]?.content || '';
    
    // Build the input for the model
    const inputText = `${systemPrompt}\n\nUser Query: ${latestUserMessage}\n\nProvide a helpful, detailed legal response:`;

    const HF_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY');
    
    if (!HF_API_KEY) {
      throw new Error('HUGGING_FACE_API_KEY not configured');
    }

    // Using Google's Flan-T5-Large which is available on free tier
    const modelEndpoint = "https://router.huggingface.co/hf-inference/models/google/flan-t5-large";
    
    console.log('Calling Hugging Face API with Flan-T5-Large model...');
    console.log('Input preview:', inputText.substring(0, 300));

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const hfResponse = await fetch(modelEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputText,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          do_sample: true,
        },
        options: {
          wait_for_model: true,
          use_cache: true,
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('HF Response status:', hfResponse.status);

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', errorText);
      
      // If model is loading, provide helpful message
      if (hfResponse.status === 503) {
        throw new Error('Model is loading. Please try again in a moment.');
      }
      
      throw new Error(`Hugging Face API error: ${hfResponse.status} - ${errorText}`);
    }

    const hfData = await hfResponse.json();
    console.log('Hugging Face response received:', JSON.stringify(hfData).substring(0, 200));

    // Extract the generated text
    let assistantResponse = '';
    if (Array.isArray(hfData) && hfData[0]?.generated_text) {
      assistantResponse = hfData[0].generated_text.trim();
    } else if (hfData.generated_text) {
      assistantResponse = hfData.generated_text.trim();
    } else if (Array.isArray(hfData) && typeof hfData[0] === 'string') {
      assistantResponse = hfData[0].trim();
    } else {
      console.error('Unexpected response format:', JSON.stringify(hfData));
      throw new Error('Unexpected response format from Hugging Face');
    }

    // If response is too short, provide a fallback
    if (assistantResponse.length < 20) {
      assistantResponse = `Based on your query about "${latestUserMessage.substring(0, 50)}...", I recommend consulting with a qualified legal professional for specific advice. Key considerations include: 1) Understanding the applicable laws and regulations, 2) Gathering all relevant documentation, 3) Considering potential outcomes and strategies.`;
    }

    // Save the assistant's response to the database
    const { error: insertError } = await supabaseClient
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantResponse,
        metadata: { model: 'google/flan-t5-large', toolType }
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
    
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ 
          error: 'Request timeout. The AI model took too long to respond. Please try again.',
          details: 'Request timed out after 60 seconds'
        }),
        { 
          status: 504, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
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
  
  const toolPrompts: Record<string, string> = {
    case_analyser: `${basePrompt} You specialize in analyzing legal cases, identifying key issues, relevant precedents, strengths, weaknesses, and strategic recommendations.`,
    case_summary: `${basePrompt} You specialize in creating comprehensive case summaries, highlighting key facts, legal issues, parties involved, timeline, and critical points.`,
    compliance: `${basePrompt} You specialize in legal compliance, helping ensure adherence to laws, regulations, and standards. Provide detailed compliance guidance and risk assessments.`,
    scenario_guidance: `${basePrompt} You specialize in scenario planning and strategic legal guidance, helping attorneys make informed decisions about case strategy and tactics.`
  };

  let prompt = toolPrompts[toolType] || basePrompt;

  if (documentContext) {
    prompt += `\n\nDocument Context:\nFile: ${documentContext.filename}\nType: ${documentContext.file_type}\nSize: ${documentContext.file_size}\n`;
    if (documentContext.content) {
      prompt += `\nDocument Content Preview:\n${documentContext.content.substring(0, 2000)}...\n`;
    }
  }

  return prompt;
}
