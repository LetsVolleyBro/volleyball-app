const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./volleyball.db', (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      players INTEGER DEFAULT 0,
      maxPlayers INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      creatorId TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Create matches table error:', err);
    else console.log('Matches table ready');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      deviceId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Create users table error:', err);
    else console.log('Users table ready');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS match_players (
      id TEXT PRIMARY KEY,
      matchId TEXT NOT NULL,
      userId TEXT NOT NULL,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (matchId) REFERENCES matches(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Create match_players table error:', err);
    else console.log('Match_players table ready');
  });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get all matches
app.get('/api/matches', (req, res) => {
  db.all(`
    SELECT m.*, COUNT(mp.userId) as currentPlayers
    FROM matches m
    LEFT JOIN match_players mp ON m.id = mp.matchId
    GROUP BY m.id
    ORDER BY m.createdAt DESC
  `, (err, rows) => {
    if (err) {
      console.error('Get matches error:', err);
      res.status(500).json({ error: 'Failed to fetch matches' });
    } else {
      res.json(rows || []);
    }
  });
});

// Get single match
app.get('/api/matches/:id', (req, res) => {
  const { id } = req.params;
  db.get(`
    SELECT m.*, COUNT(mp.userId) as currentPlayers
    FROM matches m
    LEFT JOIN match_players mp ON m.id = mp.matchId
    WHERE m.id = ?
    GROUP BY m.id
  `, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch match' });
    } else if (!row) {
      res.status(404).json({ error: 'Match not found' });
    } else {
      res.json(row);
    }
  });
});

// Create match
app.post('/api/matches', (req, res) => {
  const { name, location, lat, lng, time, date, maxPlayers, creatorId } = req.body;
  
  if (!name || !location || !time || !date || !creatorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuidv4();
  db.run(
    `INSERT INTO matches (id, name, location, lat, lng, time, date, maxPlayers, creatorId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, location, lat, lng, time, date, maxPlayers, creatorId],
    function(err) {
      if (err) {
        console.error('Create match error:', err);
        res.status(500).json({ error: 'Failed to create match' });
      } else {
        res.status(201).json({ id, message: 'Match created successfully' });
      }
    }
  );
});

// Join match
app.post('/api/matches/:matchId/join', (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  const id = uuidv4();
  db.run(
    `INSERT INTO match_players (id, matchId, userId) VALUES (?, ?, ?)`,
    [id, matchId, userId],
    function(err) {
      if (err) {
        console.error('Join match error:', err);
        res.status(500).json({ error: 'Failed to join match' });
      } else {
        res.status(201).json({ id, message: 'Joined match successfully' });
      }
    }
  );
});

// Leave match
app.post('/api/matches/:matchId/leave', (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.body;

  db.run(
    `DELETE FROM match_players WHERE matchId = ? AND userId = ?`,
    [matchId, userId],
    function(err) {
      if (err) {
        console.error('Leave match error:', err);
        res.status(500).json({ error: 'Failed to leave match' });
      } else {
        res.json({ message: 'Left match successfully' });
      }
    }
  );
});

// Get or create user
app.post('/api/users', (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId required' });
  }

  // Check if user exists
  db.get(`SELECT id FROM users WHERE deviceId = ?`, [deviceId], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    } else if (row) {
      res.json({ id: row.id, message: 'User found' });
    } else {
      // Create new user
      const id = uuidv4();
      db.run(
        `INSERT INTO users (id, deviceId) VALUES (?, ?)`,
        [id, deviceId],
        function(err) {
          if (err) {
            console.error('Create user error:', err);
            res.status(500).json({ error: 'Failed to create user' });
          } else {
            res.status(201).json({ id, message: 'User created' });
          }
        }
      );
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏐 Volley Rio backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
