'use client';

import { useState } from 'react';
import { PlayerState } from '@/lib/battle-v2/types';
import { getHpRatio } from '@/lib/battle-v2/battleEngine';
import { getFanRateRank } from '@/lib/battle-v2/fanSystem';

interface PlayerStatusProps {
  player: PlayerState;
}

export function PlayerStatus({ player }: PlayerStatusProps) {
  const [showHpDetails, setShowHpDetails] = useState(false);
  const hpRatio = getHpRatio(player.hp, player.maxHp);
  const fanRatePercent = Math.round(player.fanRate * 100);
  const fanRank = getFanRateRank(player.fanRate);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 p-4 backdrop-blur-sm border border-blue-400/30">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-blue-300">プレイヤー</div>
        <div className="text-sm text-white/60">Rank: {fanRank}</div>
      </div>

      {/* HPバー */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">HP</span>
          {showHpDetails && (
            <span className="font-mono text-white">
              {player.hp} / {player.maxHp}
            </span>
          )}
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-black/40 cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all"
          onClick={() => setShowHpDetails(!showHpDetails)}
          title="クリックでHP詳細を表示"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 pointer-events-none"
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
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
            style={{ width: `${fanRatePercent}%` }}
          />
        </div>
      </div>

      {/* 攻撃力 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">攻撃力</span>
        <span className="font-mono text-white">{player.basePower}</span>
      </div>

      {/* アクティブエフェクト数 */}
      {player.activeEffects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">効果:</span>
          <div className="flex gap-1">
            {player.activeEffects.map((effect, index) => (
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
