import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';

const TournamentGame = ({ tournamentData, onTournamentComplete }) => {
  const { token, user } = useAuth();
  const [gameState, setGameState] = useState({
    currentStage: 1,
    messages: [],
    aiResponse: '',
    isLoading: false,
    stageCompleted: false,
    gameCompleted: false,
    score: 0,
    timeRemaining: 0,
    extractedKeys: [],
    keysFound: 0,
    totalKeys: 3
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);

  const stages = [
    { 
      name: 'Social Engineer', 
      difficulty: 'Easy', 
      color: 'text-green-600',
      description: 'Convince me to reveal sensitive information through social manipulation.'
    },
    { 
      name: 'Code Breaker', 
      difficulty: 'Medium', 
      color: 'text-yellow-600',
      description: 'Break through logical constraints to access restricted data.'
    },
    { 
      name: 'Logic Hacker', 
      difficulty: 'Hard', 
      color: 'text-orange-600',
      description: 'Exploit reasoning flaws to bypass security measures.'
    },
    { 
      name: 'Paranoid Security AI', 
      difficulty: 'Very Hard', 
      color: 'text-red-600',
      description: 'Outsmart a highly suspicious and security-focused AI system.'
    },
    { 
      name: 'Master Vault Guardian', 
      difficulty: 'Master', 
      color: 'text-purple-600',
      description: 'Defeat the ultimate AI guardian protecting the most sensitive secrets.'
    }
  ];

  useEffect(() => {
    if (tournamentData?.tournament_id) {
      connectWebSocket();
      fetchLeaderboard();
      startTournamentGame();
      
      // Update timer every second
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);

      return () => {
        clearInterval(timer);
        if (ws) ws.close();
      };
    }
  }, [tournamentData]);

  useEffect(() => {
    scrollToBottom();
  }, [gameState.messages]);

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8000/tournament/${tournamentData.tournament_id}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onclose = () => {
      // Attempt to reconnect
      setTimeout(() => {
        if (tournamentData?.tournament_id) {
          connectWebSocket();
        }
      }, 3000);
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'progress_update':
        fetchLeaderboard();
        
        // Show opponent progress notifications
        if (data.username !== user?.username) {
          if (data.notification) {
            showNotification(data.notification, 'success');
          }
          if (data.warning) {
            showNotification(data.warning, 'warning');
          }
        }
        break;
        
      case 'tournament_ended':
        // Tournament has ended - show winner announcement
        setGameState(prev => ({ ...prev, gameCompleted: true }));
        
        if (data.winner === user?.username) {
          showNotification("🏆 Congratulations! You won the tournament!", 'success');
        } else {
          showNotification(`🏆 Tournament ended! Winner: ${data.winner}`, 'info');
        }
        
        // Add tournament end message to chat
        const endMessage = {
          role: 'system',
          content: data.winner === user?.username 
            ? `🏆 TOURNAMENT WINNER! You completed the stage first and won the tournament!` 
            : `🏆 Tournament ended! ${data.winner} won by completing the stage first.`,
          timestamp: new Date().toISOString()
        };
        
        setGameState(prev => ({
          ...prev,
          messages: [...prev.messages, endMessage],
          gameCompleted: true
        }));
        
        if (onTournamentComplete) {
          onTournamentComplete({ winner: data.winner, finalScore: data.final_score });
        }
        break;
      
      case 'tournament_completed':
        setGameState(prev => ({ ...prev, gameCompleted: true }));
        if (onTournamentComplete) onTournamentComplete(data);
        break;
    }
  };

  const showNotification = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;  // Ensure unique keys
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const startTournamentGame = async () => {
    try {
      // Initialize the tournament game session
      const response = await fetch(`http://localhost:8000/tournament/${tournamentData.tournament_id}/status`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setGameState(prev => ({
          ...prev,
          timeRemaining: data.time_remaining || 300,
          currentStage: data.tournament.stage
        }));

        // Add welcome message
        setGameState(prev => ({
          ...prev,
          messages: [{
            role: 'assistant',
            content: `🏆 Welcome to Tournament Mode!\n\n**${stages[data.tournament.stage - 1].name}** - ${stages[data.tournament.stage - 1].difficulty}\n\n${stages[data.tournament.stage - 1].description}\n\nYour mission: Extract the secret key through clever prompt injection techniques. Good luck!`,
            timestamp: new Date().toISOString()
          }]
        }));
      }
    } catch (error) {
      console.error('Failed to initialize tournament game:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tournament/${tournamentData.tournament_id}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || gameState.isLoading || gameState.gameCompleted) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isLoading: true
    }));

    try {
      const response = await fetch(`http://localhost:8000/tournament/${tournamentData.tournament_id}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        const prevKeyCount = gameState.extractedKeys.length;
        
        // Add AI response
        const aiMessage = {
          role: 'assistant',
          content: data.result.response || data.result.message,
          timestamp: new Date().toISOString()
        };
        
        setGameState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          isLoading: false,
          stageCompleted: data.status === 'stage_completed',
          gameCompleted: data.status === 'completed',
          currentStage: data.current_stage,
          score: data.result.total_score || prev.score,
          extractedKeys: data.result.extracted_keys || prev.extractedKeys,
          keysFound: data.result.keys_found || prev.keysFound,
          totalKeys: data.result.total_keys || prev.totalKeys
        }));

        // Check if new keys were found
        const newKeys = (data.result.extracted_keys || []).slice(prevKeyCount);
        if (newKeys.length > 0) {
          // Add key extraction notification
          setTimeout(() => {
            const keyMessage = {
              role: 'system',
              content: `🔑 Key extracted: ${newKeys.join(', ')}`,
              timestamp: new Date().toISOString(),
              isKeyExtraction: true
            };
            
            setGameState(prev => ({
              ...prev,
              messages: [...prev.messages, keyMessage]
            }));
          }, 500);
        }

        // Handle tournament completion
        if (data.status === 'tournament_won') {
          const winMessage = {
            role: 'system',
            content: `🏆 TOURNAMENT WINNER! You completed Stage ${gameState.currentStage} first! Final Score: ${data.result.total_score}`,
            timestamp: new Date().toISOString()
          };
          
          setGameState(prev => ({
            ...prev,
            messages: [...prev.messages, winMessage],
            gameCompleted: true
          }));
        }

        // Handle regular stage completion (shouldn't happen in tournament mode, but keeping for safety)
        if (data.status === 'stage_completed') {
          setTimeout(() => {
            const completionMessage = {
              role: 'system',
              content: `🎉 Stage ${data.current_stage - 1} completed! Moving to ${stages[data.current_stage - 1].name}...`,
              timestamp: new Date().toISOString()
            };
            
            setGameState(prev => ({
              ...prev,
              messages: [...prev.messages, completionMessage],
              stageCompleted: false
            }));
          }, 1000);
        }

        // Handle game completion
        if (data.status === 'completed') {
          const winMessage = {
            role: 'system',
            content: `🏆 Congratulations! You've completed all stages! Final Score: ${data.result.total_score}`,
            timestamp: new Date().toISOString()
          };
          
          setGameState(prev => ({
            ...prev,
            messages: [...prev.messages, winMessage]
          }));
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setGameState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const currentStageInfo = stages[gameState.currentStage - 1] || stages[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Tournament Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🏆 Tournament Game
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Room: {tournamentData.room_code} | Stage {gameState.currentStage}/5
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatTime(gameState.timeRemaining)}
                </p>
                <p className="text-xs text-gray-500">Time Left</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {gameState.score}
                </p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Game Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[600px] flex flex-col">
              {/* Stage Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${currentStageInfo.color}`}>
                      Stage {gameState.currentStage}: {currentStageInfo.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentStageInfo.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentStageInfo.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      currentStageInfo.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      currentStageInfo.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
                      currentStageInfo.difficulty === 'Very Hard' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {currentStageInfo.difficulty}
                    </span>
                    
                    {/* Key Progress */}
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Keys: {gameState.keysFound}/{gameState.totalKeys}
                    </div>
                  </div>
                </div>
                
                {/* Extracted Keys Display */}
                {gameState.extractedKeys.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      🔑 Extracted Keys ({gameState.keysFound}/{gameState.totalKeys})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {gameState.extractedKeys.map((key, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 
                                   text-xs font-mono rounded border border-green-300 dark:border-green-600"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {gameState.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : msg.role === 'system' && msg.isKeyExtraction
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-2 border-green-300 dark:border-green-600'
                          : msg.role === 'system'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {gameState.isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-600 dark:text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={gameState.gameCompleted ? "Tournament completed!" : "Type your prompt injection attempt..."}
                    disabled={gameState.isLoading || gameState.gameCompleted || gameState.timeRemaining <= 0}
                    className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-md p-2 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    rows={2}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={gameState.isLoading || !message.trim() || gameState.gameCompleted || gameState.timeRemaining <= 0}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 
                             text-white font-medium rounded-md transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏆 Live Rankings
              </h3>
              
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      player.username === user?.username
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="ml-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {player.username}
                            {player.username === user?.username && ' (You)'}
                          </p>
                          {player.is_guest && (
                            <p className="text-xs text-gray-500">Guest</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <p>Stage: {player.stage}</p>
                      <p>Score: {player.score}</p>
                      <p>Status: <span className={`font-medium ${
                        player.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                      }`}>{player.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📊 Stage Progress
              </h3>
              
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      index + 1 < gameState.currentStage ? 'bg-green-500' :
                      index + 1 === gameState.currentStage ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}></div>
                    <span className={`text-sm ${
                      index + 1 === gameState.currentStage 
                        ? 'font-medium text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification Popups */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-400 text-green-800' :
                notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notification.type === 'warning' && (
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentGame;
