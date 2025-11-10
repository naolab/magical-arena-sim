'use client';

import { type ComponentType, useEffect, useState } from 'react';
import { SpecialEffect } from '@/lib/battle-v2/types';
import { getEffectDescription } from '@/lib/battle-v2/specialEffects';
import { ShieldIcon, SparkIcon, AttackDownIcon, PoisonIcon, CurseIcon, RegenIcon, FanBlockIcon } from './icons';

interface ActiveEffectIconsProps {
  effects: SpecialEffect[];
}

type IconConfig = {
  color: string;
  Icon: ComponentType<{ className?: string }>;
};

const ICON_CONFIG: Partial<Record<SpecialEffect['type'], IconConfig>> = {
  buff: { color: '#d97706', Icon: SparkIcon }, // より濃いオレンジ
  debuff: { color: '#15803d', Icon: AttackDownIcon }, // 下矢印×剣
  poison: { color: '#a855f7', Icon: PoisonIcon }, // 紫
  curse: { color: '#7c2d12', Icon: CurseIcon }, // ダークレッド
  regen: { color: '#38bdf8', Icon: RegenIcon }, // 回復っぽい水色
  fan_block: { color: '#16a34a', Icon: FanBlockIcon }, // ファン阻害: グリーン系
};

export function ActiveEffectIcons({ effects }: ActiveEffectIconsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenIndex(null);
  }, [effects]);

  if (effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {effects.map((effect, index) => {
        const config = ICON_CONFIG[effect.type] ?? { color: '#c084fc', Icon: ShieldIcon };
        const isOpen = openIndex === index;
        return (
          <div key={`${effect.type}-${index}`} className="relative">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white border shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60"
              style={{
                background: `linear-gradient(135deg, ${config.color}99 0%, ${config.color}77 80%)`,
                borderColor: `${config.color}`,
              }}
            >
              <config.Icon
                className="h-4 w-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                style={{ color: config.color }}
              />
              <span className="tracking-wide">{effect.duration}</span>
            </button>
            {isOpen && (
              <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-white/30 bg-black/85 p-3 text-xs text-white shadow-2xl">
                <p className="font-semibold mb-1">
                  {effect.type === 'buff'
                    ? 'バフ効果'
                    : effect.type === 'debuff'
                      ? 'デバフ効果'
                      : effect.type === 'poison'
                        ? '毒効果'
                        : effect.type === 'curse'
                          ? '呪い効果'
                          : effect.type === 'fan_block'
                            ? 'ファン阻害効果'
                            : '特殊効果'}
                </p>
                <p className="text-white/90 leading-relaxed">{getEffectDescription(effect)}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
