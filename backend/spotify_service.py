from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import spotipy
from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for all domains
ALLOWED_ORIGINS = [
    "https://www.gillan.in",
    "https://spotify-tunes-now.onrender.com",
    "https://spotify-tunes-now-git-main-gillans-projects.vercel.app",
    "http://localhost:3000",  # For local development
    "http://localhost:5173",   # Vite default port
    "http://127.0.0.1:3000",   # Alternative localhost
    "http://127.0.0.1:5173",   # Alternative Vite port
    "https://spotify-tunes-now.vercel.app"  # Vercel deployment URL
]

# Add custom domain if not already in the list
custom_domain = os.getenv('CUSTOM_DOMAIN')
if custom_domain and custom_domain not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(custom_domain)
    ALLOWED_ORIGINS.append(f"https://{custom_domain}")
    ALLOWED_ORIGINS.append(f"http://{custom_domain}")

# Enable CORS with more permissive settings for development
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*" if os.getenv('FLASK_ENV') == 'development' else ALLOWED_ORIGINS,
            "methods": ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type"],
            "supports_credentials": True
        }
    },
    supports_credentials=True
)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 
                        '*' if os.getenv('FLASK_ENV') == 'development' else ','.join(ALLOWED_ORIGINS))
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Load environment variables
load_dotenv()

def get_spotify_client():
    """Initialize and return an authenticated Spotify client using OAuth tokens.
    
    Returns:
        spotipy.Spotify: An authenticated Spotify client instance.
        
    Raises:
        ValueError: If required environment variables are missing.
    """
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    access_token = os.getenv('SPOTIFY_ACCESS_TOKEN')
    refresh_token = os.getenv('SPOTIFY_REFRESH_TOKEN')
    expires_at = float(os.getenv('SPOTIFY_TOKEN_EXPIRES_AT', '0'))
    
    if not all([client_id, client_secret, access_token, refresh_token]):
        raise ValueError("Missing required Spotify API credentials. Please run auth_spotify.py first.")
    
    # Check if token needs refreshing
    if time.time() > expires_at - 60:  # Refresh if less than 1 minute until expiration
        auth_manager = SpotifyOAuth(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8888/callback'),
            scope='user-read-currently-playing user-read-playback-state',
            cache_path=None
        )
        
        # Create a new token info dict with refresh token
        token_info = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': expires_at,
            'scope': os.getenv('SPOTIFY_TOKEN_SCOPE', '')
        }
        
        # Refresh the token if needed
        if time.time() > expires_at - 60:  # If token is expired or about to expire
            token_info = auth_manager.refresh_access_token(refresh_token)
            
            # Save the new tokens to .env
            from auth_spotify import save_tokens_to_env
            save_tokens_to_env(token_info)
            
        return spotipy.Spotify(auth_manager=auth_manager)
    
    # If token is still valid, use it directly
    return spotipy.Spotify(auth=access_token)

@app.route('/')
def home():
    """Health check endpoint."""
    response = jsonify({
        "status": "Server is running",
        "documentation": "https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback"
    })
    
    # Add CORS headers
    request_origin = request.headers.get('Origin')
    if request_origin and request_origin in [
        'https://www.gillan.in',
        'https://spotify-tunes-now.onrender.com',
        'https://spotify-tunes-now-git-main-gillans-projects.vercel.app'
    ]:
        response.headers.add('Access-Control-Allow-Origin', request_origin)
    
    return response

@app.route('/api/current-track')
def get_current_track():
    """Get the currently playing track from Spotify.
    
    Note: This endpoint now uses application-level authentication and doesn't require user interaction.
    
    Returns:
        JSON: Track information or error message with appropriate status code.
    """
    try:
        sp = get_spotify_client()
        
        # Get the currently playing track
        current = sp.current_playback()
        
        if not current or 'item' not in current:
            return jsonify({
                'is_playing': False,
                'message': 'No track currently playing or no active device found'
            }), 200
        
        track = current['item']
        response_data = {
            'is_playing': current.get('is_playing', False),
            'track': {
                'id': track.get('id'),
                'name': track.get('name', ''),
                'artists': [artist.get('name', '') for artist in track.get('artists', [])],
                'album': track.get('album', {}).get('name', ''),
                'album_art': track.get('album', {}).get('images', [{}])[0].get('url') if track.get('album', {}).get('images') else None,
                'duration_ms': track.get('duration_ms', 0),
                'progress_ms': current.get('progress_ms', 0)
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"Error in get_current_track: {str(e)}")
        return jsonify({
            'error': 'Unable to fetch current track',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)