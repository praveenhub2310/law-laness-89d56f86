import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📡 OneDrive OAuth request received:', req.method);

    // Handle GET request for client configuration
    if (req.method === 'GET') {
      const clientId = Deno.env.get('VITE_MICROSOFT_CLIENT_ID');
      
      if (!clientId) {
        throw new Error('Microsoft Client ID not configured in secrets');
      }
      
      console.log('✅ Returning client configuration');
      return new Response(
        JSON.stringify({ clientId }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle POST request for token exchange
    if (req.method === 'POST') {
      const { code, redirectUri } = await req.json();
      console.log('🔄 Token exchange request received');

      if (!code) {
        throw new Error('Authorization code is required');
      }

      const clientId = Deno.env.get('VITE_MICROSOFT_CLIENT_ID');
      const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        console.error('❌ Missing OAuth credentials');
        throw new Error('Microsoft OAuth credentials not configured');
      }

      console.log('🔑 Using client ID:', clientId);
      console.log('🔄 Redirect URI:', redirectUri);

      // Exchange authorization code for access token
      const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri || `https://app.akralegal.com/dashboard/cloud-storage`,
        grant_type: 'authorization_code',
        scope: 'openid profile User.Read Files.ReadWrite offline_access'
      });

      console.log('📡 Making token request to Microsoft...');
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenParams.toString()
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.statusText} - ${errorText}`);
      }

      const tokens = await tokenResponse.json();
      console.log('✅ Token exchange successful');

      return new Response(
        JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );
    
  } catch (error) {
    console.error('💥 OneDrive OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});