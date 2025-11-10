'use client';

import { useEffect } from 'react';

interface HealingEffectProps {
  target: 'player' | 'enemy';
  onComplete?: () => void;
}

export function HealingEffect({ onComplete }: HealingEffectProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const glowColor = '#67e8f9';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* 柔らかい円形の光 */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
          filter: 'blur(2px)',
        }}
      />

      {/* リング状の波紋 */}
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200"
          style={{
            animation: 'ping 1.5s ease-out infinite',
            animationDelay: `${index * 0.2}s`,
            opacity: 0.6 - index * 0.15,
            borderColor: glowColor,
          }}
        />
      ))}

      {/* 回復パーティクル */}
      {[...Array(6)].map((_, idx) => (
        <div
          key={idx}
          className="absolute h-8 w-8 rounded-full bg-cyan-200/40 blur-sm"
          style={{
            left: `${40 + Math.random() * 20}%`,
            top: `${40 + Math.random() * 20}%`,
            animation: 'float 1.4s ease-in-out infinite',
            animationDelay: `${idx * 0.1}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes ping {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0.8;
          }
          80% {
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
        }

        @keyframes float {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -120%) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
