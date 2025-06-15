
import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat } from 'lucide-react';
import { getSpotifyAuthUrl, getCurrentlyPlaying } from '@/services/spotifyAuth';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "Connect Spotify to see music",
    artist: "No track playing",
    album: "Connect your account",
    albumArt: "https://via.placeholder.com/320x320/1a1a1a/ffffff?text=No+Track",
    duration: "0:00",
    currentTime: "0:00"
  });
  const { toast } = useToast();

  // Check if Spotify is connected and fetch current track
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      try {
        await fetchCurrentTrack();
        setIsConnected(true);
      } catch (error) {
        console.error('Error checking Spotify connection:', error);
        setIsConnected(false);
      }
    };

    checkSpotifyConnection();
  }, []);

  // Fetch current track from Spotify
  const fetchCurrentTrack = async () => {
    try {
      const trackData = await getCurrentlyPlaying();
      if (trackData.isPlaying && trackData.track) {
        const track = trackData.track;
        setCurrentSong({
          title: track.title,
          artist: track.artist,
          album: track.album,
          albumArt: track.albumArt || "https://via.placeholder.com/320x320/1a1a1a/ffffff?text=No+Image",
          duration: formatTime(track.duration),
          currentTime: formatTime(track.progress)
        });
        setIsPlaying(trackData.isPlaying);
        setProgress((track.progress / track.duration) * 100);
      } else {
        setCurrentSong({
          title: "No track currently playing",
          artist: "Play some music on Spotify",
          album: "Your music will appear here",
          albumArt: "https://via.placeholder.com/320x320/1a1a1a/ffffff?text=No+Track",
          duration: "0:00",
          currentTime: "0:00"
        });
        setIsPlaying(false);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
      throw error;
    }
  };

  // Format time from milliseconds to mm:ss
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle Spotify connection
  const handleConnectSpotify = async () => {
    try {
      const authUrl = await getSpotifyAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Poll for current track if connected
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        fetchCurrentTrack().catch(() => {
          // If fetch fails, we're probably not connected anymore
          setIsConnected(false);
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Simulate progress bar movement for demo when not connected
  useEffect(() => {
    if (isConnected) return; // Don't simulate if actually connected
    
    const interval = setInterval(() => {
      if (isPlaying) {
        setProgress(prev => prev >= 100 ? 0 : prev + 0.5);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          {/* Album Art */}
          <div className="relative mb-8">
            <div className="w-80 h-80 mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={currentSong.albumArt} 
                alt={currentSong.album}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating controls indicator */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <span className="text-white/80 text-sm font-medium">
                  {isConnected ? "Live from Spotify" : "Demo Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Song Info */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {currentSong.title}
            </h1>
            <p className="text-xl text-white/70 mb-1">{currentSong.artist}</p>
            <p className="text-lg text-white/50">{currentSong.album}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-white/60 text-sm mb-2">
              <span>{currentSong.currentTime}</span>
              <span>{currentSong.duration}</span>
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
              onClick={() => setIsPlaying(!isPlaying)}
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

        {/* Spotify Connect Info */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            {isConnected 
              ? "Showing live music from your Spotify account" 
              : "Connect your Spotify account to show your real-time music to visitors"
            }
          </p>
          {!isConnected && (
            <button 
              onClick={handleConnectSpotify}
              className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition-colors"
            >
              Connect Your Spotify
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
