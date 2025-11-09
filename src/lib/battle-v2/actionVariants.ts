/**
 * Action Variant Definitions
 * 各感情アクションのバリアント設定
 */

import type {
  RageVariant,
  TerrorVariant,
  GriefVariant,
  EcstasyVariant,
  ActionVariantDefinition,
} from './types';

// ========================================
// Rage Variants
// ========================================

export const RAGE_VARIANTS: Record<RageVariant, ActionVariantDefinition> = {
  explosive: {
    id: 'explosive',
    name: 'Explosive Rage',
    nameJa: '爆発的激怒',
    description: '激情のまま連続攻撃を繰り出す（追加ダメージ+50%）',
    effectType: 'extra_damage',
    magnitude: 50, // 50%の追加ダメージ
  },
};

// ========================================
// Terror Variants
// ========================================

export const TERROR_VARIANTS: Record<TerrorVariant, ActionVariantDefinition> = {
  weaken: {
    id: 'weaken',
    name: 'Weakening Terror',
    nameJa: '委縮の恐怖',
    description: '恐怖で相手を委縮させ、攻撃力を低下させる（-20%、2ターン）',
    effectType: 'debuff',
    magnitude: 20, // 20%の攻撃力低下
    duration: 2, // 2ターン持続
  },
};

// ========================================
// Grief Variants
// ========================================

export const GRIEF_VARIANTS: Record<GriefVariant, ActionVariantDefinition> = {
  drain: {
    id: 'drain',
    name: 'Life Drain',
    nameJa: '生命吸収',
    description: '悲しみの重さで相手のエネルギーを吸い取る（ダメージの40%回復）',
    effectType: 'drain',
    magnitude: 40, // 与ダメージの40%を回復
  },
};

// ========================================
// Ecstasy Variants
// ========================================

export const ECSTASY_VARIANTS: Record<EcstasyVariant, ActionVariantDefinition> = {
  inspire: {
    id: 'inspire',
    name: 'Inspiring Ecstasy',
    nameJa: '鼓舞の恍惚',
    description: '至福の高揚感で能力が上昇する（攻撃力+30%、2ターン）',
    effectType: 'buff',
    magnitude: 30, // 30%の攻撃力上昇
    duration: 2, // 2ターン持続
  },
};

// ========================================
// Helper Functions
// ========================================

/**
 * 感情タイプから対応するバリアント定義を取得
 */
export function getVariantDefinition(
  emotion: 'rage',
  variant: RageVariant
): ActionVariantDefinition;
export function getVariantDefinition(
  emotion: 'terror',
  variant: TerrorVariant
): ActionVariantDefinition;
export function getVariantDefinition(
  emotion: 'grief',
  variant: GriefVariant
): ActionVariantDefinition;
export function getVariantDefinition(
  emotion: 'ecstasy',
  variant: EcstasyVariant
): ActionVariantDefinition;
export function getVariantDefinition(
  emotion: 'rage' | 'terror' | 'grief' | 'ecstasy',
  variant: RageVariant | TerrorVariant | GriefVariant | EcstasyVariant
): ActionVariantDefinition {
  switch (emotion) {
    case 'rage':
      return RAGE_VARIANTS[variant as RageVariant];
    case 'terror':
      return TERROR_VARIANTS[variant as TerrorVariant];
    case 'grief':
      return GRIEF_VARIANTS[variant as GriefVariant];
    case 'ecstasy':
      return ECSTASY_VARIANTS[variant as EcstasyVariant];
  }
}

/**
 * 全てのバリアント定義を感情タイプ別に取得
 */
export function getAllVariantsByEmotion(
  emotion: 'rage' | 'terror' | 'grief' | 'ecstasy'
): Record<string, ActionVariantDefinition> {
  switch (emotion) {
    case 'rage':
      return RAGE_VARIANTS;
    case 'terror':
      return TERROR_VARIANTS;
    case 'grief':
      return GRIEF_VARIANTS;
    case 'ecstasy':
      return ECSTASY_VARIANTS;
  }
}
