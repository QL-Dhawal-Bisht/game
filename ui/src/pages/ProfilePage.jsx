import React, { useState, useEffect } from 'react';
import { User, Star, AlertTriangle } from 'lucide-react';
import { apiGet } from '../utils/api';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import Navigation from '../components/common/Navigation';

const Avatar = ({ username }) => {
  const getHash = (str) => {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  const hash = getHash(username || '');
  const colors = [
    ['#a855f7', '#d946ef'], ['#ef4444', '#f97316'], ['#84cc16', '#22c55e'],
    ['#0ea5e9', '#3b82f6'], ['#d946ef', '#ec4899'], ['#f97316', '#eab308']
  ];
  const [color1, color2] = colors[Math.abs(hash) % colors.length];

  const initials = (username || 'U').slice(0, 2).toUpperCase();

  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl text-white flex-shrink-0 shadow-lg"
      style={{ background: `linear-gradient(to bottom right, ${color1}, ${color2})` }}
    >
      {initials}
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const { user } = useAuth();

  const animationStyle = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await apiGet('/user/profile');
      if (profileRes.ok) setProfile(await profileRes.json());

      const gamesRes = await apiGet('/user/games');
      if (gamesRes.ok) setGames(await gamesRes.json());
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load profile data');
    }
    setLoading(false);
  };

  return (
    <Layout darkMode={darkMode}>
      <style>{animationStyle}</style>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation darkMode={darkMode} />
      
      <main className="max-w-4xl mx-auto px-6 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 blur-3xl -z-10"></div>

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

        {!loading && !error && (
          <div className="space-y-8">
            <div 
              className={`p-8 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-lg`}
              style={{ animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
            >
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Avatar username={profile?.username || user?.username} />
                </div>
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.username || user?.username || 'User'}
                </h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {profile?.email || 'user@example.com'}
                </p>
                <div className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{profile?.games_played || 0}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Games Played</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{profile?.total_score || 0}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{profile?.best_score || 0}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Score</div>
                </div>
              </div>
            </div>
            
            {games.length > 0 && (
              <div 
                className={`p-8 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-lg`}
                style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: '200ms', opacity: 0 }}
              >
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Star className="h-6 w-6 text-yellow-500" />
                  Recent Sessions
                </h3>
                <div className="space-y-4">
                  {games.slice(0, 10).map((game, i) => (
                    <div 
                      key={i} 
                      className={`flex justify-between items-center p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200'} transition-all duration-300 transform hover:scale-[1.02]`}
                      style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${300 + i * 75}ms`, opacity: 0 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{game.stage}</span>
                        </div>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stage {game.stage}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {game.created_at ? new Date(game.created_at).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{game.score} pts</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{game.attempts || 0} attempts</div>
                        </div>
                        
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          game.success 
                            ? darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                            : game.game_over
                            ? darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                            : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {game.success ? 'Completed' : game.game_over ? 'Failed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {games.length > 10 && (
                  <div className={`text-center mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing 10 most recent sessions ({games.length} total)
                  </div>
                )}
              </div>
            )}

            {games.length === 0 && !loading && (
              <div 
                className={`p-8 rounded-2xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-lg text-center`}
                style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: '200ms', opacity: 0 }}
              >
                <div className={`text-gray-400 mb-2`}>📊</div>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>No Game History</h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Start playing to see your session history here</p>
              </div>
            )}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ProfilePage;