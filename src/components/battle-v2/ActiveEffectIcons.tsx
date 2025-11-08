'use client';

import { type ComponentType } from 'react';
import { SpecialEffect } from '@/lib/battle-v2/types';
import { ShieldIcon, SparkIcon, SkullIcon } from './icons';

interface ActiveEffectIconsProps {
  effects: SpecialEffect[];
}

type IconConfig = {
  color: string;
  Icon: ComponentType<{ className?: string }>;
};

const ICON_CONFIG: Partial<Record<SpecialEffect['type'], IconConfig>> = {
  buff: { color: '#f59e0b', Icon: SparkIcon }, // 濃いめの黄色
  debuff: { color: '#16a34a', Icon: SkullIcon }, // 濃いめの緑
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
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white/90 border"
            style={{
              background: `linear-gradient(135deg, ${config.color}55 0%, ${config.color}15 100%)`,
              borderColor: `${config.color}aa`,
            }}
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
              <config.Icon className="h-3 w-3" style={{ color: config.color }} />
            </div>
            <span className="tracking-wide">{effect.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
