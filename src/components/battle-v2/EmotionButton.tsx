'use client';

import { EmotionType } from '@/lib/battle-v2/types';
import { getEmotionColor, getEmotionName } from '@/lib/battle-v2/emotionSystem';

interface EmotionButtonProps {
  emotion: EmotionType;
  onClick: () => void;
  disabled?: boolean;
  commentCount?: number; // この感情のコメント数
}

export function EmotionButton({
  emotion,
  onClick,
  disabled = false,
  commentCount = 0,
}: EmotionButtonProps) {
  const color = getEmotionColor(emotion);
  const name = getEmotionName(emotion);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center rounded-xl p-6 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: disabled ? '#666' : color,
        boxShadow: `0 4px 12px ${color}40`,
      }}
    >
      {/* 感情名 */}
      <div className="text-2xl font-bold text-white mb-2">{name}</div>

      {/* コメント数バッジ */}
      {commentCount > 0 && (
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold shadow-lg">
          <span style={{ color }}>{commentCount}</span>
        </div>
      )}

      {/* 説明テキスト */}
      <div className="text-xs text-white/80">
        {getEmotionDescription(emotion)}
      </div>
    </button>
  );
}

/**
 * 感情の説明を取得
 */
function getEmotionDescription(emotion: EmotionType): string {
  switch (emotion) {
    case 'rage':
      return '追加ダメージ';
    case 'terror':
      return '敵デバフ';
    case 'grief':
      return 'HP吸収';
    case 'ecstasy':
      return '自己バフ';
  }
}
