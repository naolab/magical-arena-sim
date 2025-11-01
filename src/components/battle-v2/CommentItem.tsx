'use client';

import { Comment } from '@/lib/battle-v2/types';
import { getEmotionColor } from '@/lib/battle-v2/emotionSystem';

interface CommentItemProps {
  comment: Comment;
  isNew?: boolean; // 新しいコメントかどうか（アニメーション用）
  isHighlighted?: boolean; // ハイライト表示するか
}

export function CommentItem({ comment, isNew = false, isHighlighted = false }: CommentItemProps) {
  const color = getEmotionColor(comment.emotion);

  return (
    <div
      className={`rounded-lg p-2.5 text-white transition-all ${
        isNew ? 'animate-slide-in' : ''
      } ${
        isHighlighted ? 'ring-2 ring-white shadow-lg scale-105' : ''
      }`}
      style={{
        backgroundColor: isHighlighted ? `${color}80` : `${color}40`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      {/* 上部：感情アイコン */}
      <div className="mb-0.5 flex items-center gap-2">
        <div
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {getEmotionIcon(comment.emotion)}
        </div>
        <div className="text-xs font-semibold opacity-80">
          {getEmotionName(comment.emotion)}
        </div>
      </div>

      {/* コメントテキスト */}
      <div className="text-sm font-medium leading-tight">{comment.text}</div>
    </div>
  );
}

/**
 * 感情のアイコンを取得
 */
function getEmotionIcon(emotion: string): string {
  switch (emotion) {
    case 'rage':
      return '怒';
    case 'terror':
      return '恐';
    case 'grief':
      return '悲';
    case 'ecstasy':
      return '喜';
    default:
      return '？';
  }
}

/**
 * 感情の名前を取得
 */
function getEmotionName(emotion: string): string {
  switch (emotion) {
    case 'rage':
      return 'RAGE';
    case 'terror':
      return 'TERROR';
    case 'grief':
      return 'GRIEF';
    case 'ecstasy':
      return 'ECSTASY';
    default:
      return 'UNKNOWN';
  }
}
