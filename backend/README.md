# Spotify Tunes Now - Backend

A Flask-based backend service that interfaces with the Spotify Web API to fetch currently playing track information using server-to-server authentication.

## Features

- Server-to-server authentication with Spotify (no user interaction required)
- CORS support for multiple domains
- Error handling and logging
- Simple REST API

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/spotify-tunes-now.git
   cd spotify-tunes-now/backend
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Create a `.env` file in the backend directory with:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

## Running the Server

```bash
python spotify_service.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

- `GET /` - Health check
- `GET /api/current-track` - Get currently playing track information (returns 200 with `is_playing: false` if no track is playing)

## Deployment

### Vercel

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Run `vercel` and follow the prompts
3. Set environment variables in Vercel dashboard

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn spotify_service:app`
   - Environment Variables: Add all from `.env`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SPOTIFY_CLIENT_ID | Spotify API Client ID | Yes |
| SPOTIFY_CLIENT_SECRET | Spotify API Client Secret | Yes |

## Important Notes

1. **Spotify Developer Dashboard Setup**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Add the following redirect URIs to your app's settings:
     - `https://www.gillan.in/api/callback`
     - `https://spotify-tunes-now.onrender.com/api/callback`
     - `https://spotify-tunes-now-git-main-gillans-projects.vercel.app/api/callback`
     - `http://localhost:3000/api/callback` (for development)

2. **Rate Limiting**: Be aware of Spotify's API rate limits. This implementation doesn't include rate limiting.

## License

MIT
