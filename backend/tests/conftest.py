import pytest
from spotify_service import app as flask_app
import os
from dotenv import load_dotenv

# Load test environment variables
load_dotenv(dotenv_path='.env.test')

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    flask_app.config['TESTING'] = True
    yield flask_app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def mock_spotify_client(mocker):
    """Create a mock Spotify client."""
    mock_client = mocker.MagicMock()
    mock_current = {
        'is_playing': True,
        'item': {
            'id': 'test123',
            'name': 'Test Song',
            'artists': [{'name': 'Test Artist'}],
            'album': {'name': 'Test Album', 'images': [{'url': 'http://test.com/image.jpg'}]},
            'duration_ms': 200000,
        },
        'progress_ms': 100000
    }
    mock_client.current_playback.return_value = mock_current
    return mock_client
