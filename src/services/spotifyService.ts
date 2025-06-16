import { SPOTIFY_CONFIG } from '@/config/spotify';

interface Context {
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
  type: string;
}

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  album_art: string | null;
  duration_ms: number;
  progress_ms: number;
}

interface CurrentlyPlayingResponse {
  is_playing: boolean;
  track?: Track;
  message?: string;
  error?: string;
}

// In development, use the Vite proxy (/api prefix will be rewritten)
// In production, use the full URL from environment variables
const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  : '/api';

export const getCurrentlyPlaying = async (): Promise<CurrentlyPlayingResponse> => {
  try {
    console.log(`[DEBUG] Fetching from: ${API_URL}/api/current-track`);
    const response = await fetch(`${API_URL}/api/current-track`);
    
    // Check if response is OK (status 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse response as text first to handle potential non-JSON responses
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('[ERROR] Failed to parse JSON:', responseText);
      throw new Error('Invalid JSON response from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching current track:', error);
    throw error;
  }
}; 
