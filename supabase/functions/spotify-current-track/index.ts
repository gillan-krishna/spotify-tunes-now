
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get Spotify tokens for the main user (fixed ID)
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('spotify_tokens')
      .select('*')
      .eq('id', 1)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Spotify not connected')
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token
    const expiresAt = new Date(tokenData.expires_at)
    
    if (expiresAt <= new Date()) {
      // Refresh token
      const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('SPOTIFY_CLIENT_ID')}:${Deno.env.get('SPOTIFY_CLIENT_SECRET')}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenData.refresh_token
        })
      })

      const refreshTokens = await refreshResponse.json()
      
      if (refreshResponse.ok) {
        accessToken = refreshTokens.access_token
        
        // Update tokens in database
        await supabaseClient
          .from('spotify_tokens')
          .update({
            access_token: refreshTokens.access_token,
            expires_at: new Date(Date.now() + refreshTokens.expires_in * 1000).toISOString()
          })
          .eq('id', 1)
      }
    }

    // Get currently playing track
    const spotifyResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (spotifyResponse.status === 204) {
      return new Response(
        JSON.stringify({ isPlaying: false, message: 'No track currently playing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!spotifyResponse.ok) {
      throw new Error('Failed to get currently playing track')
    }

    const currentTrack = await spotifyResponse.json()

    return new Response(
      JSON.stringify({
        isPlaying: currentTrack.is_playing,
        track: {
          title: currentTrack.item?.name || 'Unknown',
          artist: currentTrack.item?.artists?.[0]?.name || 'Unknown Artist',
          album: currentTrack.item?.album?.name || 'Unknown Album',
          albumArt: currentTrack.item?.album?.images?.[0]?.url || '',
          duration: currentTrack.item?.duration_ms || 0,
          progress: currentTrack.progress_ms || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
