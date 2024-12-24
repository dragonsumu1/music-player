const express = require('express');
const path = require('path');
const fs = require('fs'); // Correct the import statement

const app = express();
const PORT = 3000;
const musicDir = path.join(__dirname, 'music');

// Serve static files like CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Serve music files
app.get('/music/:song', (req, res) => {
  const song = req.params.song;
  const songPath = path.join(musicDir, song);
  
  fs.access(songPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Song not found');
    }

    res.sendFile(songPath);
  });
});

// Serve the list of songs in the "music" folder
app.get('/music', (req, res) => {
  fs.readdir(musicDir, (err, files) => {
    if (err) {
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

module.exports = app;
