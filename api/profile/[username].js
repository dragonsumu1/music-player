const fs = require('fs');
const path = require('path');

const profilesFile = path.join(__dirname, '../../profiles.json');

export default function handler(req, res) {
  const { username } = req.query;

  if (req.method === 'GET') {
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
  } else if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
