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
  title: string;
  artist: string;
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

const API_URL = ' https://api.gillan.in';

export const getCurrentlyPlaying = async (): Promise<CurrentlyPlayingResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/current-track`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch current track');
    }

    return data;
  } catch (error) {
    console.error('Error fetching current track:', error);
    throw error;
  }
}; 
