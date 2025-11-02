'use client';

import { EmotionType, BattleResult } from '@/lib/battle-v2/types';
import { getEmotionColor, getEmotionName } from '@/lib/battle-v2/emotionSystem';

interface ActionShowdownProps {
  playerAction: EmotionType;
  enemyAction: EmotionType;
  result: BattleResult; // プレイヤー視点での勝敗
}

export function ActionShowdown({
  playerAction,
  enemyAction,
  result,
}: ActionShowdownProps) {
  const playerColor = getEmotionColor(playerAction);
  const enemyColor = getEmotionColor(enemyAction);
  const playerName = getEmotionName(playerAction);
  const enemyName = getEmotionName(enemyAction);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center gap-8 p-8 bg-black/70 backdrop-blur-sm">
      {/* プレイヤー側 */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg transition-all ${
            result === 'win' ? 'scale-110 animate-pulse' : result === 'lose' ? 'scale-90 opacity-60' : ''
          }`}
          style={{ backgroundColor: playerColor }}
        >
          {playerName}
        </div>
        <div className="text-sm text-white">プレイヤー</div>
      </div>

      {/* VS表示 */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-4xl font-bold text-white">VS</div>
        <div
          className={`text-xl font-bold ${
            result === 'win'
              ? 'text-blue-400'
              : result === 'lose'
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}
        >
          {result === 'win' ? '勝利！' : result === 'lose' ? '敗北…' : '引き分け'}
        </div>
      </div>

      {/* 敵側 */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg transition-all ${
            result === 'lose' ? 'scale-110 animate-pulse' : result === 'win' ? 'scale-90 opacity-60' : ''
          }`}
          style={{ backgroundColor: enemyColor }}
        >
          {enemyName}
        </div>
        <div className="text-sm text-white">敵</div>
      </div>
    </div>
  );
}
