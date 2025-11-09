'use client';

import { type ComponentType } from 'react';
import { SpecialEffect } from '@/lib/battle-v2/types';
import { ShieldIcon, SparkIcon, SkullIcon, PoisonIcon } from './icons';

interface ActiveEffectIconsProps {
  effects: SpecialEffect[];
}

type IconConfig = {
  color: string;
  Icon: ComponentType<{ className?: string }>;
};

const ICON_CONFIG: Partial<Record<SpecialEffect['type'], IconConfig>> = {
  buff: { color: '#d97706', Icon: SparkIcon }, // より濃いオレンジ
  debuff: { color: '#15803d', Icon: SkullIcon }, // より濃い緑
  poison: { color: '#a855f7', Icon: PoisonIcon }, // 紫
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
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white border shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            style={{
              background: `linear-gradient(135deg, ${config.color}99 0%, ${config.color}77 80%)`,
              borderColor: `${config.color}`,
            }}
          >
            <config.Icon className="h-4 w-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" style={{ color: config.color }} />
            <span className="tracking-wide">{effect.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
