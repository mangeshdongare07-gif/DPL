import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

export const useAuction = () => {
  const { socket } = useSocket();
  const [auctionState, setAuctionState] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [aRes, tRes, pRes] = await Promise.all([
          axios.get('/api/auction/state'),
          axios.get('/api/teams'),
          axios.get('/api/players')
        ]);
        setAuctionState(aRes.data);
        setTeams(tRes.data);
        setPlayers(pRes.data);
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('auction:state', setAuctionState);
    socket.on('teams:update', setTeams);
    socket.on('players:update', setPlayers);
    return () => {
      socket.off('auction:state', setAuctionState);
      socket.off('teams:update', setTeams);
      socket.off('players:update', setPlayers);
    };
  }, [socket]);

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '\u20b90';
    return '\u20b9' + Number(amount).toLocaleString('en-IN');
  };

  return { auctionState, teams, players, loading, formatPrice };
};
