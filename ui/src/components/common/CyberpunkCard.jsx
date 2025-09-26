import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CyberpunkAnimations } from '../../utils/animations';

const CyberpunkCard = ({
  children,
  className = '',
  glowColor = 'cyan',
  hover3D = true,
  scanEffect = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Add scanning effect
    if (scanEffect) {
      CyberpunkAnimations.createScanEffect(card, {
        color: glowColor === 'cyan' ? '#00ffff' :
               glowColor === 'pink' ? '#ff007f' :
               glowColor === 'green' ? '#39ff14' : '#0080ff',
        duration: 3,
        repeat: -1
      });
    }

    // Add hover animations
    if (hover3D) {
      const handleMouseEnter = () => {
        gsap.to(card, {
          rotationY: 5,
          rotationX: 5,
          z: 50,
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });

        // Add glow effect
        gsap.to(card, {
          boxShadow: `0 20px 40px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.2)`,
          duration: 0.3
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          z: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });

        gsap.to(card, {
          boxShadow: `0 0 0px rgba(0, 255, 255, 0)`,
          duration: 0.3
        });
      };

      const handleMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = (e.clientY - centerY) / 10;
        const rotateY = (centerX - e.clientX) / 10;

        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          duration: 0.1,
          ease: "power2.out"
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('mousemove', handleMouseMove);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [hover3D, scanEffect, glowColor]);

  const handleClick = (e) => {
    if (onClick) {
      // Create click animation
      gsap.to(cardRef.current, {
        scale: 0.98,
        duration: 0.1,
        onComplete: () => {
          gsap.to(cardRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "back.out(1.7)"
          });
        }
      });

      onClick(e);
    }
  };

  const glowClasses = {
    cyan: 'neon-glow-cyan border-cyan-500/30',
    pink: 'neon-glow-pink border-pink-500/30',
    green: 'neon-glow-green border-green-500/30',
    blue: 'neon-glow-blue border-blue-500/30'
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={`
        terminal-panel rounded-xl relative overflow-hidden
        transform-gpu perspective-1000 transition-all duration-300
        ${glowClasses[glowColor] || glowClasses.cyan}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}

      {/* Holographic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none"></div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 L10 20 L15 15 L25 15 L30 20 L40 20" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M20 0 L20 10 L15 15 L15 25 L20 30 L20 40" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="15" cy="15" r="2" fill="currentColor" />
              <circle cx="15" cy="25" r="2" fill="currentColor" />
              <circle cx="25" cy="15" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>
    </div>
  );
};

export default CyberpunkCard;