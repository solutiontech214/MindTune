// Replit backend route (e.g., Express or built-in HTTP server)
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

const CLIENT_ID = '021525f6033a4000930ce7cfda86e283';
const CLIENT_SECRET = '28af6887f55845e98d20167cb2aaabc5';

app.get('/api/token', async (req, res) => {
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  res.json(data); // send token to frontend
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
