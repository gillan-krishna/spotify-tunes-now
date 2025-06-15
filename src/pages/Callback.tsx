
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens } from '@/services/spotifyAuth';
import { useToast } from '@/hooks/use-toast';

const Callback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        toast({
          title: "Authorization Failed",
          description: "Spotify authorization was cancelled or failed.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      if (code) {
        try {
          await exchangeCodeForTokens(code);
          toast({
            title: "Success!",
            description: "Spotify connected successfully!"
          });
          navigate('/');
        } catch (error) {
          console.error('Error exchanging code:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to connect to Spotify. Please try again.",
            variant: "destructive"
          });
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default Callback;
