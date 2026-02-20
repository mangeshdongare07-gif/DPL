import React from 'react';
import { Link } from 'react-router-dom';
import { useAuction } from '../../hooks/useAuction';
import BudgetTracker from './BudgetTracker';
import SquadProgress from './SquadProgress';
import { Settings, Monitor, Trophy } from 'lucide-react';

const Dashboard = () => {
  const { auctionState, teams, players, loading, formatPrice } = useAuction();

  const soldCount = players.filter(p => p.status === 'sold').length;
  const unsoldCount = players.filter(p => p.status === 'unsold').length;
  const availableCount = players.filter(p => p.status === 'available').length;
  const status = auctionState?.status || 'idle';

  const statusColors = {
    idle: 'bg-gray-600 text-gray-200',
    active: 'bg-green-600 text-white',
    paused: 'bg-yellow-600 text-black',
    completed: 'bg-blue-600 text-white'
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">\ud83c\udfd1 DPL Auction Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Live overview of the auction</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors">
              <Settings size={14} /> Admin
            </Link>
            <Link to="/auctioneer" className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded-lg text-sm transition-colors">
              <Monitor size={14} /> Auctioneer
            </Link>
            <Link to="/results" className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-lg text-sm transition-colors">
              <Trophy size={14} /> Results
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Auction Status Bar */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusColors[status]}`}>
                {status === 'active' && <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse mr-1" />}
                {status}
              </span>
              {auctionState?.currentPlayer && (
                <span className="text-gray-300">
                  Now: <strong className="text-yellow-400">{auctionState.currentPlayer.name}</strong>
                  {auctionState.currentBid && <span className="ml-2 text-green-400">&mdash; {formatPrice(auctionState.currentBid)}</span>}
                </span>
              )}
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center"><div className="text-xl font-bold text-green-400">{soldCount}</div><div className="text-gray-400">Sold</div></div>
              <div className="text-center"><div className="text-xl font-bold text-red-400">{unsoldCount}</div><div className="text-gray-400">Unsold</div></div>
              <div className="text-center"><div className="text-xl font-bold text-blue-400">{availableCount}</div><div className="text-gray-400">Available</div></div>
              <div className="text-center"><div className="text-xl font-bold text-gray-300">{players.length}</div><div className="text-gray-400">Total</div></div>
            </div>
          </div>
          {players.length > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(soldCount / players.length) * 100}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{soldCount}/{players.length} players auctioned</p>
            </div>
          )}
        </div>

        {/* Quick Team Links */}
        <div className="mb-4 flex flex-wrap gap-2">
          {teams.map(team => (
            <Link key={team.id} to={`/team/${team.id}`} className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-300 hover:text-white">
              {team.name}
            </Link>
          ))}
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map(team => {
            const isLeading = auctionState?.currentBidder?.id === team.id;
            return (
              <Link key={team.id} to={`/team/${team.id}`} className={`bg-gray-800 rounded-lg p-4 border transition-all hover:scale-105 ${isLeading ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-700'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${isLeading ? 'text-yellow-400' : 'text-white'}`}>
                    {isLeading && '\ud83c\udfc6 '}{team.name}
                  </h3>
                  <span className="text-xs text-gray-400">{team.players?.length || 0} players</span>
                </div>
                <BudgetTracker team={team} formatPrice={formatPrice} />
                <SquadProgress team={team} />
                {team.players && team.players.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {team.players.slice(0, 5).map(p => (
                      <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded ${p.gender === 'male' ? 'bg-blue-900 text-blue-300' : 'bg-pink-900 text-pink-300'}`}>
                        {p.name.split(' ')[0]}
                      </span>
                    ))}
                    {team.players.length > 5 && <span className="text-xs text-gray-500">+{team.players.length - 5}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
