'use client';

import { SpecialEffect } from '@/lib/battle-v2/types';

interface ActiveEffectIconsProps {
  effects: SpecialEffect[];
}

const ICON_CONFIG: Record<SpecialEffect['type'], { label: string; color: string }> = {
  buff: { label: '↑', color: '#22d3ee' },
  debuff: { label: '↓', color: '#f87171' },
  extra_damage: { label: '+', color: '#ef4444' },
  drain: { label: '♥', color: '#f472b6' },
};

export function ActiveEffectIcons({ effects }: ActiveEffectIconsProps) {
  if (effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {effects.map((effect, index) => {
        const config = ICON_CONFIG[effect.type] ?? { label: '?', color: '#c084fc' };
        return (
          <div
            key={`${effect.type}-${index}`}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${config.color}20`,
              border: `1px solid ${config.color}60`,
            }}
          >
            <span style={{ color: config.color }}>{config.label}</span>
            <span className="tracking-wide text-white/80">{effect.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
