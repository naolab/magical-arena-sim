/**
 * Action Variant Selector Component
 * Allows users to select which variant of an emotion action to use
 */

import { EmotionType, ActionVariant } from '@/lib/battle-v2/types';
import { getEmotionColor, getEmotionName } from '@/lib/battle-v2/emotionSystem';
import { getAllVariantsByEmotion } from '@/lib/battle-v2/actionVariants';

interface ActionVariantSelectorProps {
  emotion: EmotionType;
  selectedVariant: ActionVariant;
  onChange: (variant: ActionVariant) => void;
}

export function ActionVariantSelector({
  emotion,
  selectedVariant,
  onChange,
}: ActionVariantSelectorProps) {
  const color = getEmotionColor(emotion);
  const emotionName = getEmotionName(emotion);
  const variants = getAllVariantsByEmotion(emotion);
  const variantEntries = Object.entries(variants);

  return (
    <div className="space-y-2">
      {/* Emotion Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h4 className="font-semibold text-white">{emotionName}</h4>
      </div>

      {/* Variant Options */}
      <div className="grid grid-cols-1 gap-2 pl-6">
        {variantEntries.map(([variantId, variantDef]) => {
          const isSelected = selectedVariant === variantId;

          return (
            <button
              key={variantId}
              onClick={() => onChange(variantId as ActionVariant)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-white bg-white/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">
                  {variantDef.nameJa}
                </span>
                {isSelected && (
                  <span className="text-xs text-cyan-400 font-bold">
                    ✓ 選択中
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300">{variantDef.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
