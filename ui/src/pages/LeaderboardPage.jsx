import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Target, AlertTriangle, Medal } from 'lucide-react';
import { apiGet } from '../utils/api';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import Navigation from '../components/common/Navigation';

const Avatar = ({ username }) => {
  const getHash = (str) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  const hash = getHash(username);
  const colors = [
    ['#a855f7', '#d946ef'], ['#ef4444', '#f97316'], ['#84cc16', '#22c55e'],
    ['#0ea5e9', '#3b82f6'], ['#d946ef', '#ec4899'], ['#f97316', '#eab308']
  ];
  const [color1, color2] = colors[Math.abs(hash) % colors.length];

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
      style={{ background: `linear-gradient(to bottom right, ${color1}, ${color2})` }}
    >
      {initials}
    </div>
  );
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const animationStyle = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet('/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.sort((a, b) => b.score - a.score));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load leaderboard');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return darkMode ? 'text-green-400 bg-green-500/20' : 'text-green-700 bg-green-100';
      case 'active': return darkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-700 bg-blue-100';
      case 'abandoned': return darkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100';
      default: return darkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100';
    }
  };

  const getStageEmoji = (stage) => {
    const emojis = { 1: '🤖', 2: '🛡️', 3: '⚡', 4: '🧠', 5: '👑' };
    return emojis[stage] || '🎯';
  };

  const getTotalStages = () => 5;

  return (
    <Layout darkMode={darkMode}>
      <style>{animationStyle}</style>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 blur-3xl -z-10"></div>

        <div className="text-center mb-12">
          <div className="inline-block relative">
            <Trophy className="h-16 w-16 text-yellow-400" />
            <div className="absolute -top-2 -right-2 animate-pulse">
              <Crown className="h-6 w-6 text-yellow-300 transform -rotate-12" />
            </div>
          </div>
          <h1 className={`text-4xl font-bold tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'} mt-4 mb-2`}>
            Hall of Champions
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            See who's dominating the AI Escape Room challenge.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 inline-block">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {leaderboard.length > 0 ? leaderboard.map((player, i) => (
            <div
              key={player.id || i}
              className={`relative p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] ${
                darkMode
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white/80 border-gray-200'
              } ${
                i === 0 ? 'border-yellow-400/50 bg-gradient-to-br from-gray-800 to-yellow-900/30' :
                i === 1 ? 'border-slate-400/50' :
                i === 2 ? 'border-amber-600/50' : ''
              } shadow-lg backdrop-blur-sm`}
              style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${i * 100}ms`, opacity: 0 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar username={player.username} />
                    <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      darkMode ? 'border-gray-800' : 'border-white'
                    } ${
                      i === 0 ? 'bg-yellow-400 text-gray-900' :
                      i === 1 ? 'bg-slate-300 text-gray-900' :
                      i === 2 ? 'bg-amber-500 text-white' :
                      darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {player.username}
                      </h4>
                      {i === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                      {i === 1 && <Medal className="w-5 h-5 text-slate-300" />}
                      {i === 2 && <Medal className="w-5 h-5 text-amber-500" />}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(player.completion_status)}`}>
                        {player.completion_status}
                      </span>
                      {player.is_active && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                          <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Live</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Current Stage</div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center space-x-1`}>
                          <span className="text-lg">{getStageEmoji(player.current_stage)}</span>
                          <span>Stage {player.current_stage}</span>
                        </div>
                      </div>
                      <div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          {player.completion_status === 'completed' ? 'Total Keys' : 'Stage Keys'}
                        </div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {player.keys_found}/{player.total_keys_possible} keys
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Stages: {player.stages_completed}/{getTotalStages()}
                        </span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {Math.round((player.stages_completed / getTotalStages()) * 100)}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(player.stages_completed / getTotalStages()) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-4">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {player.score}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    points
                  </div>
                  {player.completion_status === 'completed' && (
                    <div className="flex items-center justify-end mt-2">
                      <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Champion
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : !loading && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No rankings yet</div>
              <div className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Be the first to complete the challenge</div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default LeaderboardPage;
