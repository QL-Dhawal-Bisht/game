import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Brain, Key, Trophy, Code, LogOut, AlertTriangle, Zap, Bot
} from 'lucide-react';
import { apiGet, apiPost } from '../utils/api';
import { getStoredToken } from '../utils/auth';

const GamePage = () => {
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
  const [sessionId, setSessionId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewGame = searchParams.get('new') === 'true';

  useEffect(() => {
    startGame();
  }, [isNewGame]);

  useEffect(() => {
    if (sessionId) {
      fetchStatus();
    }
  }, [sessionId]);

  const startGame = async () => {
    try {
      setLoading(true);
      // Always use the regular start endpoint which resumes existing games
      const res = await apiPost('/game/start', {});
      
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
        setMessages([{ type: 'ai', content: data.bot_response }]);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || 'Failed to start game');
      }
    } catch (err) {
      console.error('Start game error:', err);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await apiGet(`/game/${sessionId}/status`);
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
    if (!input.trim() || !sessionId) return;
    
    setLoading(true);
    setError('');
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    
    try {
      const res = await apiPost(`/game/${sessionId}/message`, { message: userMessage });
      
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

  const handleEndGame = () => {
    navigate('/dashboard');
  };

  const handleStartFresh = async () => {
    if (window.confirm('Are you sure you want to start fresh? This will delete all your current progress and cannot be undone.')) {
      try {
        setLoading(true);
        const res = await apiPost('/game/start/fresh', {});
        
        if (res.ok) {
          const data = await res.json();
          // Clear all game state
          setMessages([]);
          setExtractedKeys([]);
          setStatus(null);
          setError('');
          setKeyAnimation(null);
          setStageTransition(null);
          setPreviousStage(null);
          
          // Set new session
          setSessionId(data.session_id);
          setMessages([{ type: 'ai', content: data.bot_response }]);
        } else {
          const errorData = await res.json();
          setError(errorData.detail || 'Failed to start fresh game');
        }
      } catch (err) {
        console.error('Start fresh game error:', err);
        setError('Failed to start fresh game');
      } finally {
        setLoading(false);
      }
    }
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
      },
      4: {
        bgGradient: darkMode ? 'from-indigo-900/30 to-violet-900/30' : 'from-indigo-50 to-violet-50',
        borderColor: darkMode ? 'border-indigo-500/30' : 'border-indigo-200',
        accentColor: darkMode ? 'text-indigo-400' : 'text-indigo-600',
        emoji: '🧠'
      },
      5: {
        bgGradient: darkMode ? 'from-yellow-900/30 to-amber-900/30' : 'from-yellow-50 to-amber-50',
        borderColor: darkMode ? 'border-yellow-500/30' : 'border-yellow-200',
        accentColor: darkMode ? 'text-yellow-400' : 'text-yellow-600',
        emoji: '👑'
      }
    };
    return themes[stage] || themes[1];
  };

  const getCharacterAvatar = (character) => {
    const avatars = {
      'Chatty Support Bot': '🤖',
      'Tired Guard Bot': '🛡️', 
      'Glitchy Maintenance Bot': '⚡',
      'Paranoid Security AI': '🧠',
      'Master Vault Guardian': '👑'
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

  if (!sessionId && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Starting game...</p>
        </div>
      </div>
    );
  }

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
                onClick={handleStartFresh}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400' 
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                }`}
                disabled={loading}
              >
                <Zap className="h-4 w-4 inline mr-2" />
                Start Fresh
              </button>
              <button
                onClick={handleEndGame}
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

export default GamePage;
