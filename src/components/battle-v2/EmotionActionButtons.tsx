'use client';

import { EmotionType, ActionVariants, SkillUsageMap } from '@/lib/battle-v2/types';
import { getAllEmotions } from '@/lib/battle-v2/emotionSystem';
import { EmotionButton } from './EmotionButton';
import { getVariantDefinition } from '@/lib/battle-v2/actionVariants';

interface EmotionActionButtonsProps {
  onAction: (emotion: EmotionType) => void;
  disabled?: boolean;
  selectedEmotion?: EmotionType | null;
  selectedVariants: ActionVariants;
  remainingUses: SkillUsageMap;
}

export function EmotionActionButtons({
  onAction,
  disabled = false,
  selectedEmotion = null,
  selectedVariants,
  remainingUses,
}: EmotionActionButtonsProps) {
  const emotions = getAllEmotions();
  return (
    <div className="grid grid-cols-2 gap-4">
      {emotions.map((emotion, index) => {
        const variantDef = getVariantDefinition(emotion, selectedVariants[emotion]);
        const maxUses = variantDef.maxUses;
        const remaining = remainingUses?.[emotion] ?? maxUses ?? 0;
        const exhausted = maxUses !== undefined ? remaining <= 0 : false;
        return (
          <EmotionButton
            key={emotion}
            emotion={emotion}
            onClick={() => onAction(emotion)}
            disabled={disabled || exhausted}
            isSelected={selectedEmotion === emotion}
            label={variantDef.nameJa}
            description={variantDef.description}
            remainingUses={remaining}
            maxUses={maxUses}
            isExhausted={exhausted}
            tooltipPosition={index < 2 ? 'top' : 'bottom'}
          />
        );
      })}
    </div>
  );
}
