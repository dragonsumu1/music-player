const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const musicDir = path.join(__dirname, 'music');
const profilesFile = path.join(__dirname, 'profiles.json');

// Middleware to parse JSON bodies
app.use(express.json());

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

// Get user profile
app.get('/api/profile/:username', (req, res) => {
  const username = req.params.username;
  fs.readFile(profilesFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read profiles file:', err);
      return res.status(500).json({ error: 'Failed to read profiles file' });
    }
    const profiles = JSON.parse(data);
    const profile = profiles[username];
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  });
});

// Create or update user profile
app.post('/api/profile/:username', (req, res) => {
  const username = req.params.username;
  const { playlist } = req.body;

  console.log(`Saving profile for ${username}:`, req.body);

  fs.readFile(profilesFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read profiles file:', err);
      return res.status(500).json({ error: 'Failed to read profiles file' });
    }

    const profiles = JSON.parse(data);
    profiles[username] = { playlist };

    fs.writeFile(profilesFile, JSON.stringify(profiles, null, 2), (err) => {
      if (err) {
        console.error('Failed to write profiles file:', err);
        return res.status(500).json({ error: 'Failed to write profiles file' });
      }
      res.json({ message: 'Profile saved', playlist: profiles[username].playlist });
    });
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


