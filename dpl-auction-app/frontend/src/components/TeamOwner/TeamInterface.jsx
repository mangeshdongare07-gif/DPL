import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import { useAuction } from '../../hooks/useAuction';
import BiddingPanel from './BiddingPanel';
import MySquad from './MySquad';

const TeamInterface = () => {
  const { teamId } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  const { auctionState, teams, formatPrice } = useAuction();

  // Sync team data from socket updates
  useEffect(() => {
    if (authenticated && teams.length > 0) {
      const updated = teams.find(t => t.id === teamId);
      if (updated) setMyTeam(updated);
    }
  }, [teams, authenticated, teamId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/teams/login', { teamId, password });
      setMyTeam(res.data.team);
      setAuthenticated(true);
      setAuthError('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Login failed');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">\ud83c\udfd1</div>
            <h1 className="text-2xl font-bold text-yellow-400">DPL Auction</h1>
            <p className="text-gray-400 mt-1">Team Login</p>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg text-sm">{authError}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter team password"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <LogIn size={18} /> Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!myTeam) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  const remainingPct = myTeam.budget > 0 ? (myTeam.remainingBudget / myTeam.budget) * 100 : 0;
  const budgetWarning = remainingPct < 20;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${budgetWarning ? 'bg-red-950 border-red-800' : 'bg-gray-800 border-gray-700'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">{myTeam.name}</h1>
          <div className="text-right">
            <div className={`text-xl font-bold ${budgetWarning ? 'text-red-400' : 'text-green-400'}`}>
              {formatPrice(myTeam.remainingBudget)}
            </div>
            <div className="text-xs text-gray-400">Remaining Budget</div>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-sm text-gray-400">
          <span>\u2642 {myTeam.maleCount}/5 male</span>
          <span>\u2640 {myTeam.femaleCount}/2 female</span>
          <span>{myTeam.players?.length || 0} total players</span>
        </div>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${budgetWarning ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${remainingPct}%` }}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Auction Player */}
        {auctionState?.currentPlayer && auctionState?.status === 'active' && (
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-700">
            <p className="text-sm text-gray-400 mb-1">Now Auctioning:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{auctionState.currentPlayer.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${auctionState.currentPlayer.gender === 'male' ? 'bg-blue-900 text-blue-200' : 'bg-pink-900 text-pink-200'}`}>
                  {auctionState.currentPlayer.gender}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Base Price</p>
                <p className="text-lg font-semibold text-yellow-400">{formatPrice(auctionState.currentPlayer.basePrice)}</p>
              </div>
            </div>
            {auctionState.currentBid && (
              <div className="mt-2 flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-400">Current Bid:</span>
                <span className="text-green-400 font-bold">{formatPrice(auctionState.currentBid)} &mdash; {auctionState.currentBidder?.name}</span>
              </div>
            )}
          </div>
        )}

        <BiddingPanel team={myTeam} auctionState={auctionState} formatPrice={formatPrice} />
        <MySquad team={myTeam} formatPrice={formatPrice} />
      </div>
    </div>
  );
};

export default TeamInterface;
