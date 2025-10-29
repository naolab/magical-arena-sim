'use client';

import { EmotionType, Comment } from '@/lib/battle-v2/types';
import { getAllEmotions } from '@/lib/battle-v2/emotionSystem';
import { getCommentCountByEmotion } from '@/lib/battle-v2/commentSystem';
import { EmotionButton } from './EmotionButton';

interface EmotionActionButtonsProps {
  onAction: (emotion: EmotionType) => void;
  disabled?: boolean;
  comments: Comment[];
}

export function EmotionActionButtons({
  onAction,
  disabled = false,
  comments,
}: EmotionActionButtonsProps) {
  const emotions = getAllEmotions();
  const commentCounts = getCommentCountByEmotion(comments);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center text-lg font-bold text-white">
        感情を選択
      </div>

      <div className="grid grid-cols-2 gap-4">
        {emotions.map((emotion) => (
          <EmotionButton
            key={emotion}
            emotion={emotion}
            onClick={() => onAction(emotion)}
            disabled={disabled}
            commentCount={commentCounts[emotion]}
          />
        ))}
      </div>

      {/* 説明 */}
      <div className="text-center text-sm text-white/60">
        コメント数が多い感情ほど威力UP
      </div>
    </div>
  );
}
