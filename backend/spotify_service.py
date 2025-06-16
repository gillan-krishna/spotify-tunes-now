from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import threading
import time
from auth_spotify import authenticate_spotify

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

def check_authentication():
    if not os.path.exists('.cache'):
        print("No authentication found. Running authentication process...")
        if not authenticate_spotify():
            print("Authentication failed. Please check your credentials and try again.")
            return False
    return True

def get_spotify_client():
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    # Use the deployed URL for production, localhost for development
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'https://spotify-tunes-now.onrender.com/callback')
    
    if not client_id or not client_secret:
        raise ValueError("Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file")

    auth_manager = SpotifyOAuth(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
        scope='user-read-currently-playing user-read-playback-state',
        open_browser=False,
        cache_path='.cache'
    )

    return spotipy.Spotify(auth_manager=auth_manager)

@app.route('/')
def home():
    return jsonify({"status": "Server is running"})

@app.route('/callback')
def callback():
    return jsonify({"status": "Callback received"})

@app.route('/api/current-track')
def get_current_track():
    try:
        sp = get_spotify_client()
        current_track = sp.current_playback()
        
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
    except Exception as e:
        print(f"Error in get_current_track: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    if check_authentication():
        print("Starting Flask server...")
        print("Server will be available at http://127.0.0.1:5000")
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        print("Server startup aborted due to authentication failure.") 