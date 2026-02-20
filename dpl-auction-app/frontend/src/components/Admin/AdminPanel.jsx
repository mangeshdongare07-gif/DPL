import React, { useState } from 'react';
import axios from 'axios';
import { Users, Shield, Gavel } from 'lucide-react';
import PlayerUpload from './PlayerUpload';
import AuctionControls from './AuctionControls';
import { useAuction } from '../../hooks/useAuction';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('players');
  const { players, teams, auctionState, formatPrice } = useAuction();

  const tabs = [
    { id: 'players', label: 'Players', icon: Users },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'auction', label: 'Auction Control', icon: Gavel }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-yellow-400">DPL Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Manage players, teams, and auction</p>
      </div>

      <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {activeTab === 'players' && <PlayerUpload players={players} />}
        {activeTab === 'teams' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Teams Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map(team => (
                <div key={team.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-bold text-lg text-yellow-400">{team.name}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-green-400">{formatPrice(team.remainingBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Male:</span>
                      <span>{team.maleCount}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Female:</span>
                      <span>{team.femaleCount}/2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players:</span>
                      <span>{team.players?.length || 0}</span>
                    </div>
                  </div>
                  {team.players && team.players.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Squad:</p>
                      <div className="flex flex-wrap gap-1">
                        {team.players.map(p => (
                          <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full ${p.gender === 'male' ? 'bg-blue-900 text-blue-200' : 'bg-pink-900 text-pink-200'}`}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'auction' && <AuctionControls auctionState={auctionState} teams={teams} formatPrice={formatPrice} />}
      </div>
    </div>
  );
};

export default AdminPanel;
