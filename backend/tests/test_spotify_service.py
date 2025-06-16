import os
import pytest
import json
from spotify_service import get_spotify_client

class TestSpotifyService:
    """Test Spotify service functionality."""

    def test_get_current_track_success(self, client, mock_spotify_client, mocker):
        """Test successful retrieval of current track."""
        # Mock the Spotify client
        mocker.patch('spotify_service.get_spotify_client', return_value=mock_spotify_client)
        
        # Make request to the endpoint
        response = client.get('/api/current-track')
        data = json.loads(response.data)
        
        # Assertions
        assert response.status_code == 200
        assert data['is_playing'] is True
        assert data['track']['name'] == 'Test Song'
        assert data['track']['artists'] == ['Test Artist']
        assert data['track']['album'] == 'Test Album'
        assert data['track']['album_art'] == 'http://test.com/image.jpg'
        assert data['track']['duration_ms'] == 200000
        assert data['track']['progress_ms'] == 100000

    def test_get_current_track_not_playing(self, client, mock_spotify_client, mocker):
        """Test when no track is currently playing."""
        # Mock the Spotify client to return no current playback
        mock_spotify_client.current_playback.return_value = None
        mocker.patch('spotify_service.get_spotify_client', return_value=mock_spotify_client)
        
        # Make request to the endpoint
        response = client.get('/api/current-track')
        data = json.loads(response.data)
        
        # Assertions
        assert response.status_code == 200
        assert data['is_playing'] is False
        assert 'message' in data
        assert 'No track currently playing' in data['message']

    def test_health_check(self, client):
        """Test the health check endpoint."""
        response = client.get('/')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['status'] == 'Server is running'
        assert 'documentation' in data

class TestSpotifyClient:
    """Test Spotify client functionality."""
    
    @pytest.mark.skipif(
        not all([os.getenv('SPOTIFY_CLIENT_ID'), os.getenv('SPOTIFY_CLIENT_SECRET')]),
        reason="Spotify credentials not set in environment"
    )
    def test_get_spotify_client_integration(self):
        """Integration test for Spotify client (requires valid credentials)."""
        # This test will only run if Spotify credentials are set
        client = get_spotify_client()
        assert client is not None
        
        # Try to get current playback (may be None if nothing is playing)
        current = client.current_playback()
        assert current is None or 'item' in current
