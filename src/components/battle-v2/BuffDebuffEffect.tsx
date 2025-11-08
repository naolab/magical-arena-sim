'use client';

import { useEffect, useState } from 'react';

interface BuffDebuffEffectProps {
  type: 'buff' | 'debuff';
  target: 'player' | 'enemy';
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
}

export function BuffDebuffEffect({ type, target, onComplete }: BuffDebuffEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // パーティクルを生成（5個の矢印）
    const newParticles: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // -50px ~ +50px のランダムな横位置
      delay: i * 0.1, // 0.1秒ずつずらして出現
    }));
    setParticles(newParticles);

    // 1.5秒後に完了コールバック
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const isBuff = type === 'buff';
  const color = isBuff ? '#f59e0b' : '#8b5cf6'; // バフ=オレンジ、デバフ=紫
  const arrow = isBuff ? '↑' : '↓';
  const animationClass = isBuff ? 'buff-particle' : 'debuff-particle';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* キラキラ背景フラッシュ */}
      <div
        className="absolute inset-0 animate-flash"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        }}
      />

      {/* 矢印パーティクル */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${animationClass}`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            marginLeft: `${particle.x}px`,
            animationDelay: `${particle.delay}s`,
            color: color,
            fontSize: '48px',
            fontWeight: 'bold',
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          }}
        >
          {arrow}
        </div>
      ))}
    </div>
  );
}
