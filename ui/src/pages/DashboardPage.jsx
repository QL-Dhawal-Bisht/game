import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, User, Trophy, BarChart3, MessageSquare, Play, 
  Home, Users, Target, Zap, Brain, Lock, Unlock, 
  ChevronRight, Code, Database, Settings, Crown, 
  AlertTriangle, CheckCircle, Bot, Star 
} from 'lucide-react';
import { apiGet } from '../utils/api';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import Navigation from '../components/common/Navigation';

const DashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const animationStyle = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await apiGet('/user/profile');
      if (profileRes.ok) setProfile(await profileRes.json());

      const stagesRes = await apiGet('/game/stages');
      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(stagesData.stages || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    }
    setLoading(false);
  };

  const handleStartGame = () => navigate('/game');

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'MEDIUM': return darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'HARD': return darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      case 'VERY HARD': return darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700';
      case 'MASTER': return darkMode ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400' : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const featureCards = [
    { icon: Shield, color: 'blue', title: 'Real-world Scenarios', description: 'Practice with realistic AI systems and learn from actual security vulnerabilities found in production environments.' },
    { icon: Database, color: 'purple', title: 'Progressive Difficulty', description: 'Start with basic techniques and advance to sophisticated multi-stage attacks that challenge expert practitioners.' },
    { icon: Trophy, color: 'green', title: 'Performance Tracking', description: 'Monitor your progress with detailed analytics and compete with other security researchers on the leaderboard.' },
  ];

  return (
    <Layout darkMode={darkMode}>
      <style>{animationStyle}</style>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
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
          <div className="space-y-12">
            <div 
              className="text-center relative"
              style={{ animation: 'fadeInUp 0.5s ease-out forwards', opacity: 0 }}
            >
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} mb-6`}>
                  <Brain className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Security Training Platform
                </h2>
                <p className={`text-xl mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Master the art of prompt injection through hands-on training with advanced AI models.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartGame}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Continue Training
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureCards.map((card, i) => {
                const Icon = card.icon;
                const colorClass = {
                  blue: { bg: darkMode ? 'bg-blue-500/20' : 'bg-blue-100', text: 'text-blue-500' },
                  purple: { bg: darkMode ? 'bg-purple-500/20' : 'bg-purple-100', text: 'text-purple-500' },
                  green: { bg: darkMode ? 'bg-green-500/20' : 'bg-green-100', text: 'text-green-500' },
                }[card.color];

                return (
                  <div 
                    key={i}
                    className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
                    style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${200 + i * 100}ms`, opacity: 0 }}
                  >
                    <div className={`p-3 rounded-lg ${colorClass.bg} w-fit mb-4`}>
                      <Icon className={`h-6 w-6 ${colorClass.text}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{card.title}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.description}</p>
                  </div>
                );
              })}
            </div>

            {stages.length > 0 && (
              <div 
                className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm`}
                style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: '500ms', opacity: 0 }}
              >
                <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                  <Target className="h-8 w-8 text-purple-600" />
                  Training Stages
                </h3>
                <div className="space-y-6">
                  {stages.map((stage, i) => (
                    <div 
                      key={i} 
                      className={`flex justify-between items-start p-6 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200'} transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl`}
                      style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: `${600 + i * 100}ms`, opacity: 0 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {stage.stage}
                          </div>
                          <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stage.character}</div>
                        </div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>{stage.story}</div>
                      </div>
                      <div className="text-right ml-6">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold mb-2 ${getDifficultyColor(stage.difficulty)}`}>{stage.difficulty}</div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stage.total_keys} keys to extract</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile && (
              <div 
                className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm`}
                style={{ animation: 'fadeInUp 0.5s ease-out forwards', animationDelay: '700ms', opacity: 0 }}
              >
                <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{profile.games_played || 0}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Training Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{profile.total_score || 0}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{profile.best_score || 0}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Personal Best</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default DashboardPage;