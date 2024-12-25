const fs = require('fs');
const path = require('path');

const profilesFile = path.join(__dirname, '../../profiles.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    fs.readFile(profilesFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Failed to read profiles file:', err);
        return res.status(500).json({ error: 'Failed to read profiles file' });
      }
      const profiles = JSON.parse(data);
      res.json(profiles);
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
