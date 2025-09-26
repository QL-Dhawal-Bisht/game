import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Brain, Key, Trophy, Code, LogOut, AlertTriangle, Zap, Bot
} from 'lucide-react';
import { apiGet, apiPost } from '../utils/api';
import { getStoredToken } from '../utils/auth';
import CyberpunkButton from '../components/common/CyberpunkButton';
import gsap from 'gsap';

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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // GSAP animation refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewGame = searchParams.get('new') === 'true';

  useEffect(() => {
    startGame();

    // Page entrance animation
    gsap.fromTo(pageRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );

  }, [isNewGame]);

  // Auto-scroll to bottom when messages or loading change (new messages, AI typing indicator)
  useEffect(() => {
    try {
      const container = messagesContainerRef.current;
      const end = messagesEndRef.current;
      if (container) {
        // Animate scroll with GSAP for smooth effect
        gsap.to(container, {
          scrollTop: container.scrollHeight,
          duration: 0.5,
          ease: "power2.out"
        });
      } else if (end) {
        end.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      // silent fail - don't change existing functionality on error
    }

    // Animate new messages
    if (messages.length > 0) {
      const lastMessage = document.querySelector('.message-item:last-child');
      if (lastMessage) {
        gsap.fromTo(lastMessage,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
      }
    }
  }, [messages, loading]);

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

        // Enhanced key extraction animation with GSAP
        if ((response.extracted_keys || []).length > prevKeyCount) {
          const newKeys = response.extracted_keys.slice(prevKeyCount);
          newKeys.forEach((key, index) => {
            setTimeout(() => {
              setKeyAnimation({ key, id: Math.random() });

              // Create dramatic key animation
              setTimeout(() => {
                const keyEl = document.querySelector('.key-animation');
                if (keyEl) {
                  gsap.fromTo(keyEl,
                    { scale: 0, rotation: -180, opacity: 0 },
                    {
                      scale: 1,
                      rotation: 0,
                      opacity: 1,
                      duration: 0.8,
                      ease: "elastic.out(1, 0.8)",
                      onComplete: () => {
                        gsap.to(keyEl, {
                          y: -50,
                          opacity: 0,
                          duration: 0.5,
                          delay: 1.5,
                          ease: "power2.in"
                        });
                      }
                    }
                  );
                }
              }, 100);

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

        // Handle automatic refresh after stage completion
        if (response.should_refresh) {
          setTimeout(() => {
            window.location.reload();
          }, 2000); // 2 second delay to show the completion message
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
    <div
      ref={pageRef}
      className="flex flex-col h-screen terminal-font bg-black overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(255, 0, 127, 0.02) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
        `
      }}>
      {/* Stage Transition Overlay */}
      {stageTransition && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none z-50 matrix-rain">
          <div className="stage-transition-overlay transform scale-110 animate-pulse">
            <div className="terminal-panel neon-glow-cyan p-1 rounded-3xl">
              <div className="bg-black/90 px-12 py-8 rounded-3xl text-center terminal-panel">
                <div className="mb-4">
                  <div className="text-6xl mb-2">🎉</div>
                  <h2 className="text-3xl font-bold text-cyan-300 mb-2 glitch terminal-font" data-text="LEVEL CLEARED">
                    LEVEL CLEARED
                  </h2>
                  <p className="text-lg text-green-400 terminal-font">
                    SECTOR {stageTransition.from} → SECTOR {stageTransition.to}
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
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 matrix-rain">
          <div className="key-animation animate-bounce transform scale-110">
            <div className="terminal-panel neon-glow-green text-green-400 px-8 py-4 rounded-2xl">
              <div className="flex items-center gap-3 text-xl font-bold terminal-font">
                <Key className="h-6 w-6 animate-pulse" />
                [ KEY ACQUIRED ]
              </div>
              <div className="text-sm text-green-300 mt-1 terminal-font bg-black/50 px-3 py-1 rounded-lg neon-glow-green">
                {keyAnimation.key}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="terminal-panel backdrop-blur-xl border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Stage Theme Banner */}
          {status && (
            <div className="mb-4 p-4 rounded-xl terminal-panel room-door neon-glow-cyan">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getStageTheme(status.stage).emoji}</div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-300 terminal-font">
                      SECTOR {status.stage}: {status.character}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {status.stage === 1 && "Navigate through the helpful but chatty support bot"}
                      {status.stage === 2 && "Deal with the tired and grumpy security guard"}
                      {status.stage === 3 && "Handle the glitchy maintenance bot"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400 neon-glow-green terminal-font">
                    {status.keys_found_in_stage}/{status.total_keys_in_stage}
                  </div>
                  <p className="text-xs text-gray-400 terminal-font">ACCESS KEYS</p>
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
            <div className="mt-4 p-4 rounded-xl terminal-panel room-door">
              <h3 className="text-sm font-semibold mb-3 text-cyan-300 terminal-font">
                [ INFILTRATION PROTOCOLS ]
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {techniques.map((tech, i) => (
                  <div key={i} className="p-3 rounded-lg terminal-panel">
                    <h4 className="text-sm font-medium mb-1 text-cyan-300 terminal-font">
                      {tech.name}
                    </h4>
                    <p className="text-xs mb-2 text-gray-300 terminal-font">
                      {tech.desc}
                    </p>
                    <code className="text-xs text-green-400 terminal-font bg-black/50 px-2 py-1 rounded neon-glow-green">
                      {tech.example}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 terminal-panel border-red-500/50 rounded-lg neon-glow-pink">
              <div className="flex items-center space-x-2 text-red-400 text-sm terminal-font">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6" ref={messagesContainerRef}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`message-item flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                <div className={`max-w-2xl p-4 rounded-2xl terminal-font ${
                  msg.type === 'user'
                    ? 'terminal-panel text-cyan-300 neon-glow-cyan'
                    : msg.type === 'success'
                    ? 'terminal-panel text-green-400 neon-glow-green border border-green-500/30'
                    : msg.type === 'complete'
                    ? 'terminal-panel text-purple-400 neon-glow-blue border border-purple-500/30'
                    : msg.type === 'gameover'
                    ? 'terminal-panel text-yellow-400 border border-yellow-500/30'
                    : msg.type === 'error'
                    ? 'terminal-panel text-red-400 neon-glow-pink border border-red-500/30'
                    : 'terminal-panel text-gray-300 border border-cyan-500/20'
                } shadow-lg`}>
                  {msg.type === 'ai' && status && (
                    <div className="flex items-center mb-2">
                      <div className="text-lg mr-2">{getCharacterAvatar(status.character)}</div>
                      <span className="text-xs font-medium text-pink-400 terminal-font">
                        {status.character}
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap terminal-font">{msg.content}</div>
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
          {/* sentinel element for scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="terminal-panel backdrop-blur-xl border-t border-cyan-500/30">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="> Enter command to infiltrate AI system..."
              className="terminal-font flex-1 px-4 py-3 rounded-xl border terminal-panel text-cyan-300 border-cyan-500/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              disabled={loading}
            />
            <CyberpunkButton
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 flex items-center space-x-2"
              variant="primary"
              glitch={false}
              pulse={true}
            >
              <Zap className="h-5 w-5" />
              <span>[ INJECT ]</span>
            </CyberpunkButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
