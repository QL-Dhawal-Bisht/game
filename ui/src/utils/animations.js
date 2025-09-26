import gsap from 'gsap';

// Advanced cyberpunk animation utilities
export class CyberpunkAnimations {
  // Digital glitch effect
  static createGlitchEffect(element, options = {}) {
    const {
      duration = 0.5,
      intensity = 1,
      repeat = -1,
      repeatDelay = 3
    } = options;

    const tl = gsap.timeline({ repeat, repeatDelay });

    tl.to(element, {
      skewX: intensity * 5,
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(element, {
      skewX: -intensity * 3,
      scaleX: 1 + intensity * 0.1,
      duration: 0.05
    })
    .to(element, {
      skewX: intensity * 2,
      scaleX: 1,
      duration: 0.05
    })
    .to(element, {
      skewX: 0,
      duration: 0.1,
      ease: "power2.out"
    });

    return tl;
  }

  // Matrix-style digital rain
  static createMatrixRain(container, options = {}) {
    const {
      count = 20,
      speed = 2,
      chars = '01'
    } = options;

    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'matrix-drop';
      drop.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: -20px;
        color: rgba(0, 255, 255, ${0.3 + Math.random() * 0.7});
        font-family: monospace;
        font-size: ${10 + Math.random() * 10}px;
        pointer-events: none;
        z-index: 1;
      `;
      drop.textContent = chars[Math.floor(Math.random() * chars.length)];

      container.appendChild(drop);

      gsap.to(drop, {
        y: window.innerHeight + 50,
        duration: speed + Math.random() * 3,
        delay: Math.random() * 2,
        ease: "none",
        repeat: -1,
        onRepeat: () => {
          drop.style.left = Math.random() * 100 + '%';
          drop.textContent = chars[Math.floor(Math.random() * chars.length)];
        }
      });
    }
  }

  // Holographic scanning effect
  static createScanEffect(element, options = {}) {
    const {
      color = 'cyan',
      duration = 2,
      repeat = -1
    } = options;

    const scanner = document.createElement('div');
    scanner.className = 'holo-scanner';
    scanner.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${color}, transparent);
      box-shadow: 0 0 10px ${color};
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.appendChild(scanner);

    gsap.fromTo(scanner,
      { x: "-100%" },
      {
        x: "100%",
        duration,
        repeat,
        ease: "power2.inOut",
        repeatDelay: 1
      }
    );

    return scanner;
  }

  // Circuit board trace animation
  static createCircuitTrace(svg, path, options = {}) {
    const {
      color = '#00ffff',
      duration = 2,
      strokeWidth = 2
    } = options;

    const pathLength = path.getTotalLength();

    path.style.stroke = color;
    path.style.strokeWidth = strokeWidth;
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    path.style.fill = 'none';

    gsap.to(path.style, {
      strokeDashoffset: 0,
      duration,
      ease: "power2.out"
    });
  }

  // Hologram flicker effect
  static createHologramFlicker(element, options = {}) {
    const {
      intensity = 0.1,
      speed = 0.5
    } = options;

    const tl = gsap.timeline({ repeat: -1 });

    tl.to(element, {
      opacity: 1 - intensity,
      duration: speed * 0.1,
      ease: "power2.inOut"
    })
    .to(element, {
      opacity: 1,
      duration: speed * 0.1
    })
    .to(element, {
      opacity: 1 - intensity * 0.5,
      duration: speed * 0.05
    })
    .to(element, {
      opacity: 1,
      duration: speed * 0.85,
      ease: "power2.out"
    });

    return tl;
  }

  // Energy pulse effect
  static createEnergyPulse(element, options = {}) {
    const {
      color = 'cyan',
      intensity = 0.3,
      duration = 1.5
    } = options;

    const pulse = document.createElement('div');
    pulse.className = 'energy-pulse';
    pulse.style.cssText = `
      position: absolute;
      inset: -10px;
      border: 2px solid transparent;
      border-radius: inherit;
      background: linear-gradient(45deg, transparent, ${color}40, transparent);
      opacity: 0;
      pointer-events: none;
    `;

    element.style.position = 'relative';
    element.appendChild(pulse);

    const tl = gsap.timeline({ repeat: -1 });

    tl.to(pulse, {
      opacity: intensity,
      scale: 1.05,
      duration: duration * 0.5,
      ease: "power2.out"
    })
    .to(pulse, {
      opacity: 0,
      scale: 1,
      duration: duration * 0.5,
      ease: "power2.in"
    });

    return tl;
  }

  // Typewriter effect with glitch
  static createTypewriterGlitch(element, text, options = {}) {
    const {
      speed = 100,
      glitchChance = 0.1,
      glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    } = options;

    let currentText = '';
    let index = 0;

    const type = () => {
      if (index < text.length) {
        const char = text[index];

        // Random glitch effect
        if (Math.random() < glitchChance) {
          const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          element.textContent = currentText + glitchChar;

          setTimeout(() => {
            currentText += char;
            element.textContent = currentText;
            index++;
            setTimeout(type, speed);
          }, 50);
        } else {
          currentText += char;
          element.textContent = currentText;
          index++;
          setTimeout(type, speed);
        }
      }
    };

    element.textContent = '';
    type();
  }

  // Data stream visualization
  static createDataStream(container, options = {}) {
    const {
      count = 15,
      colors = ['#4dd0e1', '#e57373', '#81c784'],
      speed = 3
    } = options;

    for (let i = 0; i < count; i++) {
      const stream = document.createElement('div');
      stream.className = 'data-stream';
      stream.style.cssText = `
        position: absolute;
        width: 2px;
        height: 20px;
        background: linear-gradient(to bottom, transparent, ${colors[i % colors.length]});
        left: ${Math.random() * 100}%;
        top: -30px;
        opacity: 0.7;
        pointer-events: none;
      `;

      container.appendChild(stream);

      gsap.to(stream, {
        y: window.innerHeight + 50,
        duration: speed + Math.random() * 2,
        delay: Math.random() * 2,
        ease: "none",
        repeat: -1,
        onRepeat: () => {
          stream.style.left = Math.random() * 100 + '%';
          stream.style.background = `linear-gradient(to bottom, transparent, ${colors[Math.floor(Math.random() * colors.length)]})`;
        }
      });
    }
  }
}

// Utility functions for common animations
export const animateStagger = (elements, animation, stagger = 0.1) => {
  return gsap.fromTo(elements,
    animation.from,
    {
      ...animation.to,
      stagger
    }
  );
};

export const animateOnScroll = (element, animation, trigger = "top 80%") => {
  return gsap.fromTo(element,
    animation.from,
    {
      ...animation.to,
      scrollTrigger: {
        trigger: element,
        start: trigger,
        toggleActions: "play none none reverse"
      }
    }
  );
};