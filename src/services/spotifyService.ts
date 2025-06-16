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
  details?: string;
}

// In development, we use the Vite proxy which forwards /api to the backend
// In production, we use the full URL from environment variables
const API_BASE = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'https://spotify-tunes-now.onrender.com')
  : ''; // In development, we'll use relative URLs that the proxy will handle

export const getCurrentlyPlaying = async (): Promise<CurrentlyPlayingResponse> => {
  try {
    const endpoint = '/api/current-track';
    const url = import.meta.env.PROD 
      ? `${API_BASE}${endpoint}`
      : endpoint;
    console.log(`[DEBUG] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Check if response is OK (status 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log the raw response for debugging
    console.log('[DEBUG] Raw API response:', data);
    
    // If no track is playing, return early with is_playing: false
    if (!data.is_playing || !data.track) {
      return { is_playing: false };
    }
    
    // Format the response to match our frontend interface
    return {
      is_playing: data.is_playing,
      track: {
        id: data.track.id,
        name: data.track.name,
        artists: data.track.artists,
        album: data.track.album,
        album_art: data.track.album_art,
        duration_ms: data.track.duration_ms,
        progress_ms: data.track.progress_ms || 0
      }
    };
  } catch (error) {
    console.error('Error fetching current track:', error);
    throw error;
  }
}; 
