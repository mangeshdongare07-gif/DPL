const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const AUCTION_FILE = path.join(__dirname, '../data/auction.json');
const PLAYERS_FILE = path.join(__dirname, '../data/players.json');
const TEAMS_FILE = path.join(__dirname, '../data/teams.json');

const readAuction = () => JSON.parse(fs.readFileSync(AUCTION_FILE, 'utf8'));
const writeAuction = (data) => fs.writeFileSync(AUCTION_FILE, JSON.stringify(data, null, 2));
const readPlayers = () => JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
const writePlayers = (data) => fs.writeFileSync(PLAYERS_FILE, JSON.stringify(data, null, 2));
const readTeams = () => JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf8'));
const writeTeams = (data) => fs.writeFileSync(TEAMS_FILE, JSON.stringify(data, null, 2));
const sanitizeTeam = (team) => { const { password, ...rest } = team; return rest; };

// GET auction state
router.get('/state', (req, res) => {
  try {
    res.json(readAuction());
  } catch (e) {
    res.status(500).json({ error: 'Failed to read auction state' });
  }
});

// POST start auction
router.post('/start', (req, res) => {
  try {
    const players = readPlayers();
    const available = players.filter(p => p.status === 'available');
    if (available.length === 0) return res.status(400).json({ error: 'No available players' });
    const auction = readAuction();
    const firstPlayer = available[0];
    auction.status = 'active';
    auction.currentPlayer = firstPlayer;
    auction.currentBid = null;
    auction.currentBidder = null;
    auction.bidHistory = [];
    auction.currentPlayerIndex = players.findIndex(p => p.id === firstPlayer.id);
    writeAuction(auction);
    if (req.io) {
      req.io.emit('auction:state', auction);
      req.io.emit('auction:started', auction);
    }
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: 'Failed to start auction' });
  }
});

// POST next player
router.post('/next-player', (req, res) => {
  try {
    const players = readPlayers();
    const auction = readAuction();
    const available = players.filter(p => p.status === 'available');
    if (available.length === 0) {
      auction.status = 'completed';
      auction.currentPlayer = null;
      writeAuction(auction);
      if (req.io) req.io.emit('auction:state', auction);
      return res.json({ message: 'Auction completed', auction });
    }
    const nextPlayer = available[0];
    auction.currentPlayer = nextPlayer;
    auction.currentBid = null;
    auction.currentBidder = null;
    auction.bidHistory = [];
    auction.currentPlayerIndex = players.findIndex(p => p.id === nextPlayer.id);
    auction.status = 'active';
    writeAuction(auction);
    if (req.io) req.io.emit('auction:state', auction);
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: 'Failed to move to next player' });
  }
});

// POST pause
router.post('/pause', (req, res) => {
  try {
    const auction = readAuction();
    auction.status = 'paused';
    writeAuction(auction);
    if (req.io) req.io.emit('auction:state', auction);
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: 'Failed to pause auction' });
  }
});

// POST resume
router.post('/resume', (req, res) => {
  try {
    const auction = readAuction();
    auction.status = 'active';
    writeAuction(auction);
    if (req.io) req.io.emit('auction:state', auction);
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: 'Failed to resume auction' });
  }
});

// POST sell player
router.post('/sell-player', (req, res) => {
  try {
    const auction = readAuction();
    if (!auction.currentPlayer) return res.status(400).json({ error: 'No current player' });
    if (!auction.currentBidder) return res.status(400).json({ error: 'No current bidder' });
    const players = readPlayers();
    const teams = readTeams();
    const playerIdx = players.findIndex(p => p.id === auction.currentPlayer.id);
    const teamIdx = teams.findIndex(t => t.id === auction.currentBidder.id);
    if (playerIdx === -1) return res.status(404).json({ error: 'Player not found' });
    if (teamIdx === -1) return res.status(404).json({ error: 'Team not found' });
    const soldPrice = auction.currentBid;
    players[playerIdx].status = 'sold';
    players[playerIdx].soldTo = auction.currentBidder.id;
    players[playerIdx].soldPrice = soldPrice;
    teams[teamIdx].remainingBudget -= soldPrice;
    teams[teamIdx].players.push({ ...players[playerIdx] });
    if (players[playerIdx].gender === 'male') teams[teamIdx].maleCount++;
    else teams[teamIdx].femaleCount++;
    writePlayers(players);
    writeTeams(teams);
    const soldInfo = {
      player: players[playerIdx],
      team: sanitizeTeam(teams[teamIdx]),
      price: soldPrice
    };
    auction.currentPlayer = null;
    auction.currentBid = null;
    auction.currentBidder = null;
    auction.bidHistory = [];
    auction.status = 'idle';
    writeAuction(auction);
    if (req.io) {
      req.io.emit('player:sold', soldInfo);
      req.io.emit('auction:state', auction);
      req.io.emit('teams:update', teams.map(sanitizeTeam));
      req.io.emit('players:update', players);
    }
    res.json(soldInfo);
  } catch (e) {
    res.status(500).json({ error: 'Failed to sell player: ' + e.message });
  }
});

// POST mark unsold
router.post('/mark-unsold', (req, res) => {
  try {
    const auction = readAuction();
    if (!auction.currentPlayer) return res.status(400).json({ error: 'No current player' });
    const players = readPlayers();
    const playerIdx = players.findIndex(p => p.id === auction.currentPlayer.id);
    if (playerIdx !== -1) {
      players[playerIdx].status = 'unsold';
      writePlayers(players);
    }
    auction.currentPlayer = null;
    auction.currentBid = null;
    auction.currentBidder = null;
    auction.bidHistory = [];
    auction.status = 'idle';
    writeAuction(auction);
    if (req.io) {
      req.io.emit('auction:state', auction);
      req.io.emit('players:update', players);
    }
    res.json({ message: 'Player marked unsold', auction });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark player unsold' });
  }
});

// POST manual bid (admin override)
router.post('/manual-bid', (req, res) => {
  try {
    const { teamId, amount } = req.body;
    const auction = readAuction();
    const teams = readTeams();
    if (!auction.currentPlayer) return res.status(400).json({ error: 'No current player' });
    const team = teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    auction.currentBid = Number(amount);
    auction.currentBidder = { id: team.id, name: team.name };
    auction.bidHistory.unshift({
      teamId: team.id,
      teamName: team.name,
      amount: Number(amount),
      timestamp: new Date().toISOString()
    });
    if (auction.bidHistory.length > 10) auction.bidHistory = auction.bidHistory.slice(0, 10);
    writeAuction(auction);
    if (req.io) req.io.emit('auction:state', auction);
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: 'Failed to place manual bid' });
  }
});

// POST reset auction
router.post('/reset', (req, res) => {
  try {
    const players = readPlayers();
    const teams = readTeams();
    // Reset all players to available
    players.forEach(p => {
      p.status = 'available';
      p.soldTo = null;
      p.soldPrice = null;
    });
    // Reset all teams
    teams.forEach(t => {
      t.remainingBudget = t.budget;
      t.players = [];
      t.maleCount = 0;
      t.femaleCount = 0;
    });
    writePlayers(players);
    writeTeams(teams);
    const auction = {
      status: 'idle',
      currentPlayer: null,
      currentBid: null,
      currentBidder: null,
      bidHistory: [],
      currentPlayerIndex: -1
    };
    writeAuction(auction);
    if (req.io) {
      req.io.emit('auction:state', auction);
      req.io.emit('teams:update', teams.map(t => { const { password, ...rest } = t; return rest; }));
      req.io.emit('players:update', players);
    }
    res.json({ message: 'Auction reset successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reset auction' });
  }
});

module.exports = router;
