import React from 'react';

const MySquad = ({ team, formatPrice }) => {
  if (!team) return null;
  const malePlayers = team.players?.filter(p => p.gender === 'male') || [];
  const femalePlayers = team.players?.filter(p => p.gender === 'female') || [];
  const totalSpent = team.budget - team.remainingBudget;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-bold text-lg">My Squad</h3>
        <div className="flex gap-4 mt-1 text-sm">
          <span className="text-blue-300">\u2642 {team.maleCount}/5</span>
          <span className="text-pink-300">\u2640 {team.femaleCount}/2</span>
          <span className="text-red-400">Spent: {formatPrice(totalSpent)}</span>
        </div>
      </div>
      <div className="p-4">
        {team.players?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No players acquired yet</p>
        ) : (
          <div className="space-y-2">
            {[...malePlayers, ...femalePlayers].map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <span className="text-xs text-green-400">{formatPrice(p.soldPrice)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySquad;
