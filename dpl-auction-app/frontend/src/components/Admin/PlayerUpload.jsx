import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Upload, User } from 'lucide-react';

const PlayerUpload = ({ players }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [basePrice, setBasePrice] = useState(100000);
  const [bulkText, setBulkText] = useState('');
  const [bulkGender, setBulkGender] = useState('male');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState('single');

  const showMsg = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const addPlayer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/players', { name, gender, basePrice: Number(basePrice) });
      setName('');
      showMsg(`${name} added successfully!`);
    } catch (e) {
      showMsg(e.response?.data?.error || 'Failed to add player', true);
    }
  };

  const bulkAdd = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return showMsg('No names entered', true);
    const playersList = lines.map(line => ({ name: line, gender: bulkGender, basePrice: 100000 }));
    try {
      const res = await axios.post('/api/players/bulk', { players: playersList });
      setBulkText('');
      showMsg(`Added ${res.data.added} players!`);
    } catch (e) {
      showMsg(e.response?.data?.error || 'Failed to bulk add', true);
    }
  };

  const deletePlayer = async (id) => {
    try {
      await axios.delete(`/api/players/${id}`);
      showMsg('Player deleted');
    } catch (e) {
      showMsg('Failed to delete player', true);
    }
  };

  const malePlayers = players?.filter(p => p.gender === 'male') || [];
  const femalePlayers = players?.filter(p => p.gender === 'female') || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Players Management</h2>
        <div className="text-sm text-gray-400">
          Total: {players?.length || 0} | Male: {malePlayers.length} | Female: {femalePlayers.length}
        </div>
      </div>

      {message && <div className="mb-4 p-3 bg-green-900 text-green-200 rounded-lg">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg">{error}</div>}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveMode('single')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeMode === 'single' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}>Single Add</button>
        <button onClick={() => setActiveMode('bulk')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeMode === 'bulk' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}>Bulk Add</button>
      </div>

      {activeMode === 'single' && (
        <form onSubmit={addPlayer} className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Player Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter player name"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Base Price (\u20b9)</label>
              <input
                type="number"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                min={10000}
                step={10000}
              />
            </div>
          </div>
          <button type="submit" className="mt-4 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Add Player
          </button>
        </form>
      )}

      {activeMode === 'bulk' && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Enter one player name per line:</p>
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Gender for all</label>
            <select value={bulkGender} onChange={e => setBulkGender(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder={"Rahul Sharma\nPriya Singh\nAmit Kumar"}
            rows={8}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400 font-mono text-sm"
          />
          <button onClick={bulkAdd} className="mt-3 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
            <Upload size={16} /> Bulk Add Players
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <User size={16} /> Male Players ({malePlayers.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {malePlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-gray-800 rounded p-3 border border-gray-700">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.status === 'sold' ? 'bg-green-900 text-green-200' : p.status === 'unsold' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                    {p.status}
                  </span>
                </div>
                <button onClick={() => deletePlayer(p.id)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {malePlayers.length === 0 && <p className="text-gray-500 text-sm">No male players added yet</p>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-pink-300 mb-3 flex items-center gap-2">
            <User size={16} /> Female Players ({femalePlayers.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {femalePlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-gray-800 rounded p-3 border border-gray-700">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.status === 'sold' ? 'bg-green-900 text-green-200' : p.status === 'unsold' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                    {p.status}
                  </span>
                </div>
                <button onClick={() => deletePlayer(p.id)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {femalePlayers.length === 0 && <p className="text-gray-500 text-sm">No female players added yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerUpload;
