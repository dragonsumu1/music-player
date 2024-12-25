const path = require('path');
const fs = require('fs');

export default function handler(req, res) {
  const { song } = req.query;
  const musicDir = path.join(process.cwd(), 'music');
  const songPath = path.join(musicDir, song);

  fs.access(songPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Song not found: ${songPath}`);
      return res.status(404).send('Song not found');
    }

    res.sendFile(songPath);
  });
}
