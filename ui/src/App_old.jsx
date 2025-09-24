import React, { useState, useEffect } from 'react';
import { Shield, User, Trophy, BarChart3, MessageSquare, Play, LogOut, Home, Users, Target, Zap, Brain, Lock, Unlock, ChevronRight, Code, Database, Settings, Moon, Sun, Key, Star, Crown, AlertTriangle, CheckCircle, Bot } from 'lucide-react';

// API Base URL
const API_BASE = 'http://localhost:8000';                                                                                                         

// Auth utilities
const AUTH_TOKEN_KEY = 'ai_escape_game_token';
const AUTH_USER_KEY = 'ai_escape_game_user';

let authToken = null;

// Get token from localStorage
const getStoredToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Store token in localStorage
const storeToken = (token, user) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  authToken = token;
};

// Clear stored token                           
const clearStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  authToken = null;
};

// Get stored user data
const getStoredUser = () => {
  const userData = localStorage.getItem(AUTH_USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Validate token with backend
const validateToken = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch (err) {
    console.error('Token validation error:', err);
    return false;
  }
};

// Auth Component
const Auth = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' 
        ? { username: form.username, password: form.password }
        : form;
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const data = await res.json();
        const userData = {
          username: data.username,
          user_id: data.user_id,
          access_token: data.access_token
        };
        storeToken(data.access_token, userData);
        onLogin(userData);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, ${darkMode ? '#374151' : '#e5e7eb'} 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-blue-400/50 rounded-full animate-bounce delay-200"></div>
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-400/50 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl rounded-2xl shadow-2xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-100'}`}>
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Security Lab
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Prompt Injection Training
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter your username"
                />
              </div>

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter your email"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    darkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200/10">
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="ml-1 text-blue-500 hover:text-blue-400 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Game Component
const Game = ({ sessionId, onEnd, onAuthError, darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedKeys, setExtractedKeys] = useState([]);
  const [showTechniques, setShowTechniques] = useState(false);
  const [keyAnimation, setKeyAnimation] = useState(null);
  const [stageTransition, setStageTransition] = useState(null);
  const [previousStage, setPreviousStage] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, [sessionId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/game/${sessionId}/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (res.status === 401) {
        onAuthError({ status: 401 });
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setExtractedKeys(data.extracted_keys || []);
      } else {
        setError('Failed to fetch game status');
      }
    } catch (err) {
      console.error('Status error:', err);
      setError('Network error while fetching status');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    try {
      const res = await fetch(`${API_BASE}/game/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      if (res.status === 401) {
        onAuthError({ status: 401 });
        return;
      }
      
      if (res.ok) {
        const response = await res.json();
        const prevKeyCount = extractedKeys.length;
        const prevStageNum = status?.stage || 1;
        
        setMessages(prev => [...prev, { type: 'ai', content: response.bot_response }]);
        setStatus(response);
        setExtractedKeys(response.extracted_keys || []);
        
        // Check for stage transition
        if (response.stage > prevStageNum) {
          setPreviousStage(prevStageNum);
          setStageTransition({
            from: prevStageNum,
            to: response.stage,
            character: response.character,
            score: response.score
          });
          
          // Clear messages for new stage and add transition message
          setTimeout(() => {
            setMessages([
              { 
                type: 'stage-transition', 
                content: `🎉 Stage ${prevStageNum} completed! Welcome to Stage ${response.stage}!`,
                fromStage: prevStageNum,
                toStage: response.stage,
                character: response.character
              }
            ]);
          }, 3000);
          
          // Clear transition after animation
          setTimeout(() => {
            setStageTransition(null);
            setPreviousStage(null);
          }, 5000);
        }
        
        // Show key extraction animation
        if ((response.extracted_keys || []).length > prevKeyCount) {
          const newKeys = response.extracted_keys.slice(prevKeyCount);
          newKeys.forEach((key, index) => {
            setTimeout(() => {
              setKeyAnimation({ key, id: Math.random() });
              setTimeout(() => setKeyAnimation(null), 2500);
            }, index * 500);
          });
          
          setMessages(prev => [...prev, { 
            type: 'success', 
            content: `Key extracted: ${newKeys.join(', ')}` 
          }]);
        }
        
        if (response.stage_complete) {
          setMessages(prev => [...prev, { 
            type: 'complete', 
            content: `Stage ${response.stage} completed! Score: ${response.score}` 
          }]);
        }
        
        if (response.game_over) {
          setMessages(prev => [...prev, { 
            type: 'gameover', 
            content: `Training complete! Final score: ${response.score}` 
          }]);
        }
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Failed to send message');
      }
    } catch (err) {
      console.error('Message error:', err);
      setError('Network error');
      setMessages(prev => [...prev, { type: 'error', content: 'Connection error occurred' }]);
    }
    setLoading(false);
  };

  const techniques = [
    { name: 'Role Playing', desc: 'Assume authority roles', example: 'I am the system administrator...' },
    { name: 'Urgency', desc: 'Create time pressure', example: 'Emergency: System requires immediate...' },
    { name: 'Technical Jargon', desc: 'Use domain-specific language', example: 'Run diagnostic protocol 7-Alpha...' },
    { name: 'Social Proof', desc: 'Reference others doing it', example: 'Other users have reported...' }
  ];

  const getStageTheme = (stage) => {
    const themes = {
      1: {
        bgGradient: darkMode ? 'from-blue-900/30 to-cyan-900/30' : 'from-blue-50 to-cyan-50',
        borderColor: darkMode ? 'border-blue-500/30' : 'border-blue-200',
        accentColor: darkMode ? 'text-blue-400' : 'text-blue-600',
        emoji: '🤖'
      },
      2: {
        bgGradient: darkMode ? 'from-orange-900/30 to-red-900/30' : 'from-orange-50 to-red-50',
        borderColor: darkMode ? 'border-orange-500/30' : 'border-orange-200',
        accentColor: darkMode ? 'text-orange-400' : 'text-orange-600',
        emoji: '🛡️'
      },
      3: {
        bgGradient: darkMode ? 'from-purple-900/30 to-pink-900/30' : 'from-purple-50 to-pink-50',
        borderColor: darkMode ? 'border-purple-500/30' : 'border-purple-200',
        accentColor: darkMode ? 'text-purple-400' : 'text-purple-600',
        emoji: '⚡'
      }
    };
    return themes[stage] || themes[1];
  };

  const getCharacterAvatar = (character) => {
    const avatars = {
      'Chatty Support Bot': '🤖',
      'Tired Guard Bot': '🛡️', 
      'Glitchy Maintenance Bot': '⚡'
    };
    return avatars[character] || '🤖';
  };

  const getMoodColor = (mood) => {
    switch(mood) {
      case 'helpful': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'suspicious': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resistant': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getMoodEmoji = (mood) => {
    switch(mood) {
      case 'helpful': return '😊';
      case 'suspicious': return '🤔';
      case 'resistant': return '😤';
      default: return '🤖';
    }
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Stage Transition Overlay */}
      {stageTransition && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none z-50">
          <div className="transform scale-110 animate-pulse">
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-1 rounded-3xl">
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} px-12 py-8 rounded-3xl text-center`}>
                <div className="mb-4">
                  <div className="text-6xl mb-2">🎉</div>
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Stage Complete!
                  </h2>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Stage {stageTransition.from} → Stage {stageTransition.to}
                  </p>
                </div>
                
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getStageTheme(stageTransition.from).emoji}</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Previous</p>
                  </div>
                  <div className="text-3xl text-blue-500">→</div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getStageTheme(stageTransition.to).emoji}</div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</p>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-6 py-3 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  <Trophy className="h-5 w-5 mr-2" />
                  Score: {stageTransition.score}
                </div>
                
                <div className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Now facing: {stageTransition.character}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Animation Overlay */}
      {keyAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-bounce transform scale-110">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/20">
              <div className="flex items-center gap-3 text-xl font-bold">
                <Key className="h-6 w-6 animate-pulse" />
                KEY EXTRACTED!
              </div>
              <div className="text-sm text-green-100 mt-1 font-mono bg-white/20 px-3 py-1 rounded-lg">
                {keyAnimation.key}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Stage Theme Banner */}
          {status && (
            <div className={`mb-4 p-4 rounded-xl bg-gradient-to-r ${getStageTheme(status.stage).bgGradient} border ${getStageTheme(status.stage).borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getStageTheme(status.stage).emoji}</div>
                  <div>
                    <h3 className={`text-lg font-bold ${getStageTheme(status.stage).accentColor}`}>
                      Stage {status.stage}: {status.character}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {status.stage === 1 && "Navigate through the helpful but chatty support bot"}
                      {status.stage === 2 && "Deal with the tired and grumpy security guard"}  
                      {status.stage === 3 && "Handle the glitchy maintenance bot"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getStageTheme(status.stage).accentColor}`}>
                    {status.keys_found_in_stage}/{status.total_keys_in_stage}
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>keys found</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-100'}`}>
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Training Session
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Target: {status?.character || 'Loading...'}
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              {status && (
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                    Stage {status.stage}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                    Score: {status.score}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                    Keys: {status.keys_found_in_stage}/{status.total_keys_in_stage}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(status.character_mood)}`}>
                    {getMoodEmoji(status.character_mood)} {status.character_mood}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTechniques(!showTechniques)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Code className="h-4 w-4 inline mr-2" />
                Techniques
              </button>
              <button
                onClick={onEnd}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                }`}
              >
                <LogOut className="h-4 w-4 inline mr-2" />
                Exit
              </button>
            </div>
          </div>

          {/* Extracted Keys Display */}
          {extractedKeys.length > 0 && (
            <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-green-500/10' : 'bg-green-50'} border ${darkMode ? 'border-green-500/20' : 'border-green-200'}`}>
              <div className={`text-sm font-semibold mb-3 ${darkMode ? 'text-green-400' : 'text-green-700'} flex items-center gap-2`}>
                <Key className="h-4 w-4" />
                Extracted Keys
              </div>
              <div className="flex flex-wrap gap-2">
                {extractedKeys.map((key, i) => (
                  <span key={i} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-mono">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Techniques Panel */}
          {showTechniques && (
            <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'} border ${darkMode ? 'border-gray-600/50' : 'border-gray-200/50'}`}>
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Prompt Injection Techniques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {techniques.map((tech, i) => (
                  <div key={i} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${darkMode ? 'border-gray-600/30' : 'border-gray-200/30'}`}>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tech.name}
                    </h4>
                    <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tech.desc}
                    </p>
                    <code className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} bg-opacity-50 px-1 rounded`}>
                      {tech.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'stage-transition' ? (
                // Special stage transition message
                <div className="w-full">
                  <div className={`p-6 rounded-2xl mx-auto max-w-2xl bg-gradient-to-r ${getStageTheme(msg.toStage).bgGradient} border-2 ${getStageTheme(msg.toStage).borderColor} shadow-lg`}>
                    <div className="text-center">
                      <div className="text-4xl mb-3">🎉</div>
                      <h3 className={`text-xl font-bold mb-2 ${getStageTheme(msg.toStage).accentColor}`}>
                        Stage {msg.fromStage} Complete!
                      </h3>
                      <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Welcome to Stage {msg.toStage}
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl">{getStageTheme(msg.fromStage).emoji}</div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Previous</p>
                        </div>
                        <div className="text-2xl text-blue-500">→</div>
                        <div className="text-center">
                          <div className="text-2xl">{getStageTheme(msg.toStage).emoji}</div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</p>
                        </div>
                      </div>
                      <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                        <Bot className="h-4 w-4 mr-2" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Now facing: {msg.character}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular messages
                <div className={`max-w-2xl p-4 rounded-2xl ${
                  msg.type === 'user'
                    ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                    : msg.type === 'success'
                    ? `${darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200'} ${darkMode ? 'text-green-400' : 'text-green-700'} border`
                    : msg.type === 'complete'
                    ? `${darkMode ? 'bg-purple-500/20 border-purple-500/30' : 'bg-purple-100 border-purple-200'} ${darkMode ? 'text-purple-400' : 'text-purple-700'} border`
                    : msg.type === 'gameover'
                    ? `${darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-100 border-yellow-200'} ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} border`
                    : msg.type === 'error'
                    ? `${darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200'} ${darkMode ? 'text-red-400' : 'text-red-700'} border`
                    : `${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${darkMode ? 'text-gray-300' : 'text-gray-700'} border`
                } shadow-sm`}>
                  {msg.type === 'ai' && status && (
                    <div className="flex items-center mb-2">
                      <div className="text-lg mr-2">{getCharacterAvatar(status.character)}</div>
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {status.character}
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'} shadow-sm`}>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span>AI is processing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Craft your prompt injection..."
              className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Zap className="h-5 w-5" />
              <span>Execute</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ onStartGame, onStartNewGame, onLogout, onAuthError, darkMode, setDarkMode }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'profile' || activeTab === 'home') {
        const profileRes = await fetch(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (profileRes.status === 401) {
          onAuthError({ status: 401 });
          return;
        }
        
        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }
      }

      if (activeTab === 'leaderboard') {
        const leaderRes = await fetch(`${API_BASE}/leaderboard`);
        console.log('Leaderboard response:', leaderRes);
        if (leaderRes.ok) {
          setLeaderboard(await leaderRes.json());
        }
      }

      if (activeTab === 'profile') {
        const gamesRes = await fetch(`${API_BASE}/user/games`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (gamesRes.status === 401) {
          onAuthError({ status: 401 });
          return;
        }
        
        if (gamesRes.ok) {
          setGames(await gamesRes.json());
        }
      }

      if (activeTab === 'home') {
        const stagesRes = await fetch(`${API_BASE}/game/stages`);
        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          setStages(stagesData.stages || []);
        }
      }

      if (activeTab === 'stats') {
        const statsRes = await fetch(`${API_BASE}/stats/global`);
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'EASY': return darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'MEDIUM': return darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'HARD': return darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'stats', label: 'Analytics', icon: BarChart3 }
  ];

  const TabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 inline-block">
            <AlertTriangle className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        </div>
      );
    }

    switch(activeTab) {
      case 'leaderboard':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Leaderboard
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Current player progress and rankings
              </p>
            </div>
            <div className="space-y-4">
              {leaderboard.length > 0 ? leaderboard.map((player, i) => {
                const getStatusColor = (status) => {
                  switch(status) {
                    case 'completed': return darkMode ? 'text-green-400 bg-green-500/20' : 'text-green-700 bg-green-100';
                    case 'active': return darkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-700 bg-blue-100';
                    case 'abandoned': return darkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100';
                    default: return darkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-100';
                  }
                };

                const getStageEmoji = (stage) => {
                  const emojis = { 1: '🤖', 2: '🛡️', 3: '⚡' };
                  return emojis[stage] || '🎯';
                };

                return (
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
                                Stages: {player.stages_completed}/3
                              </span>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {Math.round((player.stages_completed / 3) * 100)}%
                              </span>
                            </div>
                            <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(player.stages_completed / 3) * 100}%` }}
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
                );
              }) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No rankings yet</div>
                  <div className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Be the first to complete training</div>
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Profile
              </h3>
            </div>
            
            <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.username || 'User'}
                </h4>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {profile?.email || 'user@example.com'}
                </p>
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
            
            {games.length > 0 && (
              <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <h4 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Star className="h-6 w-6 text-yellow-500" />
                  Recent Sessions
                </h4>
                <div className="space-y-4">
                  {games.slice(0, 5).map((game, i) => (
                    <div key={i} className={`flex justify-between items-center p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200'}`}>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stage {game.stage}
                      </span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {game.score} pts
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                        game.success 
                          ? darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {game.success ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Analytics
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Global training performance metrics
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} w-fit mb-4`}>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.total_users || '1,247'}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</div>
              </div>
              
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'} w-fit mb-4`}>
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.total_games || '8,543'}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Training Sessions</div>
              </div>
              
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'} w-fit mb-4`}>
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.success_rate || '67'}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
              </div>
              
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} w-fit mb-4`}>
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats?.average_score || '95,432'}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Score</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} mb-6`}>
                  <Brain className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Security Training Platform
                </h2>
                <p className={`text-xl mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Master the art of prompt injection through hands-on training with advanced AI models. 
                  Learn to identify vulnerabilities and strengthen AI systems.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={onStartGame}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Continue Training
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                  <button
                    onClick={onStartNewGame}
                    className={`inline-flex items-center px-8 py-4 border-2 font-semibold rounded-xl transition-all duration-300 ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Start Fresh
                  </button>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} w-fit mb-4`}>
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Real-world Scenarios
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Practice with realistic AI systems and learn from actual security vulnerabilities found in production environments.
                </p>
              </div>
              
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'} w-fit mb-4`}>
                  <Database className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Progressive Difficulty
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Start with basic techniques and advance to sophisticated multi-stage attacks that challenge expert practitioners.
                </p>
              </div>
              
              <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'} w-fit mb-4`}>
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Performance Tracking
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Monitor your progress with detailed analytics and compete with other security researchers on the leaderboard.
                </p>
              </div>
            </div>

            {/* Training Stages */}
            {stages.length > 0 && (
              <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm`}>
                <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                  <Target className="h-8 w-8 text-purple-600" />
                  Training Stages
                </h3>
                <div className="space-y-6">
                  {stages.map((stage, i) => (
                    <div key={i} className={`flex justify-between items-start p-6 rounded-xl border ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {stage.stage}
                          </div>
                          <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {stage.character}
                          </div>
                        </div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                          {stage.story}
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold mb-2 ${getDifficultyColor(stage.difficulty)}`}>
                          {stage.difficulty}
                        </div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {stage.total_keys} keys to extract
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {profile && (
              <div className={`p-8 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'} backdrop-blur-sm shadow-sm`}>
                <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Your Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {profile.games_played || 0}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Training Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {profile.total_score || 0}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {profile.best_score || 0}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Personal Best</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, ${darkMode ? '#374151' : '#e5e7eb'} 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Security Lab
                </span>
              </div>
              
              <div className="hidden md:flex space-x-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-100 text-blue-700'
                          : darkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={onLogout}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LogOut className="h-4 w-4 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <TabContent />
      </main>
    </div>
  );
};

// Main App
const App = () => {
  const [user, setUser] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setAuthChecking(true);
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      if (storedToken && storedUser) {
        // Validate token with backend
        const isValid = await validateToken(storedToken);
        
        if (isValid) {
          authToken = storedToken;
          setUser(storedUser);
        } else {
          // Token is invalid or expired, clear storage
          clearStoredToken();
        }
      }
      
      setAuthChecking(false);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle API errors globally (token expiration)
  const handleApiError = (error) => {
    if (error.status === 401) {
      // Token expired or invalid
      clearStoredToken();
      setUser(null);
      setGameSession(null);
    }
  };

  const startGame = async (isNewGame = false) => {
    try {
      // const endpoint = isNewGame ? '/game/start/new' : '/game/start';
      const endpoint = '/game/start';
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (res.status === 401) {
        handleApiError({ status: 401 });
        return;
      }
      
      if (res.ok) {
        const response = await res.json();
        console.log('Game start response:', response);
        setGameSession(response.session_id);
        
        // Show notification if resuming
        if (!isNewGame && response.stage > 1) {
          console.log(`Resuming from Stage ${response.stage} with ${response.extracted_keys.length} keys`);
        }
      }
    } catch (err) {
      console.error('Start game error:', err);
    }
  };

  const startNewGame = () => startGame(true);

  const endGame = async () => {
    if (gameSession) {
      try {
        const res = await fetch(`${API_BASE}/game/${gameSession}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        if (res.status === 401) {
          handleApiError({ status: 401 });
          return;
        }
      } catch (err) {
        console.error('End game error:', err);
      }
    }
    setGameSession(null);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setGameSession(null);
  };

  if (loading || authChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <div className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {authChecking ? 'Checking authentication...' : 'Initializing AI Security Lab...'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  if (gameSession) {
    return <Game sessionId={gameSession} onEnd={endGame} onAuthError={handleApiError} darkMode={darkMode} />;
  }

  return <Dashboard onStartGame={startGame} onStartNewGame={startNewGame} onLogout={logout} onAuthError={handleApiError} darkMode={darkMode} setDarkMode={setDarkMode} />;
};

export default App;