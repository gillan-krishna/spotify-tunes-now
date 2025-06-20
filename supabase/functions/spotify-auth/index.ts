
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Spotify auth function called with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    const { action, code } = requestBody
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
    
    console.log('Environment check - Client ID exists:', !!clientId, 'Client Secret exists:', !!clientSecret)
    
    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured')
    }

    const redirectUri = `${req.headers.get('origin')}/callback`
    console.log('Redirect URI:', redirectUri)

    if (action === 'get-auth-url') {
      const scopes = [
        'user-read-currently-playing',
        'user-read-playback-state',
        'user-read-recently-played',
        'streaming',
        'user-read-email',
        'user-read-private'
      ].join(' ')

      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `show_dialog=true`

      console.log('Generated auth URL successfully')
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchange-code') {
      console.log('Exchanging code for tokens')
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        })
      })

      const tokens = await tokenResponse.json()
      console.log('Token exchange response status:', tokenResponse.status)

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokens)
        throw new Error(tokens.error_description || 'Failed to exchange code for tokens')
      }

      // Store tokens for the main user (use a fixed ID)
      const { error } = await supabaseClient
        .from('spotify_tokens')
        .upsert({
          id: 1, // Fixed ID for the main user
          user_id: '00000000-0000-0000-0000-000000000000', // Fixed UUID
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          token_type: tokens.token_type,
          scope: tokens.scope
        })

      if (error) {
        console.error('Error storing tokens:', error)
        throw error
      }

      console.log('Tokens stored successfully')
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in spotify-auth function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
