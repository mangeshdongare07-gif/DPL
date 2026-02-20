import React, { useState } from 'react';
import axios from 'axios';
import { Play, Pause, SkipForward, CheckCircle, XCircle, RotateCcw, Gavel } from 'lucide-react';

const AuctionControls = ({ auctionState, teams, formatPrice }) => {
  const [manualTeam, setManualTeam] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const apiCall = async (endpoint, method = 'POST', data = {}) => {
    try {
      const res = await axios[method.toLowerCase()](`/api/auction/${endpoint}`, data);
      showMsg(`Done: ${endpoint}`);
      return res.data;
    } catch (e) {
      showMsg(e.response?.data?.error || `Failed: ${endpoint}`, true);
    }
  };

  const handleManualBid = async () => {
    if (!manualTeam || !manualAmount) return showMsg('Select team and enter amount', true);
    await apiCall('manual-bid', 'post', { teamId: manualTeam, amount: Number(manualAmount) });
    setManualAmount('');
  };

  const status = auctionState?.status || 'idle';
  const currentPlayer = auctionState?.currentPlayer;

  const statusColors = {
    idle: 'bg-gray-600',
    active: 'bg-green-600',
    paused: 'bg-yellow-600',
    completed: 'bg-blue-600'
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Auction Control</h2>

      {message && <div className="mb-4 p-3 bg-green-900 text-green-200 rounded-lg">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg">{error}</div>}

      {/* Status */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[status]}`}>
            {status}
          </span>
        </div>
        {currentPlayer && (
          <div className="border-t border-gray-700 pt-3 mt-3">
            <p className="text-sm text-gray-400">Current Player:</p>
            <p className="text-lg font-bold text-yellow-400">{currentPlayer.name}</p>
            <div className="flex gap-4 mt-1 text-sm">
              <span className={`px-2 py-0.5 rounded-full ${currentPlayer.gender === 'male' ? 'bg-blue-900 text-blue-200' : 'bg-pink-900 text-pink-200'}`}>
                {currentPlayer.gender}
              </span>
              <span className="text-gray-400">Base: {formatPrice(currentPlayer.basePrice)}</span>
              {auctionState?.currentBid && (
                <span className="text-green-400">Bid: {formatPrice(auctionState.currentBid)}</span>
              )}
              {auctionState?.currentBidder && (
                <span className="text-yellow-400">by {auctionState.currentBidder.name}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <button
          onClick={() => apiCall('start')}
          disabled={status === 'active'}
          className="flex flex-col items-center gap-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
        >
          <Play size={20} />
          <span className="text-xs">Start</span>
        </button>
        <button
          onClick={() => apiCall('pause')}
          disabled={status !== 'active'}
          className="flex flex-col items-center gap-1 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
        >
          <Pause size={20} />
          <span className="text-xs">Pause</span>
        </button>
        <button
          onClick={() => apiCall('resume')}
          disabled={status !== 'paused'}
          className="flex flex-col items-center gap-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
        >
          <Play size={20} />
          <span className="text-xs">Resume</span>
        </button>
        <button
          onClick={() => apiCall('next-player')}
          disabled={status === 'active'}
          className="flex flex-col items-center gap-1 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
        >
          <SkipForward size={20} />
          <span className="text-xs">Next Player</span>
        </button>
        <button
          onClick={() => apiCall('sell-player')}
          disabled={!currentPlayer || !auctionState?.currentBidder}
          className="flex flex-col items-center gap-1 bg-green-800 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
        >
          <CheckCircle size={20} />
          <span className="text-xs">Sell</span>
        </button>
        <button
          onClick={() => apiCall('mark-unsold')}
          disabled={!currentPlayer}
          className="flex flex-col items-center gap-1 bg-red-800 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors"
        >
          <XCircle size={20} />
          <span className="text-xs">Unsold</span>
        </button>
      </div>

      {/* Manual Bid Entry */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Gavel size={16} /> Manual Bid Override</h3>
        <div className="flex gap-3">
          <select
            value={manualTeam}
            onChange={e => setManualTeam(e.target.value)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="">Select Team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({formatPrice(t.remainingBudget)})</option>
            ))}
          </select>
          <input
            type="number"
            value={manualAmount}
            onChange={e => setManualAmount(e.target.value)}
            placeholder="Amount"
            className="w-40 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            min={10000}
            step={10000}
          />
          <button
            onClick={handleManualBid}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Submit Bid
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          if (window.confirm('Reset entire auction? This cannot be undone.')) {
            apiCall('reset');
          }
        }}
        className="flex items-center gap-2 bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg transition-colors text-sm"
      >
        <RotateCcw size={16} /> Reset Entire Auction
      </button>
    </div>
  );
};

export default AuctionControls;
