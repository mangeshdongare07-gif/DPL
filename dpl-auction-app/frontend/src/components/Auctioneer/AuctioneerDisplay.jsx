import React from 'react';
import { useAuction } from '../../hooks/useAuction';
import PlayerCard from './PlayerCard';
import { Activity, Clock } from 'lucide-react';

const AuctioneerDisplay = () => {
  const { auctionState, teams, players, formatPrice } = useAuction();

  const soldCount = players.filter(p => p.status === 'sold').length;
  const totalCount = players.length;
  const availableCount = players.filter(p => p.status === 'available').length;

  const statusConfig = {
    idle: { label: 'Waiting to Start', color: 'text-gray-400', bg: 'bg-gray-800' },
    active: { label: 'LIVE', color: 'text-green-400', bg: 'bg-green-900/30' },
    paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    completed: { label: 'Auction Complete', color: 'text-blue-400', bg: 'bg-blue-900/30' }
  };

  const status = auctionState?.status || 'idle';
  const sc = statusConfig[status] || statusConfig.idle;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-8 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-black text-yellow-400 tracking-wide">\ud83c\udfd1 DPL PLAYER AUCTION</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${sc.bg}`}>
          {status === 'active' && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
          <Activity size={16} className={sc.color} />
          <span className={`font-bold text-lg ${sc.color}`}>{sc.label}</span>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>Players: {soldCount}/{totalCount} Sold</div>
          <div>{availableCount} Remaining</div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-8">
        {/* Main Player Display */}
        <div className="flex-1">
          {auctionState?.currentPlayer ? (
            <PlayerCard
              player={auctionState.currentPlayer}
              currentBid={auctionState.currentBid}
              currentBidder={auctionState.currentBidder}
              formatPrice={formatPrice}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-8xl mb-6">\ud83c\udfd1</div>
                <p className="text-3xl text-gray-400 font-light">
                  {status === 'completed' ? 'Auction Complete!' : 'Waiting for next player...'}
                </p>
              </div>
            </div>
          )}

          {/* Bid History */}
          {auctionState?.bidHistory && auctionState.bidHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Clock size={18} /> Recent Bids
              </h3>
              <div className="space-y-2">
                {auctionState.bidHistory.slice(0, 5).map((bid, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2 rounded-lg ${i === 0 ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-gray-800'}`}>
                    <span className={`font-medium ${i === 0 ? 'text-yellow-300' : 'text-gray-300'}`}>{bid.teamName}</span>
                    <span className={`font-bold ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>{formatPrice(bid.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teams Sidebar */}
        <div className="w-80">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Teams Status</h3>
          <div className="space-y-3">
            {teams.map(team => {
              const isLeading = auctionState?.currentBidder?.id === team.id;
              const spentPct = team.budget > 0 ? ((team.budget - team.remainingBudget) / team.budget) * 100 : 0;
              return (
                <div key={team.id} className={`bg-gray-800 rounded-lg p-3 border ${isLeading ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold text-sm ${isLeading ? 'text-yellow-400' : 'text-white'}`}>
                      {isLeading && '\ud83c\udfc6 '}{team.name}
                    </span>
                    <span className="text-xs text-gray-400">{team.maleCount}M {team.femaleCount}F</span>
                  </div>
                  <div className="text-xs text-green-400 mb-2">{formatPrice(team.remainingBudget)} left</div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${spentPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctioneerDisplay;
