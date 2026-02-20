# DPL Player Auction App

A real-time player auction application for DPL (Dynamic Premier League) built with React + Vite (frontend) and Express + Socket.io (backend).

## Features

- 🏏 Real-time bidding via WebSockets
- 👥 8 teams with ₹1,00,00,000 budget each
- ♂♀ Squad limits: 5 male + 2 female per team
- 📊 Live dashboard with budget tracking
- 🎙️ Auctioneer display for projection
- 🔒 Team login with passwords
- 📱 Admin panel for managing players & auction

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
cd dpl-auction-app/backend && npm install
cd ../frontend && npm install
```

### Running the App

**Terminal 1 - Backend:**
```bash
cd dpl-auction-app/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd dpl-auction-app/frontend
npm run dev
```

## Access Points

| Role | URL | Description |
|------|-----|-------------|
| Dashboard | http://localhost:5173/dashboard | Overview |
| Admin | http://localhost:5173/admin | Control panel |
| Auctioneer | http://localhost:5173/auctioneer | Big screen display |
| Team Alpha | http://localhost:5173/team/team-1 | Bidding (pw: alpha123) |
| Team Beta | http://localhost:5173/team/team-2 | Bidding (pw: beta123) |
| Team Gamma | http://localhost:5173/team/team-3 | Bidding (pw: gamma123) |
| Team Delta | http://localhost:5173/team/team-4 | Bidding (pw: delta123) |
| Team Epsilon | http://localhost:5173/team/team-5 | Bidding (pw: epsilon123) |
| Team Zeta | http://localhost:5173/team/team-6 | Bidding (pw: zeta123) |
| Team Eta | http://localhost:5173/team/team-7 | Bidding (pw: eta123) |
| Team Theta | http://localhost:5173/team/team-8 | Bidding (pw: theta123) |

## How to Run an Auction

1. Go to **Admin Panel** → Players tab
2. Add players (single or bulk, specify male/female)
3. Go to **Auction Control** tab
4. Click **Start** to begin the auction
5. Team owners open their team page and place bids
6. Admin clicks **Sell Player** when bidding is done
7. Click **Next Player** to continue
8. View **Results** for final standings

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Socket.io-client, React Router
- **Backend:** Express, Socket.io, Node.js
- **Data:** JSON file storage
