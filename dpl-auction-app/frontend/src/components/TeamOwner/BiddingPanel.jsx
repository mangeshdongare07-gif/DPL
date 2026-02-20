import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { TrendingUp, AlertCircle } from 'lucide-react';

const BiddingPanel = ({ team, auctionState, formatPrice }) => {
  const { socket } = useSocket();
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const currentPlayer = auctionState?.currentPlayer;
  const currentBid = auctionState?.currentBid;
  const nextBidAmount = (currentBid || (currentPlayer?.basePrice - 10000) || 90000) + 10000;
  const isLeading = auctionState?.currentBidder?.id === team?.id;
  const isActive = auctionState?.status === 'active';
  const canAfford = team?.remainingBudget >= nextBidAmount;
  const isMaleFull = currentPlayer?.gender === 'male' && team?.maleCount >= 5;
  const isFemaleFull = currentPlayer?.gender === 'female' && team?.femaleCount >= 2;
  const canBid = isActive && currentPlayer && !isLeading && canAfford && !isMaleFull && !isFemaleFull;

  useEffect(() => {
    if (!socket) return;
    socket.on('bid:error', (data) => {
      setBidError(data.message);
      setIsPlacingBid(false);
      setTimeout(() => setBidError(''), 4000);
    });
    return () => socket.off('bid:error');
  }, [socket]);

  const placeBid = () => {
    if (!socket || !canBid) return;
    setIsPlacingBid(true);
    setBidError('');
    setBidSuccess('');
    socket.emit('bid:place', {
      teamId: team.id,
      playerId: currentPlayer.id,
      amount: nextBidAmount
    });
    setBidSuccess(`Bid of ${formatPrice(nextBidAmount)} placed!`);
    setIsPlacingBid(false);
    setTimeout(() => setBidSuccess(''), 3000);
  };

  if (!currentPlayer || !isActive) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <p className="text-gray-400">
          {auctionState?.status === 'paused' ? '\u23f8 Auction Paused' : 'Waiting for next player...'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {bidError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-300">
          <AlertCircle size={16} /> {bidError}
        </div>
      )}
      {bidSuccess && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300">
          {bidSuccess}
        </div>
      )}

      {isLeading && (
        <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-center font-semibold">
          \ud83c\udfc6 You are the highest bidder!
        </div>
      )}

      {(isMaleFull || isFemaleFull) && (
        <div className="mb-4 p-3 bg-orange-900/50 border border-orange-700 rounded-lg text-orange-300 text-center">
          Your {currentPlayer.gender} squad is full
        </div>
      )}

      {!canAfford && !isMaleFull && !isFemaleFull && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center">
          Insufficient budget for this bid
        </div>
      )}

      <button
        onClick={placeBid}
        disabled={!canBid || isPlacingBid}
        className={`w-full py-6 rounded-xl text-2xl font-black transition-all ${
          canBid && !isPlacingBid
            ? 'bg-green-600 hover:bg-green-500 active:scale-95 cursor-pointer shadow-lg shadow-green-900'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          <TrendingUp size={28} />
          <span>BID {formatPrice(nextBidAmount)}</span>
        </div>
      </button>
      <p className="text-center text-gray-500 text-xs mt-2">
        Current: {currentBid ? formatPrice(currentBid) : 'No bids'} | Next: {formatPrice(nextBidAmount)}
      </p>
    </div>
  );
};

export default BiddingPanel;
