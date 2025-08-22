import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[TEST] 🧪 Test function called successfully');
    
    // Check if secrets exist
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    console.log('[TEST] 🔑 Key ID exists:', !!razorpayKeyId);
    console.log('[TEST] 🔑 Key Secret exists:', !!razorpayKeySecret);
    
    if (razorpayKeyId) {
      console.log('[TEST] 🔑 Key ID length:', razorpayKeyId.length);
      console.log('[TEST] 🔑 Key ID preview:', razorpayKeyId.substring(0, 8) + '***');
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      keyIdPresent: !!razorpayKeyId,
      keySecretPresent: !!razorpayKeySecret,
      message: 'Test function working'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: any) {
    console.error('[TEST] ❌ Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});