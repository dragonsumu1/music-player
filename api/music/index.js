const path = require('path');
const fs = require('fs');

export default function handler(req, res) {
  const musicDir = path.join(process.cwd(), 'music');

  fs.readdir(musicDir, (err, files) => {
    if (err) {
      console.error('Failed to read music directory:', err);
      return res.status(500).json({ error: 'Failed to read music directory' });
    }
    const songs = files.filter(file => path.extname(file) === '.mp3');
    res.json(songs);
  });
}
