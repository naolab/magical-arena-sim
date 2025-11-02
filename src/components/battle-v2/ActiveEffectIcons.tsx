'use client';

import { type ComponentType, useMemo } from 'react';
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
  buff: { color: '#facc15', Icon: SparkIcon },
  debuff: { color: '#4ade80', Icon: SkullIcon },
};

export function ActiveEffectIcons({ effects }: ActiveEffectIconsProps) {
  if (effects.length === 0) return null;

  const grouped = useMemo(() => {
    const map = new Map<SpecialEffect['type'], { count: number; maxDuration: number }>();
    for (const effect of effects) {
      const entry = map.get(effect.type) ?? { count: 0, maxDuration: 0 };
      entry.count += 1;
      entry.maxDuration = Math.max(entry.maxDuration, effect.duration);
      map.set(effect.type, entry);
    }
    return Array.from(map.entries());
  }, [effects]);

  return (
    <div className="flex flex-wrap gap-1">
      {grouped.map(([type, data]) => {
        const config = ICON_CONFIG[type] ?? { color: '#c084fc', Icon: ShieldIcon };
        return (
          <div
            key={type}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${config.color}20`,
              border: `1px solid ${config.color}60`,
            }}
          >
            <config.Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
            <span className="tracking-wide text-white/80">{data.maxDuration}</span>
            {data.count > 1 && (
              <span className="text-[10px] text-white/70">×{data.count}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
