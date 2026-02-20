import React from 'react';

const PlayerCard = ({ player, currentBid, currentBidder, formatPrice }) => {
  if (!player) return null;
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20">
      <div className="text-center">
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${player.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'}`}>
          {player.gender === 'male' ? '\u2642 Male' : '\u2640 Female'}
        </div>
        <h2 className="text-6xl font-black text-white mb-4 tracking-tight">{player.name}</h2>
        <div className="text-2xl text-gray-400 mb-6">
          Base Price: <span className="text-yellow-300 font-bold">{formatPrice(player.basePrice)}</span>
        </div>
        <div className={`p-6 rounded-xl ${currentBid ? 'bg-green-900/50 border border-green-500' : 'bg-gray-700/50 border border-gray-600'}`}>
          <p className="text-lg text-gray-300 mb-2">Current Bid</p>
          <p className={`text-5xl font-black ${currentBid ? 'text-green-400' : 'text-gray-500'}`}>
            {currentBid ? formatPrice(currentBid) : 'No bids yet'}
          </p>
          {currentBidder && (
            <p className="text-xl text-yellow-400 font-semibold mt-2">&mdash; {currentBidder.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
