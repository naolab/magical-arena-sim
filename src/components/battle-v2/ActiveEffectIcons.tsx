'use client';

import { SpecialEffect } from '@/lib/battle-v2/types';
import { ShieldIcon, SparkIcon, SkullIcon } from './icons';

interface ActiveEffectIconsProps {
  effects: SpecialEffect[];
}

const ICON_CONFIG: Partial<Record<SpecialEffect['type'], { color: string; Icon: React.ComponentType<{ className?: string }> }>> = {
  buff: { color: '#facc15', Icon: SparkIcon },
  debuff: { color: '#4ade80', Icon: SkullIcon },
};

export function ActiveEffectIcons({ effects }: ActiveEffectIconsProps) {
  if (effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {effects.map((effect, index) => {
        const config = ICON_CONFIG[effect.type] ?? { color: '#c084fc', Icon: ShieldIcon };
        return (
          <div
            key={`${effect.type}-${index}`}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${config.color}20`,
              border: `1px solid ${config.color}60`,
            }}
          >
            <config.Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
            <span className="tracking-wide text-white/80">{effect.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
