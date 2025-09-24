import React, { useState, useEffect } from 'react';
import { User, Star, AlertTriangle } from 'lucide-react';
import { apiGet } from '../utils/api';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import Navigation from '../components/common/Navigation';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch profile
      const profileRes = await apiGet('/user/profile');
      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }

      // Fetch game history
      const gamesRes = await apiGet('/user/games');
      if (gamesRes.ok) {
        setGames(await gamesRes.json());
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load profile data');
    }
    setLoading(false);
  };

  return (
    <Layout darkMode={darkMode}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation darkMode={darkMode} />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile
          </h1>
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

        {!loading && !error && (
          <div className="space-y-8">
            {/* Profile Info */}
            <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {profile?.games_played || 0}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Games Played</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {profile?.total_score || 0}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {profile?.best_score || 0}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Score</div>
                </div>
              </div>
            </div>
            
            {/* Game History */}
            {games.length > 0 && (
              <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Star className="h-6 w-6 text-yellow-500" />
                  Recent Sessions
                </h3>
                <div className="space-y-4">
                  {games.slice(0, 10).map((game, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {game.stage}
                          </span>
                        </div>
                        <div>
                          <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Stage {game.stage}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {game.created_at ? new Date(game.created_at).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {game.score} pts
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {game.attempts || 0} attempts
                          </div>
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
              <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm text-center`}>
                <div className={`text-gray-400 mb-2`}>📊</div>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  No Game History
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Start playing to see your session history here
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ProfilePage;
