'use client';

import { EmotionType } from '@/lib/battle-v2/types';
import { getEmotionColor, getEmotionName } from '@/lib/battle-v2/emotionSystem';

interface EmotionButtonProps {
  emotion: EmotionType;
  onClick: () => void;
  disabled?: boolean;
  commentCount?: number; // この感情のコメント数
  isSelected?: boolean; // 選択されているか
}

export function EmotionButton({
  emotion,
  onClick,
  disabled = false,
  commentCount = 0,
  isSelected = false,
}: EmotionButtonProps) {
  const color = getEmotionColor(emotion);
  const name = getEmotionName(emotion);
  const darkerColor = getDarkerColor(color);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* カード本体 */}
      <div
        className={`relative overflow-hidden rounded-2xl border-4 p-6 transition-all duration-300 ${
          disabled
            ? 'opacity-50 border-gray-500'
            : 'border-white/20 group-hover:scale-105 group-hover:border-white/60 group-hover:shadow-2xl'
        }`}
        style={{
          background: disabled
            ? 'linear-gradient(to bottom right, #666, #444)'
            : `linear-gradient(to bottom right, ${color}, ${darkerColor})`,
          boxShadow: disabled
            ? 'none'
            : isSelected
              ? `0 0 32px ${color}, 0 8px 24px rgba(0,0,0,0.5)`
              : `0 8px 16px rgba(0,0,0,0.3)`,
        }}
      >
        {/* 選択時の光るエフェクト */}
        {isSelected && !disabled && (
          <div
            className="absolute inset-0 border-4 border-white animate-pulse pointer-events-none"
            style={{ borderRadius: '12px' }}
          />
        )}

        {/* 感情名 */}
        <div className="text-2xl font-black text-white mb-1 drop-shadow-md">{name}</div>

        {/* 説明 */}
        <div className="text-sm text-white/90 font-semibold">{getEmotionDescription(emotion)}</div>
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

/**
 * より暗い色を生成（グラデーション用）
 */
function getDarkerColor(color: string): string {
  // 色コードから暗めの色を生成
  switch (color) {
    case '#ef4444': // rage (red)
      return '#991b1b';
    case '#22c55e': // terror (green)
      return '#166534';
    case '#3b82f6': // grief (blue)
      return '#1e40af';
    case '#eab308': // ecstasy (yellow)
      return '#a16207';
    default:
      return color;
  }
}
