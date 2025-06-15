
import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat } from 'lucide-react';

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45);
  const [isLiked, setIsLiked] = useState(false);

  // Mock song data - in a real app, this would come from Spotify API
  const currentSong = {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273ef5e8e20bf3c1e8a7a5e3c5a",
    duration: "3:20",
    currentTime: "1:32"
  };

  // Simulate progress bar movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setProgress(prev => prev >= 100 ? 0 : prev + 0.5);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

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
                <span className="text-white/80 text-sm font-medium">Now Playing</span>
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
            Connect your Spotify account to see your real-time music
          </p>
          <button className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition-colors">
            Connect Spotify
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
