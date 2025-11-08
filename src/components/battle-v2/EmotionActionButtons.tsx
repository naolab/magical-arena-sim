'use client';

import { EmotionType, Comment } from '@/lib/battle-v2/types';
import { getAllEmotions } from '@/lib/battle-v2/emotionSystem';
import { getCommentCountByEmotion } from '@/lib/battle-v2/commentSystem';
import { EmotionButton } from './EmotionButton';

interface EmotionActionButtonsProps {
  onAction: (emotion: EmotionType) => void;
  disabled?: boolean;
  comments: Comment[];
  selectedEmotion?: EmotionType | null;
}

export function EmotionActionButtons({
  onAction,
  disabled = false,
  comments,
  selectedEmotion = null,
}: EmotionActionButtonsProps) {
  const emotions = getAllEmotions();
  const commentCounts = getCommentCountByEmotion(comments);

  return (
    <div className="grid grid-cols-2 gap-4">
      {emotions.map((emotion) => (
        <EmotionButton
          key={emotion}
          emotion={emotion}
          onClick={() => onAction(emotion)}
          disabled={disabled}
          commentCount={commentCounts[emotion]}
          isSelected={selectedEmotion === emotion}
        />
      ))}
    </div>
  );
}
