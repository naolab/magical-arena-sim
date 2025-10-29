'use client';

import { EnemyState } from '@/lib/battle-v2/types';
import { getHpRatio } from '@/lib/battle-v2/battleEngine';
import { getFanRateRank } from '@/lib/battle-v2/fanSystem';

interface EnemyStatusProps {
  enemy: EnemyState;
}

export function EnemyStatus({ enemy }: EnemyStatusProps) {
  const hpRatio = getHpRatio(enemy.hp, enemy.maxHp);
  const fanRatePercent = Math.round(enemy.fanRate * 100);
  const fanRank = getFanRateRank(enemy.fanRate);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-700/20 p-4 backdrop-blur-sm border border-red-400/30">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-red-300">敵</div>
        <div className="text-sm text-white/60">Rank: {fanRank}</div>
      </div>

      {/* HPバー */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">HP</span>
          <span className="font-mono text-white">
            {enemy.hp} / {enemy.maxHp}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
            style={{ width: `${hpRatio * 100}%` }}
          />
        </div>
      </div>

      {/* ファン率バー */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">ファン率</span>
          <span className="font-mono text-white">{fanRatePercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
            style={{ width: `${fanRatePercent}%` }}
          />
        </div>
      </div>

      {/* 攻撃力 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">攻撃力</span>
        <span className="font-mono text-white">{enemy.basePower}</span>
      </div>

      {/* アクティブエフェクト数 */}
      {enemy.activeEffects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">効果:</span>
          <div className="flex gap-1">
            {enemy.activeEffects.map((effect, index) => (
              <div
                key={index}
                className="rounded-full bg-white/20 px-2 py-1 text-xs text-white"
              >
                {effect.type === 'buff' ? '↑' : '↓'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
