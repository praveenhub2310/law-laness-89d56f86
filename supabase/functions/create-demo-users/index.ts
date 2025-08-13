import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const demoUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@akralegal.com',
        password: 'admin123',
        role: 'super_admin'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'lawyer@akralegal.com',
        password: 'lawyer123',
        role: 'advocate'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'firm@akralegal.com',
        password: 'firm123',
        role: 'company'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'client@akralegal.com',
        password: 'client123',
        role: 'client'
      }
    ]

    const results = []

    for (const userData of demoUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(userData.email)
      
      if (existingUser.user) {
        results.push({ email: userData.email, status: 'already_exists', id: existingUser.user.id })
        continue
      }

      // Create user with specific ID
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          role: userData.role
        }
      })

      if (createError) {
        console.error(`Error creating user ${userData.email}:`, createError)
        results.push({ email: userData.email, status: 'error', error: createError.message })
        continue
      }

      if (newUser.user) {
        results.push({ email: userData.email, status: 'created', id: newUser.user.id })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Demo users creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})