const https = require('https');

export default function handler(req, res) {
  const githubApiUrl = 'https://api.github.com/repos/dragonsumu1/music-player/contents/music';
  const options = {
    headers: {
      'User-Agent': 'request'
    }
  };

  https.get(githubApiUrl, options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      if (response.statusCode === 200) {
        const files = JSON.parse(data);
        const songs = files.filter(file => file.name.endsWith('.mp3')).map(file => file.name);
        res.json(songs);
      } else {
        res.status(response.statusCode).json({ error: 'Failed to fetch songs from GitHub' });
      }
    });
  }).on('error', (err) => {
    console.error(`Error fetching songs: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  });
}
