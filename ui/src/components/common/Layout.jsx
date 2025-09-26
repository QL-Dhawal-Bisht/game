import React, { useEffect, useRef } from 'react';
import { CyberpunkAnimations } from '../../utils/animations';

const Layout = ({ children, darkMode = true }) => {
  const containerRef = useRef(null);
  const matrixRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && darkMode) {
      // Create matrix rain effect
      CyberpunkAnimations.createMatrixRain(containerRef.current, {
        count: 25,
        speed: 3,
        chars: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
      });

      // Create data streams
      CyberpunkAnimations.createDataStream(containerRef.current, {
        count: 12,
        colors: ['#00ffff', '#ff007f', '#39ff14', '#0080ff'],
        speed: 4
      });
    }
  }, [darkMode]);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen terminal-font transition-all duration-500 relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-br from-black via-gray-900 to-gray-800'
          : 'bg-gray-50'
      }`}
      style={{
      background: darkMode ? `
        radial-gradient(ellipse at 20% 50%, rgba(77, 208, 225, 0.015) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(229, 115, 115, 0.01) 0%, transparent 50%),
        radial-gradient(ellipse at 40% 80%, rgba(129, 199, 132, 0.01) 0%, transparent 50%),
        linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
      ` : undefined
    }}>

      {/* Matrix Rain Background */}
      {darkMode && <div className="matrix-rain" />}

      {/* Terminal Grid Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: darkMode
            ? `radial-gradient(circle at 1px 1px, rgba(77, 208, 225, 0.08) 1px, transparent 0)`
            : `radial-gradient(circle at 25px 25px, #e5e7eb 2px, transparent 0)`,
          backgroundSize: darkMode ? '50px 50px' : '50px 50px'
        }}></div>
      </div>

      {/* Neon Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Larger ambient glows */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl neon-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-500/3 rounded-full blur-3xl neon-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/2 rounded-full blur-3xl neon-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Small floating particles */}
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-cyan-400 rounded-full neon-glow-cyan animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full neon-glow-pink animate-bounce" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-green-400 rounded-full neon-glow-green animate-bounce" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-blue-400 rounded-full neon-glow-blue animate-bounce" style={{ animationDelay: '1.5s' }}></div>

        {/* Scanning lines effect */}
        <div className="absolute inset-0">
          <div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
            style={{
              top: '20%',
              animation: 'matrix-fall 8s ease-in-out infinite',
              animationDelay: '0s'
            }}
          ></div>
          <div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent"
            style={{
              top: '60%',
              animation: 'matrix-fall 12s ease-in-out infinite',
              animationDelay: '2s'
            }}
          ></div>
        </div>
      </div>

      {/* Content with terminal styling */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
