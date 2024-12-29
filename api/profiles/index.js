const fs = require('fs');
const path = require('path');

const profilesFile = path.join(__dirname, '../../profiles.json');

export default function handler(req, res) {
  res.status(405).json({ error: 'Method not allowed' });
}
