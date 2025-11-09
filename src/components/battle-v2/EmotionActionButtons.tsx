'use client';

import { EmotionType, Comment, ActionVariants } from '@/lib/battle-v2/types';
import { getAllEmotions } from '@/lib/battle-v2/emotionSystem';
import { getCommentCountByEmotion } from '@/lib/battle-v2/commentSystem';
import { EmotionButton } from './EmotionButton';
import { getVariantDefinition } from '@/lib/battle-v2/actionVariants';

interface EmotionActionButtonsProps {
  onAction: (emotion: EmotionType) => void;
  disabled?: boolean;
  comments: Comment[];
  selectedEmotion?: EmotionType | null;
  selectedVariants: ActionVariants;
}

export function EmotionActionButtons({
  onAction,
  disabled = false,
  comments,
  selectedEmotion = null,
  selectedVariants,
}: EmotionActionButtonsProps) {
  const emotions = getAllEmotions();
  const commentCounts = getCommentCountByEmotion(comments);

  return (
    <div className="grid grid-cols-2 gap-4">
      {emotions.map((emotion, index) => {
        const variantDef = getVariantDefinition(emotion, selectedVariants[emotion]);
        return (
          <EmotionButton
            key={emotion}
            emotion={emotion}
            onClick={() => onAction(emotion)}
            disabled={disabled}
            commentCount={commentCounts[emotion]}
            isSelected={selectedEmotion === emotion}
            label={variantDef.nameJa}
            description={variantDef.description}
            tooltipPosition={index < 2 ? 'top' : 'bottom'}
          />
        );
      })}
    </div>
  );
}
