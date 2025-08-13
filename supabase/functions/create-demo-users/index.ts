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
        email: 'admin@akralegal.com',
        password: 'admin123',
        role: 'super_admin',
        first_name: 'John',
        last_name: 'Smith'
      },
      {
        email: 'lawyer@akralegal.com',
        password: 'lawyer123',
        role: 'advocate',
        first_name: 'Sarah',
        last_name: 'Johnson',
        bar_number: 'BAR12345'
      },
      {
        email: 'firm@akralegal.com',
        password: 'firm123',
        role: 'company',
        first_name: 'Michael',
        last_name: 'Brown',
        company_name: 'Brown Legal Associates'
      },
      {
        email: 'client@akralegal.com',
        password: 'client123',
        role: 'client',
        first_name: 'Emily',
        last_name: 'Davis'
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

      // Create user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          company_name: userData.company_name,
          bar_number: userData.bar_number
        }
      })

      if (createError) {
        results.push({ email: userData.email, status: 'error', error: createError.message })
        continue
      }

      if (newUser.user) {
        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Create role-specific records
        if (userData.role === 'advocate') {
          await supabaseAdmin
            .from('advocates')
            .insert({
              id: newUser.user.id,
              bar_number: userData.bar_number,
              availability_status: 'available'
            })
        } else if (userData.role === 'company') {
          await supabaseAdmin
            .from('companies')
            .insert({
              id: newUser.user.id,
              company_name: userData.company_name
            })
        } else if (userData.role === 'client') {
          await supabaseAdmin
            .from('clients')
            .insert({
              id: newUser.user.id,
              client_type: 'individual',
              preferred_contact_method: 'email'
            })
        }

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})