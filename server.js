const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const musicDir = path.join(__dirname, 'music');

// Serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Serve music files
app.get('/api/music/:song', (req, res) => {
  const song = req.params.song;
  const songPath = path.join(musicDir, song);
  
  fs.access(songPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Song not found: ${songPath}`);
      return res.status(404).send('Song not found');
    }

    res.sendFile(songPath);
  });
});

// Serve the list of songs in the "music" folder
app.get('/api/music', (req, res) => {
  fs.readdir(musicDir, (err, files) => {
    if (err) {
      console.error('Failed to read music directory:', err);
      return res.status(500).json({ error: 'Failed to read music directory' });
    }
    const songs = files.filter(file => path.extname(file) === '.mp3');
    res.json(songs);
  });
});

// Serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
