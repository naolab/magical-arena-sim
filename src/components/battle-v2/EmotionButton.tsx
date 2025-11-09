'use client';

import { EmotionType } from '@/lib/battle-v2/types';
import { getEmotionColor, getEmotionName } from '@/lib/battle-v2/emotionSystem';

interface EmotionButtonProps {
  emotion: EmotionType;
  onClick: () => void;
  disabled?: boolean;
  isSelected?: boolean; // 選択されているか
  label?: string;
  description?: string;
  tooltipPosition?: 'top' | 'bottom';
  remainingUses?: number;
  maxUses?: number;
  isExhausted?: boolean;
}

export function EmotionButton({
  emotion,
  onClick,
  disabled = false,
  isSelected = false,
  label,
  description,
  tooltipPosition = 'bottom',
  remainingUses,
  maxUses,
  isExhausted = false,
}: EmotionButtonProps) {
  const color = getEmotionColor(emotion);
  const name = label || getEmotionName(emotion);
  const darkerColor = getDarkerColor(color);
  const usesText =
    maxUses !== undefined
      ? `SP ${Math.max(0, remainingUses ?? maxUses ?? 0)} / ${maxUses}`
      : '';
  const emotionTag = getEmotionName(emotion).toUpperCase();
  const unavailable = disabled || isExhausted;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} select-none`}
    >
      {/* カード本体 */}
      <div
        className={`relative overflow-hidden rounded-xl border-4 px-4 py-3 transition-all duration-300 ${
          unavailable
            ? 'opacity-50 border-gray-500'
            : 'border-white/20 group-hover:scale-105 group-hover:border-white/60 group-hover:shadow-2xl'
        }`}
        style={{
          background: unavailable
            ? 'linear-gradient(180deg, #777, #303030)'
            : `linear-gradient(180deg, ${color} 0%, ${darkerColor} 70%, #1f1f1f 100%)`,
          boxShadow: unavailable
            ? 'none'
            : isSelected
              ? `0 0 32px ${color}, 0 8px 24px rgba(0,0,0,0.5)`
              : `0 8px 16px rgba(0,0,0,0.3)`,
        }}
      >
        {/* 選択時の光るエフェクト */}
        {isSelected && !unavailable && (
          <div
            className="absolute inset-0 border-4 border-white animate-pulse pointer-events-none"
            style={{ borderRadius: '12px' }}
          />
        )}

        {/* 技名 */}
        <div className="text-base font-black text-white drop-shadow-md">{name}</div>

        {/* 使用回数 */}
        {usesText && (
          <div className="mt-0.5 flex items-center justify-center gap-3 text-xs font-bold tracking-wide text-white drop-shadow">
            <span className="rounded-md border border-white/40 px-2 py-0.5 leading-none text-[10px] tracking-widest">
              {emotionTag}
            </span>
            <span>{usesText}</span>
          </div>
        )}
      </div>

      {/* ツールチップ */}
      {description && (
        <div
          className={`pointer-events-none absolute left-1/2 w-56 -translate-x-1/2 rounded-lg border border-white/30 bg-black/80 p-3 text-sm text-white opacity-0 shadow-xl transition-opacity duration-200 delay-200 group-hover:opacity-100 ${
            tooltipPosition === 'top'
              ? 'bottom-[calc(100%+0.5rem)]'
              : 'top-[calc(100%+0.5rem)]'
          }`}
        >
          {description}
        </div>
      )}
    </button>
  );
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
