import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import AdminPanel from './components/Admin/AdminPanel';
import AuctioneerDisplay from './components/Auctioneer/AuctioneerDisplay';
import TeamInterface from './components/TeamOwner/TeamInterface';
import Dashboard from './components/Dashboard/Dashboard';
import Results from './components/Results/Results';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/auctioneer" element={<AuctioneerDisplay />} />
          <Route path="/team/:teamId" element={<TeamInterface />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
