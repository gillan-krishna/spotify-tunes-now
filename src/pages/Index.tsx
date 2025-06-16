import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat } from 'lucide-react';
import { getCurrentlyPlaying, Track } from '@/services/spotifyService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  // Fetch current track from Spotify
  const fetchTrack = async () => {
    try {
      const response = await getCurrentlyPlaying();
      console.log("[DEBUG] Frontend response from getCurrentlyPlaying:", response);
      if (response.error) {
        setError(response.error);
        setTrack(null); // Clear track if there's an error
        setIsPlaying(false);
        return;
      }
      
      if (!response.is_playing) {
        setTrack(null);
        setIsPlaying(false);
        return;
      }

      if (response.track) {
        setTrack(response.track);
        setIsPlaying(response.is_playing);
        setProgress((response.track.progress_ms / response.track.duration_ms) * 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch track');
      setTrack(null);
      setIsPlaying(false);
    }
  };

  // Initial fetch and set up polling
  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Track Playing</h2>
          <p className="text-gray-600">Start playing a track on Spotify to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          {/* Album Art */}
          <div className="relative mb-8">
            <div className="w-80 h-80 mx-auto rounded-2xl overflow-hidden shadow-2xl">
              {track.album_art && (
                <img 
                  src={track.album_art} 
                  alt={track.album}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Floating controls indicator */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <span className="text-white/80 text-sm font-medium">
                  Live from Spotify
                </span>
              </div>
            </div>
          </div>

          {/* Song Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {track.title}
            </h1>
            <p className="text-xl text-white/70 mb-1">{track.artist}</p>
            <p className="text-lg text-white/50">{track.album}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-white/60 text-sm mb-2">
              <span>{formatTime(track.progress_ms)}</span>
              <span>{formatTime(track.duration_ms)}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button className="text-white/60 hover:text-white transition-colors">
              <Shuffle size={20} />
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <SkipBack size={24} />
            </button>
            <button 
              className="bg-white text-black rounded-full p-4 hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <SkipForward size={24} />
            </button>
            <button className="text-white/60 hover:text-white transition-colors">
              <Repeat size={20} />
            </button>
          </div>

          {/* Like Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`transition-colors ${isLiked ? 'text-green-500' : 'text-white/60 hover:text-white'}`}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Showing live music from Spotify
          </p>
        </div>
      </div>
    </div>
  );
};

// Format time from milliseconds to mm:ss
const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default Index;
