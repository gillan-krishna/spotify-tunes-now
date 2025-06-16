import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

def authenticate_spotify():
    # Load environment variables
    load_dotenv()
    
    # Get credentials from environment variables
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8888/callback')
    
    if not client_id or not client_secret:
        print("Error: Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file")
        return False

    print("\n=== Spotify Authentication ===")
    print("This script will authenticate your Spotify account and save the credentials.")
    print("You only need to do this once.\n")

    try:
        # Initialize Spotify client with authentication
        auth_manager = SpotifyOAuth(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scope='user-read-currently-playing user-read-playback-state',
            open_browser=True,  # This will open the browser for authentication
            cache_path='.cache'
        )

        # This will trigger the authentication flow
        sp = spotipy.Spotify(auth_manager=auth_manager)
        
        # Test the connection by getting user info
        user = sp.current_user()
        print(f"\nSuccessfully authenticated as: {user['display_name']}")
        print("Credentials have been saved to .cache file")
        print("\nYou can now run the main server with: python spotify_service.py")
        return True

    except Exception as e:
        print(f"\nError during authentication: {str(e)}")
        return False

if __name__ == "__main__":
    authenticate_spotify() 