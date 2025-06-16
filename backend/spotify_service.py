from flask import Flask, jsonify
from flask_cors import CORS
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

def get_spotify_client():
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8888/callback')
    
    if not client_id or not client_secret:
        raise ValueError("Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file")

    auth_manager = SpotifyOAuth(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
        scope='user-read-currently-playing user-read-playback-state',
        open_browser=False,  # Don't open browser for authentication
        cache_path='.cache'
    )

    # Check if we have cached credentials
    cached_token = auth_manager.get_cached_token()
    if not cached_token:
        raise ValueError("No cached credentials found. Please run auth_spotify.py first to authenticate.")
    print(f"[DEBUG] Cached token found: {cached_token['access_token'][:10]}...")

    return spotipy.Spotify(auth_manager=auth_manager)

@app.route('/')
def home():
    return jsonify({"status": "Server is running"})

@app.route('/api/current-track')
def get_current_track():
    try:
        sp = get_spotify_client()
        current_track = sp.current_playback()
        print(f"[DEBUG] Raw Spotify current_playback response: {current_track}")
        
        if current_track is None:
            return jsonify({
                'is_playing': False,
                'message': 'No track currently playing'
            })
        
        track = current_track['item']
        return jsonify({
            'is_playing': current_track['is_playing'],
            'track': {
                'title': track['name'],
                'artist': track['artists'][0]['name'],
                'album': track['album']['name'],
                'album_art': track['album']['images'][0]['url'] if track['album']['images'] else None,
                'duration_ms': track['duration_ms'],
                'progress_ms': current_track['progress_ms']
            }
        })
    except ValueError as ve:
        return jsonify({
            'error': str(ve)
        }), 401
    except Exception as e:
        print(f"Error in get_current_track: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Server will be available at http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True) 