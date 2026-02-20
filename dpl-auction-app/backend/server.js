const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const auctionRouter = require('./routes/auction');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use(cors());
app.use(express.json());

// Pass io to routes
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/auction', auctionRouter);

const AUCTION_FILE = path.join(__dirname, 'data/auction.json');
const TEAMS_FILE = path.join(__dirname, 'data/teams.json');

const sanitizeTeam = (team) => { const { password, ...rest } = team; return rest; };

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  try {
    const auctionData = JSON.parse(fs.readFileSync(AUCTION_FILE, 'utf8'));
    const teamsData = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf8'));
    socket.emit('auction:state', auctionData);
    socket.emit('teams:update', teamsData.map(sanitizeTeam));
  } catch (e) {
    console.error('Error sending initial state:', e.message);
  }

  socket.on('bid:place', (data) => {
    try {
      const auction = JSON.parse(fs.readFileSync(AUCTION_FILE, 'utf8'));
      const teams = JSON.parse(fs.readFileSync(TEAMS_FILE, 'utf8'));
      const team = teams.find(t => t.id === data.teamId);

      if (!auction.currentPlayer || auction.status !== 'active') {
        socket.emit('bid:error', { message: 'Auction not active' });
        return;
      }
      if (auction.currentPlayer.id !== data.playerId) {
        socket.emit('bid:error', { message: 'Invalid player' });
        return;
      }

      const minBid = (auction.currentBid || (auction.currentPlayer.basePrice - 10000)) + 10000;
      if (data.amount < minBid) {
        socket.emit('bid:error', { message: `Minimum bid is \u20b9${minBid.toLocaleString('en-IN')}` });
        return;
      }
      if (!team || team.remainingBudget < data.amount) {
        socket.emit('bid:error', { message: 'Insufficient budget' });
        return;
      }

      const player = auction.currentPlayer;
      if (player.gender === 'male' && team.maleCount >= 5) {
        socket.emit('bid:error', { message: 'Male squad is full (max 5)' });
        return;
      }
      if (player.gender === 'female' && team.femaleCount >= 2) {
        socket.emit('bid:error', { message: 'Female squad is full (max 2)' });
        return;
      }

      auction.currentBid = data.amount;
      auction.currentBidder = { id: team.id, name: team.name };
      auction.bidHistory.unshift({
        teamId: team.id,
        teamName: team.name,
        amount: data.amount,
        timestamp: new Date().toISOString()
      });
      if (auction.bidHistory.length > 10) auction.bidHistory = auction.bidHistory.slice(0, 10);

      fs.writeFileSync(AUCTION_FILE, JSON.stringify(auction, null, 2));

      io.emit('bid:update', auction);
      io.emit('auction:state', auction);
    } catch (e) {
      socket.emit('bid:error', { message: 'Failed to place bid: ' + e.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`DPL Auction Server running on port ${PORT}`));
