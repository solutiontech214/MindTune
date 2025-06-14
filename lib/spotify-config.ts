
// Spotify API Configuration
// For production, these should be environment variables

export const SPOTIFY_CONFIG = {
  // Replace these with your actual Spotify App credentials
  // Get them from: https://developer.spotify.com/dashboard
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || 'demo_client_id',
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || 'demo_client_secret',
  
  // Demo mode settings
  USE_DEMO_MODE: true, // Set to false when you have real credentials
  
  // Fallback audio URLs for demo
  DEMO_AUDIO_SOURCES: [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-06.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-07.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-08.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav'
  ]
}

// Instructions for setting up real Spotify integration:
/*
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Copy your Client ID and Client Secret
4. Add them to your environment variables:
   - SPOTIFY_CLIENT_ID=your_client_id
   - SPOTIFY_CLIENT_SECRET=your_client_secret
5. Set USE_DEMO_MODE to false
*/
