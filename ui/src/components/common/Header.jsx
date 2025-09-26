import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun, LogOut, Zap, Shield, Terminal, Activity, Power } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import gsap from 'gsap';

const Header = ({ darkMode = true, setDarkMode }) => {
  const { user, logout } = useAuth();
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const scanLineRef = useRef(null);
  const statusRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // GSAP Header animations
    const ctx = gsap.context(() => {
      // Title glitch animation
      gsap.fromTo(titleRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
      );

      // Continuous scanning line animation
      gsap.fromTo(scanLineRef.current,
        { x: "-100%" },
        {
          x: "100%",
          duration: 3,
          repeat: -1,
          ease: "none",
          repeatDelay: 2
        }
      );

      // Status indicator pulse
      gsap.to(statusRef.current, {
        opacity: 0.5,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });

    }, headerRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    // Animate logout with GSAP
    gsap.to(headerRef.current, {
      scale: 0.95,
      opacity: 0.7,
      duration: 0.2,
      onComplete: () => {
        logout();
        gsap.to(headerRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.3
        });
      }
    });
  };

  return (
    <header
      ref={headerRef}
      className="terminal-panel backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-50 overflow-hidden"
    >
      {/* Scanning line effect */}
      <div
        ref={scanLineRef}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and System Status */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {/* System logo with animation */}
              <div className="relative">
                <div className="w-8 h-8 terminal-panel neon-glow-cyan rounded border border-cyan-500/50 flex items-center justify-center">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" ref={statusRef}></div>
              </div>

              {/* Title with glitch effect */}
              <h1
                ref={titleRef}
                className="text-xl font-bold text-cyan-300 terminal-font glitch"
                data-text="NEXUS TERMINAL"
              >
                NEXUS TERMINAL
              </h1>
            </div>

            {/* System stats */}
            <div className="hidden md:flex items-center space-x-4 text-xs terminal-font">
              <div className="flex items-center space-x-1 text-green-400">
                <Activity className="h-3 w-3" />
                <span>ONLINE</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-cyan-400">{currentTime}</div>
            </div>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 terminal-panel px-3 py-1 rounded neon-glow-blue">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300 terminal-font">
                  AGENT: {user.username.toUpperCase()}
                </span>
              </div>
            )}

            {/* Theme toggle - disabled but styled */}
            <button
              className="btn-3d p-2 rounded-lg terminal-font text-xs opacity-50 cursor-not-allowed"
              disabled
              title="Matrix Mode Active"
            >
              <Moon className="h-4 w-4 text-cyan-400" />
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="btn-3d p-2 rounded-lg group relative overflow-hidden"
                title="Emergency Exit"
              >
                <Power className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border scanning effect */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse"></div>
    </header>
  );
};

export default Header;
