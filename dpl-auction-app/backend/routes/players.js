const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PLAYERS_FILE = path.join(__dirname, '../data/players.json');

const readPlayers = () => {
  try {
    return JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writePlayers = (data) => {
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(data, null, 2));
};

// GET all players
router.get('/', (req, res) => {
  try {
    const players = readPlayers();
    res.json(players);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read players' });
  }
});

// POST add single player
router.post('/', (req, res) => {
  try {
    const { name, gender, basePrice } = req.body;
    if (!name || !gender) {
      return res.status(400).json({ error: 'Name and gender are required' });
    }
    if (!['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({ error: 'Gender must be male or female' });
    }
    const players = readPlayers();
    const newPlayer = {
      id: uuidv4(),
      name: name.trim(),
      gender: gender.toLowerCase(),
      basePrice: basePrice || 100000,
      status: 'available',
      soldTo: null,
      soldPrice: null
    };
    players.push(newPlayer);
    writePlayers(players);
    if (req.io) req.io.emit('players:update', players);
    res.status(201).json(newPlayer);
  } catch (e) {
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// POST bulk add players
router.post('/bulk', (req, res) => {
  try {
    const { players: newPlayers } = req.body;
    if (!Array.isArray(newPlayers) || newPlayers.length === 0) {
      return res.status(400).json({ error: 'Players array is required' });
    }
    const players = readPlayers();
    const added = [];
    for (const p of newPlayers) {
      if (!p.name || !p.gender) continue;
      if (!['male', 'female'].includes(p.gender.toLowerCase())) continue;
      const newPlayer = {
        id: uuidv4(),
        name: p.name.trim(),
        gender: p.gender.toLowerCase(),
        basePrice: p.basePrice || 100000,
        status: 'available',
        soldTo: null,
        soldPrice: null
      };
      players.push(newPlayer);
      added.push(newPlayer);
    }
    writePlayers(players);
    if (req.io) req.io.emit('players:update', players);
    res.status(201).json({ added: added.length, players: added });
  } catch (e) {
    res.status(500).json({ error: 'Failed to bulk add players' });
  }
});

// PUT update player
router.put('/:id', (req, res) => {
  try {
    const players = readPlayers();
    const idx = players.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Player not found' });
    players[idx] = { ...players[idx], ...req.body, id: players[idx].id };
    writePlayers(players);
    if (req.io) req.io.emit('players:update', players);
    res.json(players[idx]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE player
router.delete('/:id', (req, res) => {
  try {
    const players = readPlayers();
    const idx = players.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Player not found' });
    players.splice(idx, 1);
    writePlayers(players);
    if (req.io) req.io.emit('players:update', players);
    res.json({ message: 'Player deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
