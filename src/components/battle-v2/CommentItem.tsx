'use client';

import { Comment } from '@/lib/battle-v2/types';
import { getEmotionColor } from '@/lib/battle-v2/emotionSystem';

interface CommentItemProps {
  comment: Comment;
  isNew?: boolean; // 新しいコメントかどうか（アニメーション用）
}

export function CommentItem({ comment, isNew = false }: CommentItemProps) {
  const color = getEmotionColor(comment.emotion);

  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-black/40 p-2 text-sm text-white transition-all ${
        isNew ? 'animate-slide-in' : ''
      }`}
      style={{
        borderLeft: `4px solid ${color}`,
      }}
    >
      {/* 感情アイコン */}
      <div
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {getEmotionIcon(comment.emotion)}
      </div>

      {/* コメントテキスト */}
      <div className="flex-1 truncate">{comment.text}</div>
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
