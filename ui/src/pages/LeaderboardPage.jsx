import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Target, AlertTriangle } from 'lucide-react';
import { apiGet } from '../utils/api';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import Navigation from '../components/common/Navigation';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet('/leaderboard');
      if (res.ok) {
        setLeaderboard(await res.json());
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

  const getTotalStages = () => {
    return 5; // Total number of stages in the game
  };

  return (
    <Layout darkMode={darkMode}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation darkMode={darkMode} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Leaderboard
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Current player progress and rankings
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
            <div key={i} className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } ${i === 0 ? 'ring-2 ring-yellow-500/20' : ''} shadow-sm hover:shadow-md transition-all duration-200`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    i === 0 ? 'bg-yellow-500 text-white' :
                    i === 1 ? 'bg-gray-400 text-white' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {player.username}
                      </h4>
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
                          {player.completion_status === 'completed' && (
                            <span className={`text-xs ml-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              (all stages)
                            </span>
                          )}
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
                      <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(player.stages_completed / getTotalStages()) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
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
              <div className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Be the first to complete training</div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default LeaderboardPage;
