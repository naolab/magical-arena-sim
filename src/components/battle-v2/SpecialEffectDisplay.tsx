'use client';

import { SpecialEffect } from '@/lib/battle-v2/types';
import { getEffectDescription } from '@/lib/battle-v2/specialEffects';
import { getEmotionColor } from '@/lib/battle-v2/emotionSystem';

interface SpecialEffectDisplayProps {
  effects: SpecialEffect[];
  target: 'player' | 'enemy';
}

export function SpecialEffectDisplay({ effects, target }: SpecialEffectDisplayProps) {
  if (effects.length === 0) {
    return null;
  }

  const targetName = target === 'player' ? 'プレイヤー' : '敵';
  const targetColor = target === 'player' ? '#3b82f6' : '#ef4444';

  return (
    <div
      className="flex flex-col gap-2 rounded-xl p-3 backdrop-blur-sm"
      style={{ backgroundColor: `${targetColor}20`, border: `1px solid ${targetColor}40` }}
    >
      <div className="text-sm font-bold text-white">
        {targetName}の効果
      </div>

      <div className="flex flex-col gap-1">
        {effects.map((effect, index) => {
          const color = getEmotionColor(effect.emotion);
          const description = getEffectDescription(effect);

          return (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg p-2 text-xs text-white"
              style={{ backgroundColor: `${color}30` }}
            >
              {/* エフェクトアイコン */}
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: color }}
              >
                {effect.type === 'buff' ? '↑' : '↓'}
              </div>

              {/* 説明 */}
              <div className="flex-1">{description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
