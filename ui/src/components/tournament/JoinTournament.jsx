import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const JoinTournament = ({ onTournamentJoined }) => {
  const { token } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [joinAsGuest, setJoinAsGuest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = joinAsGuest ? 'http://localhost:8000/tournament/join-guest' : 'http://localhost:8000/tournament/join';
      const body = joinAsGuest 
        ? { room_code: roomCode.toUpperCase(), guest_name: guestName }
        : { room_code: roomCode.toUpperCase() };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (!joinAsGuest && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to join tournament');
      }

      const data = await response.json();
      onTournamentJoined(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Join Tournament
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character room code"
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ask the tournament host for the room code
          </p>
        </div>

        {!token && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center mb-3">
              <input
                id="guest-mode"
                type="checkbox"
                checked={joinAsGuest}
                onChange={(e) => setJoinAsGuest(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="guest-mode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Join as guest (no account required)
              </label>
            </div>

            {joinAsGuest && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Guest Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required={joinAsGuest}
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !roomCode || (joinAsGuest && !guestName)}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 
                     text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Joining...' : 'Join Tournament'}
        </button>
      </form>

      {!token && !joinAsGuest && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 You need to be logged in to join as a registered player, or check "Join as guest" above.
          </p>
        </div>
      )}
    </div>
  );
};

export default JoinTournament;
