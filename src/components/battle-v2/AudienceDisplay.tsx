'use client';

import { AudienceComposition } from '@/lib/battle-v2/types';

interface AudienceDisplayProps {
  audience: AudienceComposition;
}

export function AudienceDisplay({ audience }: AudienceDisplayProps) {
  const playerPercent = Math.round(audience.playerFans * 100);
  const enemyPercent = Math.round(audience.enemyFans * 100);
  const neutralPercent = Math.round(audience.neutralFans * 100);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-black/40 p-4 backdrop-blur-sm">
      {/* ヘッダー */}
      <div className="text-center text-lg font-bold text-white">観客構成</div>

      {/* 観客構成バー */}
      <div className="flex h-6 w-full overflow-hidden rounded-full">
        {/* プレイヤーファン */}
        {playerPercent > 0 && (
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${playerPercent}%` }}
            title={`プレイヤーファン: ${playerPercent}%`}
          />
        )}

        {/* 中立ファン */}
        {neutralPercent > 0 && (
          <div
            className="bg-gray-400 transition-all duration-500"
            style={{ width: `${neutralPercent}%` }}
            title={`中立: ${neutralPercent}%`}
          />
        )}

        {/* 敵ファン */}
        {enemyPercent > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${enemyPercent}%` }}
            title={`敵ファン: ${enemyPercent}%`}
          />
        )}
      </div>

      {/* 詳細 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <div className="text-white/80">プレイヤー</div>
          <div className="font-mono text-white">{playerPercent}%</div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-gray-400" />
          <div className="text-white/80">中立</div>
          <div className="font-mono text-white">{neutralPercent}%</div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="text-white/80">敵</div>
          <div className="font-mono text-white">{enemyPercent}%</div>
        </div>
      </div>
    </div>
  );
}
