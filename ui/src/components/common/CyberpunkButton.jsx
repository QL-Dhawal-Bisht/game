import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CyberpunkAnimations } from '../../utils/animations';

const CyberpunkButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  glitch = false,
  pulse = false,
  disabled = false,
  ...props
}) => {
  const buttonRef = useRef(null);
  const textRef = useRef(null);

  const variants = {
    primary: 'btn-3d text-cyan-300 border-cyan-500/50 hover:border-cyan-400',
    danger: 'btn-3d text-red-300 border-red-500/50 hover:border-red-400',
    success: 'btn-3d text-green-300 border-green-500/50 hover:border-green-400',
    warning: 'btn-3d text-yellow-300 border-yellow-500/50 hover:border-yellow-400'
  };

  useEffect(() => {
    if (buttonRef.current) {
      // Add hologram flicker effect
      if (pulse) {
        CyberpunkAnimations.createHologramFlicker(buttonRef.current, {
          intensity: 0.05,
          speed: 2
        });
      }

      // Add glitch effect to text
      if (glitch && textRef.current) {
        CyberpunkAnimations.createGlitchEffect(textRef.current, {
          intensity: 0.5,
          repeat: -1,
          repeatDelay: 5
        });
      }

      // Add energy pulse
      CyberpunkAnimations.createEnergyPulse(buttonRef.current, {
        color: variant === 'primary' ? '#00ffff' :
              variant === 'danger' ? '#ff0040' :
              variant === 'success' ? '#39ff14' :
              '#ffff00',
        intensity: 0.2,
        duration: 2
      });
    }
  }, [glitch, pulse, variant]);

  const handleClick = (e) => {
    if (disabled) return;

    // Animate button press
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      onComplete: () => {
        gsap.to(buttonRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.7)",
          onComplete: () => onClick?.(e)
        });
      }
    });

    // Create ripple effect
    const rect = buttonRef.current.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10;
    `;

    buttonRef.current.appendChild(ripple);

    gsap.fromTo(ripple,
      { scale: 0, opacity: 1 },
      {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      }
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden terminal-font font-semibold
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      <span ref={textRef} className="relative z-20">
        {children}
      </span>

      {/* Scanning line overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
    </button>
  );
};

export default CyberpunkButton;