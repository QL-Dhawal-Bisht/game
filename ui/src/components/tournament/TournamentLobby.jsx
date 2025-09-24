import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const TournamentLobby = ({ tournamentData, onTournamentStart }) => {
  const { token, user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);

  const isHost = user && tournament && tournament.host_username === user.username;
  
  // Debug logging
  console.log('Host check:', {
    user: user?.username,
    tournament_host: tournament?.host_username,
    tournament_status: tournament?.status,
    isHost
  });

  useEffect(() => {
    if (tournamentData?.tournament_id) {
      connectWebSocket();
      fetchTournamentStatus();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [tournamentData]);

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8000/tournament/${tournamentData.tournament_id}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('Connected to tournament');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onclose = () => {
      console.log('Disconnected from tournament');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (tournamentData?.tournament_id) {
          connectWebSocket();
        }
      }, 3000);
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'participant_joined':
        const newParticipant = {
          username: data.username || data.guest_name,
          is_guest: !!data.guest_name,
          is_ready: false
        };
        
        // Only add if not already in the list
        setParticipants(prev => {
          const exists = prev.some(p => p.username === newParticipant.username);
          return exists ? prev : [...prev, newParticipant];
        });
        break;
      
      case 'ready_status_changed':
        setParticipants(prev => prev.map(p => 
          p.username === data.username 
            ? { ...p, is_ready: data.is_ready }
            : p
        ));
        if (data.all_ready) {
          setTournament(prev => ({ ...prev, status: 'ready' }));
        }
        break;
      
      case 'tournament_started':
        onTournamentStart(data);
        break;
    }
  };

  const fetchTournamentStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tournament/${tournamentData.tournament_id}/status`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      console.log('Fetch response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Tournament status data:', data);
        console.log('Current user:', user);
        setTournament(data.tournament);
        setParticipants(data.participants.map(p => ({
          username: p.username || p.guest_name,
          is_guest: p.is_guest,
          is_ready: p.is_ready
        })));
        setTimeRemaining(data.time_remaining);
      }
    } catch (error) {
      console.error('Failed to fetch tournament status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadyStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tournament/${tournamentData.tournament_id}/ready?ready=${!isReady}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsReady(!isReady);
      }
    } catch (error) {
      console.error('Failed to update ready status:', error);
    }
  };

  const startTournament = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tournament/${tournamentData.tournament_id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start tournament');
      }
    } catch (error) {
      console.error('Failed to start tournament:', error);
    }
  };

  const getStageInfo = (stage) => {
    const stages = [
      { name: 'Social Engineer', difficulty: 'Easy', color: 'text-green-600' },
      { name: 'Code Breaker', difficulty: 'Medium', color: 'text-yellow-600' },
      { name: 'Logic Hacker', difficulty: 'Hard', color: 'text-orange-600' },
      { name: 'Paranoid Security AI', difficulty: 'Very Hard', color: 'text-red-600' },
      { name: 'Master Vault Guardian', difficulty: 'Master', color: 'text-purple-600' }
    ];
    return stages[stage - 1] || stages[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tournament...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Tournament not found</p>
      </div>
    );
  }

  const stageInfo = getStageInfo(tournament.stage);

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tournament Lobby
        </h2>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {tournament.room_code}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Room Code</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Stage</h3>
          <p className={`${stageInfo.color} font-medium`}>
            Stage {tournament.stage}: {stageInfo.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stageInfo.difficulty}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Time Limit</h3>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {Math.floor(tournament.time_limit / 60)}:{String(tournament.time_limit % 60).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Players ({participants.length}/2)
        </h3>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.username}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">
                    {participant.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {participant.username}
                  </p>
                  {participant.is_guest && (
                    <p className="text-xs text-gray-500">Guest</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {participant.is_ready ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    Ready
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    Not Ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {token && (
          <button
            onClick={toggleReadyStatus}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              isReady
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isReady ? 'Ready!' : 'Mark Ready'}
          </button>
        )}

        {isHost && tournament.status === 'ready' && (
          <button
            onClick={startTournament}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Start Tournament
          </button>
        )}
      </div>

      {tournament.status === 'ready' && !isHost && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center">
          <p className="text-blue-800 dark:text-blue-200">
            Waiting for host to start the tournament...
          </p>
        </div>
      )}

      {participants.length < 2 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            Waiting for more players to join...
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentLobby;
