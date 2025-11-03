import React from 'react';

const Ball = ({ width = 400, height = 400, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 400" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients for dark mode (isDark = true) */}
        
        {/* Main orb: bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-teal-300 */}
        <linearGradient id="mainOrbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#e879f9', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#5eead4', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Outer glow ring 1: bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-teal-500/20 */}
        <linearGradient id="glowRing1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.2 }} />
          <stop offset="50%" style={{ stopColor: '#d946ef', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 0.2 }} />
        </linearGradient>
        
        {/* Outer glow ring 2: bg-gradient-to-r from-indigo-400/15 via-fuchsia-400/15 to-teal-400/15 */}
        <linearGradient id="glowRing2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 0.15 }} />
          <stop offset="50%" style={{ stopColor: '#e879f9', stopOpacity: 0.15 }} />
          <stop offset="100%" style={{ stopColor: '#2dd4bf', stopOpacity: 0.15 }} />
        </linearGradient>
        
        {/* Energy line: bg-gradient-to-b from-indigo-400/60 to-transparent */}
        <linearGradient id="energyLine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 0 }} />
        </linearGradient>
        
        {/* Light sweep: bg-gradient-to-r from-transparent via-white/20 to-transparent */}
        <linearGradient id="lightSweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </linearGradient>
        
        {/* Inner shine: bg-gradient-to-tr from-white/20 via-transparent to-transparent */}
        <linearGradient id="innerShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
          <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </linearGradient>
        
        {/* Core glow: bg-gradient-to-br from-white/10 to-transparent */}
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </radialGradient>
        
        {/* Central energy: bg-gradient-to-br from-white/15 to-transparent */}
        <radialGradient id="centralEnergy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.15 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </radialGradient>
        
        {/* Holographic overlay: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%) */}
        <linearGradient id="holographic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
          <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.05 }} />
        </linearGradient>
        
        {/* Shadow filter: shadow-[0_0_60px_rgba(99,102,241,.8),0_0_120px_rgba(168,85,247,.4)] */}
        <filter id="orbShadow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="blur1" />
          <feFlood floodColor="#6366f1" floodOpacity="0.8" result="color1" />
          <feComposite in="color1" in2="blur1" operator="in" result="shadow1" />
          
          <feGaussianBlur in="SourceAlpha" stdDeviation="30" result="blur2" />
          <feFlood floodColor="#a855f7" floodOpacity="0.4" result="color2" />
          <feComposite in="color2" in2="blur2" operator="in" result="shadow2" />
          
          <feMerge>
            <feMergeNode in="shadow2" />
            <feMergeNode in="shadow1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Blur filter for glow rings (filter: blur(8px) and blur(12px) from pulseGlow animation) */}
        <filter id="blurFilter8">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>
        
        <filter id="blurFilter12">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
        </filter>
        
        {/* Clip path for orb */}
        <clipPath id="orbClip">
          <circle cx="200" cy="200" r="100" />
        </clipPath>
        
        {/* All animations from App.jsx */}
        <style>{`
          @keyframes pulseGlow { 
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.3; 
            } 
            50% { 
              transform: scale(1.2); 
              opacity: 0.6; 
            } 
          }
          @keyframes orbFloat { 
            0%, 100% { transform: translateY(0px) scale(1); } 
            50% { transform: translateY(-10px) scale(1.05); } 
          }
          @keyframes spinSlow { 
            to { transform: rotate(360deg); } 
          }
          @keyframes spinReverse { 
            to { transform: rotate(-360deg); } 
          }
          @keyframes floatParticle { 
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1); 
              opacity: 0.6; 
            } 
            25% { 
              transform: translateY(-15px) translateX(5px) scale(1.2); 
              opacity: 1; 
            } 
            50% { 
              transform: translateY(-25px) translateX(-5px) scale(0.8); 
              opacity: 0.8; 
            } 
            75% { 
              transform: translateY(-10px) translateX(8px) scale(1.1); 
              opacity: 0.9; 
            } 
          }
          @keyframes energyLine { 
            0%, 100% { 
              transform: scaleY(0.3); 
              opacity: 0.3; 
            } 
            50% { 
              transform: scaleY(1.2); 
              opacity: 0.8; 
            } 
          }
          @keyframes lightSweep { 
            0% { 
              transform: translateX(-100%) rotate(0deg); 
              opacity: 0; 
            } 
            50% { 
              opacity: 1; 
            } 
            100% { 
              transform: translateX(100%) rotate(180deg); 
              opacity: 0; 
            } 
          }
          @keyframes corePulse { 
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.6; 
            } 
            50% { 
              transform: scale(1.1); 
              opacity: 1; 
            } 
          }
          @keyframes dataStream { 
            0% { 
              transform: rotate(0deg) scale(1); 
              opacity: 0.3; 
            } 
            25% { 
              opacity: 0.6; 
            } 
            50% { 
              transform: rotate(180deg) scale(1.05); 
              opacity: 0.4; 
            } 
            75% { 
              opacity: 0.7; 
            } 
            100% { 
              transform: rotate(360deg) scale(1); 
              opacity: 0.3; 
            } 
          }
          
          .animate-pulse-glow { 
            animation: pulseGlow 4s ease-in-out infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .animate-pulse-glow-delayed { 
            animation: pulseGlow 4s ease-in-out infinite 1s; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .animate-orb-float { 
            animation: orbFloat 6s ease-in-out infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .animate-spin-slow { 
            animation: spinSlow 14s linear infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .animate-spin-reverse { 
            animation: spinReverse 12s linear infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .particle { 
            animation: floatParticle 3s ease-in-out infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .energy-line { 
            animation: energyLine 2s ease-in-out infinite; 
            transform-origin: center bottom; 
            transform-box: fill-box;
          }
          .light-sweep { 
            animation: lightSweep 3s ease-in-out infinite; 
          }
          .core-pulse { 
            animation: corePulse 2s ease-in-out infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
          .data-stream { 
            animation: dataStream 8s linear infinite; 
            transform-origin: center; 
            transform-box: fill-box;
          }
        `}</style>
      </defs>
      
      {/* Background (transparent for SVG) */}
      <rect width="400" height="400" fill="transparent" />
      
      {/* Center at 200,200 (w-20 h-20 = 80px, so center is at 40px, scaled 2.5x = 100px radius) */}
      <g transform="translate(200, 200)">
        
        {/* Outer glow rings: absolute -inset-6 and -inset-4 (with blur filter) */}
        <g className="animate-pulse-glow" filter="url(#blurFilter8)">
          <circle cx="0" cy="0" r="160" fill="url(#glowRing1)" opacity="0.3" />
        </g>
        <g className="animate-pulse-glow-delayed" filter="url(#blurFilter12)">
          <circle cx="0" cy="0" r="140" fill="url(#glowRing2)" opacity="0.3" />
        </g>
        
        {/* Data stream rings: absolute -inset-8 w-36 h-36 (3 rings: 80px, 100px, 120px) */}
        <g className="data-stream" style={{ animationDuration: '8s', animationDelay: '0s' }}>
          <circle cx="0" cy="0" r="200" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" strokeDasharray="10,10" />
        </g>
        <g className="data-stream" style={{ animationDuration: '10s', animationDelay: '0.5s' }}>
          <circle cx="0" cy="0" r="250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" strokeDasharray="10,10" />
        </g>
        <g className="data-stream" style={{ animationDuration: '12s', animationDelay: '1s' }}>
          <circle cx="0" cy="0" r="300" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" strokeDasharray="10,10" />
        </g>
        
        {/* Energy field lines: 6 lines (w-px h-8 = 1px x 32px, at radius 35px) */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <g key={`energy-${i}`} transform={`rotate(${angle})`}>
            <rect 
              x="-1.25" 
              y="-87.5" 
              width="2.5" 
              height="80" 
              fill="url(#energyLine)" 
              className="energy-line" 
              style={{ 
                animationDelay: `${i * 0.3}s`, 
                animationDuration: `${2 + i * 0.2}s` 
              }} 
            />
          </g>
        ))}
        
        {/* Floating particles: 12 main particles */}
        {[
          { cx: 0, cy: -62.5, r: 8, opacity: 0.8, delay: '0s', duration: '3s' },
          { cx: 54.13, cy: -31.25, r: 7, opacity: 0.75, delay: '0.15s', duration: '3.2s' },
          { cx: 54.13, cy: 31.25, r: 6, opacity: 0.7, delay: '0.3s', duration: '3.4s' },
          { cx: 0, cy: 62.5, r: 8, opacity: 0.8, delay: '0.45s', duration: '3.6s' },
          { cx: -54.13, cy: 31.25, r: 7, opacity: 0.75, delay: '0.6s', duration: '3.8s' },
          { cx: -54.13, cy: -31.25, r: 6, opacity: 0.7, delay: '0.75s', duration: '4s' },
          { cx: 37.5, cy: -50, r: 7, opacity: 0.75, delay: '0.9s', duration: '4.2s' },
          { cx: 62.5, cy: 0, r: 8, opacity: 0.8, delay: '1.05s', duration: '4.4s' },
          { cx: 37.5, cy: 50, r: 6, opacity: 0.7, delay: '1.2s', duration: '4.6s' },
          { cx: -37.5, cy: 50, r: 7, opacity: 0.75, delay: '1.35s', duration: '4.8s' },
          { cx: -62.5, cy: 0, r: 8, opacity: 0.8, delay: '1.5s', duration: '5s' },
          { cx: -37.5, cy: -50, r: 6, opacity: 0.7, delay: '1.65s', duration: '5.2s' },
        ].map((particle, i) => (
          <circle 
            key={`particle-${i}`}
            cx={particle.cx} 
            cy={particle.cy} 
            r={particle.r} 
            fill={`rgba(255,255,255,${particle.opacity})`} 
            className="particle" 
            style={{ 
              animationDelay: particle.delay, 
              animationDuration: particle.duration 
            }}
          >
            <animate 
              attributeName="opacity" 
              values="0.6;1;0.6" 
              dur={particle.duration} 
              repeatCount="indefinite" 
            />
          </circle>
        ))}
        
        {/* Additional smaller particles scattered around */}
        {[
          { cx: -80, cy: -90, r: 4, opacity: 0.5, delay: '0.2s', duration: '4.5s', values: '0.4;0.8;0.4' },
          { cx: -95, cy: -70, r: 3, opacity: 0.45, delay: '0.8s', duration: '5.5s', values: '0.3;0.7;0.3' },
          { cx: -70, cy: -110, r: 5, opacity: 0.55, delay: '1.3s', duration: '4.8s', values: '0.4;0.9;0.4' },
          { cx: 85, cy: -85, r: 4, opacity: 0.5, delay: '0.5s', duration: '4.2s', values: '0.4;0.8;0.4' },
          { cx: 100, cy: -65, r: 3, opacity: 0.45, delay: '1.1s', duration: '5.8s', values: '0.3;0.7;0.3' },
          { cx: -110, cy: -30, r: 4, opacity: 0.5, delay: '0.7s', duration: '4.6s', values: '0.4;0.8;0.4' },
          { cx: -120, cy: 10, r: 3, opacity: 0.45, delay: '1.4s', duration: '5.3s', values: '0.3;0.7;0.3' },
          { cx: 115, cy: -20, r: 4, opacity: 0.5, delay: '0.4s', duration: '4.9s', values: '0.4;0.8;0.4' },
          { cx: 125, cy: 15, r: 3, opacity: 0.45, delay: '1.7s', duration: '5.1s', values: '0.3;0.7;0.3' },
          { cx: -85, cy: 95, r: 4, opacity: 0.5, delay: '0.6s', duration: '4.4s', values: '0.4;0.8;0.4' },
          { cx: 90, cy: 90, r: 4, opacity: 0.5, delay: '1.2s', duration: '4.7s', values: '0.4;0.8;0.4' },
          { cx: -130, cy: -50, r: 2, opacity: 0.35, delay: '0.9s', duration: '6s', values: '0.2;0.6;0.2' },
          { cx: 135, cy: -45, r: 2, opacity: 0.35, delay: '1.6s', duration: '6.2s', values: '0.2;0.6;0.2' },
          { cx: -100, cy: 110, r: 2, opacity: 0.35, delay: '0.3s', duration: '5.9s', values: '0.2;0.6;0.2' },
          { cx: 105, cy: 105, r: 2, opacity: 0.35, delay: '1.8s', duration: '6.1s', values: '0.2;0.6;0.2' },
        ].map((particle, i) => (
          <circle 
            key={`extra-particle-${i}`}
            cx={particle.cx} 
            cy={particle.cy} 
            r={particle.r} 
            fill={`rgba(255,255,255,${particle.opacity})`} 
            className="particle" 
            style={{ 
              animationDelay: particle.delay, 
              animationDuration: particle.duration 
            }}
          >
            <animate 
              attributeName="opacity" 
              values={particle.values} 
              dur={particle.duration} 
              repeatCount="indefinite" 
              begin={particle.delay}
            />
          </circle>
        ))}
        
        {/* Main orb container with floating animation */}
        <g className="animate-orb-float">
          {/* Main orb sphere */}
          <circle cx="0" cy="0" r="100" fill="url(#mainOrbGradient)" filter="url(#orbShadow)" />
          
          {/* Light sweep overlay */}
          <g clipPath="url(#orbClip)">
            <rect x="-200" y="-100" width="400" height="200" fill="url(#lightSweep)" className="light-sweep" transform="skewX(-12)" />
          </g>
          
          {/* Inner shine effect */}
          <circle cx="0" cy="0" r="95" fill="url(#innerShine)" />
          
          {/* Core glow with pulse */}
          <circle cx="0" cy="0" r="90" fill="url(#coreGlow)" className="core-pulse" />
          
          {/* Central energy core */}
          <circle cx="0" cy="0" r="85" fill="url(#centralEnergy)" />
          
          {/* Holographic overlay */}
          <circle cx="0" cy="0" r="100" fill="url(#holographic)" style={{ backdropFilter: 'blur(1px)' }} />
        </g>
        
        {/* Rotating outer ring */}
        <g className="animate-spin-slow">
          <circle cx="0" cy="0" r="107.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" strokeDasharray="15,15" />
        </g>
        
        {/* Inner rotating ring */}
        <g className="animate-spin-reverse">
          <circle cx="0" cy="0" r="102.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeDasharray="10,10" />
        </g>
        
      </g>
    </svg>
  );
};

export default Ball;

