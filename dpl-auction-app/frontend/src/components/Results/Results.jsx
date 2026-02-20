import React from 'react';
import { Link } from 'react-router-dom';
import { useAuction } from '../../hooks/useAuction';
import { Trophy, ArrowLeft } from 'lucide-react';

const Results = () => {
  const { teams, players, formatPrice, loading } = useAuction();

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  const soldPlayers = players.filter(p => p.status === 'sold').sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0));
  const unsoldPlayers = players.filter(p => p.status === 'unsold');
  const totalSpent = teams.reduce((sum, t) => sum + (t.budget - t.remainingBudget), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">DPL Auction Results</h1>
            <p className="text-gray-400 text-sm">Final standings and statistics</p>
          </div>
        </div>
        <Link to="/dashboard" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
      </div>

      <div className="p-6 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-3xl font-black text-green-400">{soldPlayers.length}</div>
            <div className="text-gray-400 text-sm">Players Sold</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-3xl font-black text-red-400">{unsoldPlayers.length}</div>
            <div className="text-gray-400 text-sm">Unsold</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl font-black text-yellow-400">{formatPrice(totalSpent)}</div>
            <div className="text-gray-400 text-sm">Total Spent</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
            <div className="text-2xl font-black text-blue-400">
              {soldPlayers.length > 0 ? formatPrice(Math.round(totalSpent / soldPlayers.length)) : '\u20b90'}
            </div>
            <div className="text-gray-400 text-sm">Avg Price</div>
          </div>
        </div>

        {/* Team Rosters */}
        <div>
          <h2 className="text-xl font-bold mb-4">Team Rosters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map(team => {
              const spent = team.budget - team.remainingBudget;
              return (
                <div key={team.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="p-3 border-b border-gray-700">
                    <h3 className="font-bold text-yellow-400">{team.name}</h3>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-400">Spent: {formatPrice(spent)}</span>
                      <span className="text-green-400">Left: {formatPrice(team.remainingBudget)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      \u2642{team.maleCount}/5 \u2640{team.femaleCount}/2
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {team.players?.length === 0 ? (
                      <p className="text-gray-500 text-xs text-center py-2">No players</p>
                    ) : (
                      team.players.map(p => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${p.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                            <span className="text-sm">{p.name}</span>
                          </div>
                          <span className="text-xs text-green-400">{formatPrice(p.soldPrice)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Expensive Players */}
        {soldPlayers.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">\ud83c\udfc6 Most Expensive Players</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900">
                    <th className="text-left px-4 py-3 text-gray-400 text-sm">#</th>
                    <th className="text-left px-4 py-3 text-gray-400 text-sm">Player</th>
                    <th className="text-left px-4 py-3 text-gray-400 text-sm">Gender</th>
                    <th className="text-left px-4 py-3 text-gray-400 text-sm">Team</th>
                    <th className="text-right px-4 py-3 text-gray-400 text-sm">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {soldPlayers.slice(0, 10).map((p, i) => {
                    const team = teams.find(t => t.id === p.soldTo);
                    return (
                      <tr key={p.id} className={`border-b border-gray-700 ${i === 0 ? 'bg-yellow-900/20' : ''}`}>
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.gender === 'male' ? 'bg-blue-900 text-blue-200' : 'bg-pink-900 text-pink-200'}`}>
                            {p.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-yellow-400">{team?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-400">{formatPrice(p.soldPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unsold Players */}
        {unsoldPlayers.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-red-400">Unsold Players ({unsoldPlayers.length})</h2>
            <div className="flex flex-wrap gap-2">
              {unsoldPlayers.map(p => (
                <span key={p.id} className={`px-3 py-1.5 rounded-lg text-sm ${p.gender === 'male' ? 'bg-blue-900/50 text-blue-200' : 'bg-pink-900/50 text-pink-200'}`}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
