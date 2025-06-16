
import { supabase } from '@/integrations/supabase/client';

const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-recently-played',
  'streaming',
  'user-read-email',
  'user-read-private'
].join(' ');

export const getSpotifyAuthUrl = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'get-auth-url' }
    });
    
    if (error) throw error;
    return data.authUrl;
  } catch (error) {
    console.error('Error getting Spotify auth URL:', error);
    throw error;
  }
};

export const exchangeCodeForTokens = async (code: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'exchange-code', code }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

export const getCurrentlyPlaying = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('spotify-current-track', {
      method: 'GET'
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting currently playing track:', error);
    throw error;
  }
};
