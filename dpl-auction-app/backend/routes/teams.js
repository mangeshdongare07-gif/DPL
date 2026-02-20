const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const TEAMS_FILE = path.join(__dirname, '../data/teams.json');

const readTeams = () => {
  try {
    return JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeTeams = (data) => {
  fs.writeFileSync(TEAMS_FILE, JSON.stringify(data, null, 2));
};

const sanitizeTeam = (team) => {
  const { password, ...rest } = team;
  return rest;
};

// GET all teams (no passwords)
router.get('/', (req, res) => {
  try {
    const teams = readTeams();
    res.json(teams.map(sanitizeTeam));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read teams' });
  }
});

// GET single team
router.get('/:id', (req, res) => {
  try {
    const teams = readTeams();
    const team = teams.find(t => t.id === req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(sanitizeTeam(team));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read team' });
  }
});

// POST login
router.post('/login', (req, res) => {
  try {
    const { teamId, password } = req.body;
    if (!teamId || !password) {
      return res.status(400).json({ error: 'teamId and password are required' });
    }
    const teams = readTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.password !== password) return res.status(401).json({ error: 'Invalid password' });
    res.json({ success: true, team: sanitizeTeam(team) });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST create team
router.post('/', (req, res) => {
  try {
    const { name, budget, password } = req.body;
    if (!name) return res.status(400).json({ error: 'Team name is required' });
    const teams = readTeams();
    const newTeam = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      budget: budget || 10000000,
      remainingBudget: budget || 10000000,
      players: [],
      maleCount: 0,
      femaleCount: 0,
      password: password || 'team123'
    };
    teams.push(newTeam);
    writeTeams(teams);
    if (req.io) req.io.emit('teams:update', teams.map(sanitizeTeam));
    res.status(201).json(sanitizeTeam(newTeam));
  } catch (e) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

module.exports = router;
