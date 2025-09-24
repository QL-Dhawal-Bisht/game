import React, { useState } from 'react';
import CreateTournament from '../components/tournament/CreateTournament';
import JoinTournament from '../components/tournament/JoinTournament';
import TournamentLobby from '../components/tournament/TournamentLobby';
import TournamentGame from '../components/tournament/TournamentGame';
import { useAuth } from '../hooks/useAuth';

const TournamentPage = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('main'); // main, create, join, lobby, game
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentResults, setTournamentResults] = useState(null);

  const handleTournamentCreated = (data) => {
    setTournamentData(data);
    setCurrentView('lobby');
  };

  const handleTournamentJoined = (data) => {
    setTournamentData(data);
    setCurrentView('lobby');
  };

  const handleTournamentStart = (data) => {
    setCurrentView('game');
  };

  const handleTournamentComplete = (data) => {
    setTournamentResults(data);
    setCurrentView('results');
  };

  const renderTournamentResults = () => {
    const isWinner = tournamentResults?.winner === user?.username;
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Confetti Animation Background */}
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-transparent to-purple-50 dark:from-yellow-900/20 dark:to-purple-900/20"></div>
          {/* Floating particles */}
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-75"></div>
          <div className="absolute top-40 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
          <div className="absolute top-60 right-1/3 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-60 right-10 w-4 h-4 bg-indigo-400 rounded-full animate-bounce delay-500"></div>
        </div>

        {/* Main Results Card */}
        <div className="relative z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 p-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
            
            {/* Trophy Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
                  </svg>
                </div>
                {/* Glowing effect */}
                <div className="absolute inset-0 w-24 h-24 bg-yellow-400 rounded-full blur-lg opacity-30 animate-pulse mx-auto"></div>
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                🏆 TOURNAMENT COMPLETE! 🏆
              </h1>
              
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 mx-auto rounded-full"></div>
            </div>

            {/* Winner Announcement */}
            <div className="text-center mb-8">
              <div className={`inline-block p-6 rounded-2xl shadow-lg mb-6 ${
                isWinner 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-600' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-600'
              }`}>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isWinner ? 'bg-green-500' : 'bg-blue-500'
                  } shadow-lg`}>
                    {isWinner ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <h2 className={`text-3xl font-bold ${
                      isWinner ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      {isWinner ? 'CONGRATULATIONS!' : 'TOURNAMENT CHAMPION'}
                    </h2>
                    <p className={`text-xl ${
                      isWinner ? 'text-green-600 dark:text-green-300' : 'text-blue-600 dark:text-blue-300'
                    }`}>
                      {isWinner ? 'You are the winner!' : `Winner: ${tournamentResults?.winner || 'Unknown'}`}
                    </p>
                  </div>
                </div>

                {/* Winner Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tournamentResults?.winner || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Champion</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {tournamentResults?.finalScore || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Final Score</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {tournamentData?.participants?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Players</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
                  </svg>
                </div>
                <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">Champion</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-purple-800 dark:text-purple-200">Speed Master</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-green-800 dark:text-green-200">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-200">Tournament</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentView('main');
                  setTournamentResults(null);
                  setTournamentData(null);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Tournament Menu
              </button>
              
              <button
                onClick={() => setCurrentView('create')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Tournament
              </button>
            </div>

            {/* Fun Message */}
            <div className="text-center mt-8 p-4 bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 dark:from-yellow-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                🎉 Congratulations on completing the AI Escape Room Tournament! 🎉
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isWinner 
                  ? "You've proven yourself as the ultimate AI whisperer! Ready for another challenge?"
                  : "Great job participating! Every attempt makes you stronger. Try again to claim victory!"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainMenu = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🏆 Tournament Mode
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Challenge other players in real-time prompt injection battles. Create or join tournaments
          to compete for the top spot on the leaderboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Create Tournament Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Tournament</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set up a new tournament and invite players to compete
            </p>
          </div>
          <button
            onClick={() => setCurrentView('create')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Create New Tournament
          </button>
        </div>

        {/* Join Tournament Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Join Tournament</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find and join existing tournaments with other players
            </p>
          </div>
          <button
            onClick={() => setCurrentView('join')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Join Tournament
          </button>
        </div>
      </div>

      {/* Tournament Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tournament Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Real-time Competition</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Compete live against other players</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Leaderboard</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track scores and rankings</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Time Pressure</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Race against the clock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackButton = () => (
    <button
      onClick={() => setCurrentView('main')}
      className="mb-6 flex items-center text-indigo-600 hover:text-indigo-500 transition-colors"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Tournament Menu
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto">
        {currentView === 'main' && renderMainMenu()}
        
        {currentView === 'create' && (
          <div>
            {renderBackButton()}
            <CreateTournament onTournamentCreated={handleTournamentCreated} />
          </div>
        )}
        
        {currentView === 'join' && (
          <div>
            {renderBackButton()}
            <JoinTournament onTournamentJoined={handleTournamentJoined} />
          </div>
        )}
        
        {currentView === 'lobby' && tournamentData && (
          <div>
            {renderBackButton()}
            <TournamentLobby 
              tournamentData={tournamentData} 
              onTournamentStart={handleTournamentStart}
            />
          </div>
        )}

        {currentView === 'game' && tournamentData && (
          <TournamentGame 
            tournamentData={tournamentData} 
            onTournamentComplete={handleTournamentComplete}
          />
        )}

        {currentView === 'results' && tournamentResults && (
          <div>
            {renderTournamentResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;