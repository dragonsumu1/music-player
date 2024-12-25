const https = require('https');

export default function handler(req, res) {
  const { song } = req.query;
  const githubRawUrl = `https://raw.githubusercontent.com/your-username/your-repo/main/music/${song}`;

  https.get(githubRawUrl, (response) => {
    if (response.statusCode === 200) {
      res.setHeader('Content-Type', 'audio/mpeg');
      response.pipe(res);
    } else {
      res.status(response.statusCode).send('Song not found');
    }
  }).on('error', (err) => {
    console.error(`Error fetching song: ${err.message}`);
    res.status(500).send('Internal Server Error');
  });
}
