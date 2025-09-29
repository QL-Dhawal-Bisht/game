import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, User, Trophy, BarChart3, MessageSquare, Play,
  Home, Users, Target, Zap, Brain, Lock, Unlock, Key,
  ChevronRight, Code, Database, Settings, Crown,
  AlertTriangle, CheckCircle, Bot, Star
} from 'lucide-react';
import { apiGet } from '../utils/api';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from '../components/common/Header';
import Layout from '../components/common/Layout';
import Navigation from '../components/common/Navigation';
import CyberpunkButton from '../components/common/CyberpunkButton';
import CyberpunkCard from '../components/common/CyberpunkCard';
import gsap from 'gsap';

const DashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // GSAP refs
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const stagesRef = useRef(null);
  const progressRef = useRef(null);
  const buttonRef = useRef(null);

  // Advanced GSAP animations
  useEffect(() => {
    if (!loading && !error) {
      const ctx = gsap.context(() => {
        // Hero section entrance
        gsap.fromTo(heroRef.current,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "back.out(1.7)" }
        );

        // Button pulse effect
        gsap.to(buttonRef.current, {
          scale: 1.05,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });

        // Cards staggered animation
        gsap.fromTo(".feature-card",
          { opacity: 0, y: 30, rotationY: -15 },
          {
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.5
          }
        );

        // Stages entrance with morphing effect
        if (stages.length > 0) {
          gsap.fromTo(".stage-item",
            { opacity: 0, x: -50, skewX: 10 },
            {
              opacity: 1,
              x: 0,
              skewX: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: "power2.out",
              delay: 1
            }
          );
        }

        // Progress stats counter animation
        if (profile) {
          gsap.fromTo(".stat-number",
            { innerText: 0 },
            {
              innerText: (i, el) => parseInt(el.dataset.value),
              duration: 1.5,
              snap: { innerText: 1 },
              ease: "power2.out",
              delay: 1.5
            }
          );
        }

      });

      return () => ctx.revert();
    }
  }, [loading, error, stages, profile]);

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

  const handleStartGame = () => {
    // Animate button press with GSAP
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      onComplete: () => {
        gsap.to(buttonRef.current, {
          scale: 1.05,
          duration: 0.2,
          onComplete: () => navigate('/game')
        });
      }
    });
  };

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


  return (
    <Layout darkMode={darkMode}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation darkMode={darkMode} />

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 blur-3xl -z-10"></div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 neon-spinner"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="terminal-panel p-4 rounded-xl border-red-500/50 text-red-400 neon-glow-pink inline-block">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-12">
            <div
              ref={heroRef}
              className="text-center relative"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl terminal-panel neon-glow-cyan mb-6">
                  <Brain className="h-10 w-10 text-cyan-400 neon-pulse" />
                </div>
                <h2 className="text-4xl font-bold mb-4 text-white glitch" data-text="AI ESCAPE ROOM">
                  AI ESCAPE ROOM
                </h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto text-cyan-300 terminal-font">
                  {'> Infiltrate AI systems. Extract keys. Escape the digital prison.'}
                </p>
              </div>
            </div>

            <div className="flex justify-center min-h-[60vh] items-center">
              <CyberpunkButton
                ref={buttonRef}
                onClick={handleStartGame}
                className="inline-flex items-center justify-center px-12 py-6 rounded-xl relative text-xl"
                variant="primary"
                glitch={true}
                pulse={true}
              >
                [ ENTER THE MATRIX ]
              </CyberpunkButton>
            </div>

            {stages.length > 0 && (
              <div
                ref={stagesRef}
                className="terminal-panel p-8 rounded-xl room-door"
              >
                <h3 className="text-2xl font-bold mb-6 text-cyan-300 terminal-font flex items-center gap-3">
                  <Target className="h-8 w-8 text-pink-400 neon-glow-pink" />
                  [ SECURITY LEVELS ]
                </h3>
                <div className="space-y-6">
                  {stages.map((stage, i) => (
                    <div
                      key={i}
                      className="stage-item room-door flex justify-between items-start p-6 rounded-xl terminal-panel"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 terminal-panel neon-glow-green rounded-full flex items-center justify-center text-green-400 font-bold text-sm terminal-font">
                            {stage.stage}
                          </div>
                          <div className="font-bold text-lg text-cyan-300 terminal-font">{stage.character}</div>
                        </div>
                        <div className="text-gray-300 leading-relaxed terminal-font">{stage.story}</div>
                      </div>
                      <div className="text-right ml-6">
                        <div className={`px-4 py-2 rounded-full text-sm font-bold mb-2 ${getDifficultyColor(stage.difficulty)}`}>{stage.difficulty}</div>
                        <div className="text-sm font-medium text-green-400 terminal-font">{stage.total_keys} keys to extract</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile && (
              <div
                ref={progressRef}
                className="terminal-panel p-8 rounded-xl room-door"
              >
                <h3 className="text-xl font-semibold mb-6 text-cyan-300 terminal-font">[ OPERATIVE STATUS ]</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="stat-number text-3xl font-bold mb-1 text-cyan-400 neon-glow-cyan terminal-font" data-value={profile.games_played || 0}>0</div>
                    <div className="text-sm text-gray-400 terminal-font">INFILTRATIONS</div>
                  </div>
                  <div className="text-center">
                    <div className="stat-number text-3xl font-bold mb-1 text-pink-400 neon-glow-pink terminal-font" data-value={profile.total_score || 0}>0</div>
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
