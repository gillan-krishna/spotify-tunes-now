"""Spotify authentication utility.

This module handles the OAuth2 flow for authenticating with the Spotify API
and saving the authentication tokens to .env file for deployment.
"""
import os
import sys
import json
from pathlib import Path
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv


def get_env_path() -> Path:
    """Get the path to the .env file in the project root."""
    return Path(__file__).parent.parent / '.env'

def save_tokens_to_env(tokens: dict):
    """Save tokens to .env file."""
    env_path = get_env_path()
    env_path.touch(exist_ok=True)  # Create .env if it doesn't exist
    
    # Load existing .env content
    env_vars = {}
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value.strip('\'"')
    
    # Update with new tokens
    env_vars.update({
        'SPOTIFY_ACCESS_TOKEN': tokens.get('access_token', ''),
        'SPOTIFY_REFRESH_TOKEN': tokens.get('refresh_token', ''),
        'SPOTIFY_TOKEN_EXPIRES_AT': str(tokens.get('expires_at', 0)),
        'SPOTIFY_TOKEN_SCOPE': tokens.get('scope', '')
    })
    
    # Write back to .env
    with open(env_path, 'w') as f:
        for key, value in env_vars.items():
            f.write(f'{key}="{value}"\n')

def authenticate_spotify() -> bool:
    """Authenticate with Spotify API and save credentials to .env.
    
    Returns:
        bool: True if authentication was successful, False otherwise.
    """
    env_path = get_env_path()
    load_dotenv(env_path)
    
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:8888/callback')
    
    if not all([client_id, client_secret]):
        print("Error: Missing required Spotify API credentials in .env file")
        print("Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET")
        return False

    print("\n=== Spotify Authentication ===")
    print("This script will authenticate your Spotify account and save the credentials.")
    print("You only need to do this once.\n")

    try:
        # Use in-memory caching
        auth_manager = SpotifyOAuth(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scope='user-read-currently-playing user-read-playback-state',
            open_browser=True,
            cache_path=None,  # Disable file-based caching
            show_dialog=True  # Force approval prompt
        )

        # Trigger authentication flow
        sp = spotipy.Spotify(auth_manager=auth_manager)
        user = sp.current_user()
        
        # Get the tokens from the auth manager
        token_info = auth_manager.get_cached_token()
        if token_info:
            save_tokens_to_env(token_info)
        
        print(f"\n✅ Successfully authenticated as: {user.get('display_name', 'Unknown User')}")
        print("🔑 Credentials have been saved to .env file")
        print("\nYou can now run the main server with: python spotify_service.py")
        return True

    except Exception as e:
        print(f"\n❌ Error during authentication: {str(e)}", file=sys.stderr)
        return False


if __name__ == "__main__":
    sys.exit(0 if authenticate_spotify() else 1)