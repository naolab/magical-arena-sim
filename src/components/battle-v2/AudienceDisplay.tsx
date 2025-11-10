'use client';

import { AudienceComposition } from '@/lib/battle-v2/types';

interface AudienceDisplayProps {
  audience: AudienceComposition;
}

export function AudienceDisplay({ audience }: AudienceDisplayProps) {
  const playerPercent = Math.round(audience.playerFans * 100);
  const enemyPercent = Math.round(audience.enemyFans * 100);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-black/40 p-4 backdrop-blur-sm">
      {/* ヘッダー */}
      <div className="text-center text-lg font-bold text-white">ファン率</div>

      {/* 詳細 */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-pink-500" />
          <div className="text-white/80">プレイヤー</div>
          <div className="font-mono text-white">{playerPercent}%</div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-cyan-400" />
          <div className="text-white/80">敵</div>
          <div className="font-mono text-white">{enemyPercent}%</div>
        </div>
      </div>
    </div>
  );
}
