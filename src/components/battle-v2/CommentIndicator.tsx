'use client';

import { Comment } from '@/lib/battle-v2/types';
import { getAllEmotions, getEmotionColor, getEmotionName } from '@/lib/battle-v2/emotionSystem';
import { getCommentCountByEmotion } from '@/lib/battle-v2/commentSystem';

interface CommentIndicatorProps {
  comments: Comment[];
}

export function CommentIndicator({ comments }: CommentIndicatorProps) {
  const emotions = getAllEmotions();
  const commentCounts = getCommentCountByEmotion(comments);

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-black/40 p-3 backdrop-blur-sm">
      <div className="text-sm font-bold text-white">感情別コメント数</div>

      <div className="grid grid-cols-2 gap-2">
        {emotions.map((emotion) => {
          const color = getEmotionColor(emotion);
          const name = getEmotionName(emotion);
          const count = commentCounts[emotion];

          return (
            <div
              key={emotion}
              className="flex items-center gap-2 rounded-lg p-2"
              style={{ backgroundColor: `${color}20` }}
            >
              {/* カラーインジケーター */}
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: color }}
              />

              {/* 感情名 */}
              <div className="flex-1 text-xs font-bold text-white">{name}</div>

              {/* カウント */}
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
