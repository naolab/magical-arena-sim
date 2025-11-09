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
  ActionVariant,
  EmotionType,
} from './types';

// ========================================
// Rage Variants
// ========================================

export const RAGE_VARIANTS: Record<RageVariant, ActionVariantDefinition> = {
  explosive: {
    id: 'explosive',
    name: 'バーストレイジ',
    nameJa: 'バーストレイジ',
    description: '通常攻撃に加えて怒涛の追撃を叩き込む（基礎ダメージ+50%）',
    effectType: 'extra_damage',
    magnitude: 50, // 50%の追加ダメージ
    hasAttack: true,
    maxUses: 20,
  },
  percentage: {
    id: 'percentage',
    name: 'パーセントスマイト',
    nameJa: 'パーセントスマイト',
    description: '敵の最大HPに応じたダメージを与える（最大HPの15%）',
    effectType: 'extra_damage',
    magnitude: 15, // 最大HPの15%
    hasAttack: false,
    maxUses: 20,
  },
};

// ========================================
// Terror Variants
// ========================================

export const TERROR_VARIANTS: Record<TerrorVariant, ActionVariantDefinition> = {
  weaken: {
    id: 'weaken',
    name: 'ディミニッシュテラー',
    nameJa: 'ディミニッシュテラー',
    description: '攻撃しながら相手を恐怖で蝕み、攻撃力を-20%（2ターン）',
    effectType: 'debuff',
    magnitude: 20, // 20%の攻撃力低下
    duration: 2, // 2ターン持続
    hasAttack: true,
    maxUses: 20,
  },
  poison: {
    id: 'poison',
    name: 'ヴェノムナイトメア',
    nameJa: 'ヴェノムナイトメア',
    description: '毒で相手を蝕む（毎ターン70ダメージ、3ターン）',
    effectType: 'poison',
    magnitude: 70, // 毎ターン70ダメージ
    duration: 3, // 3ターン持続
    hasAttack: false,
    maxUses: 20,
  },
};

// ========================================
// Grief Variants
// ========================================

export const GRIEF_VARIANTS: Record<GriefVariant, ActionVariantDefinition> = {
  drain: {
    id: 'drain',
    name: 'ソウルドレイン',
    nameJa: 'ソウルドレイン',
    description: 'ダメージを与えると同時に与ダメージの40%を吸収して回復',
    effectType: 'drain',
    magnitude: 40, // 与ダメージの40%を回復
    hasAttack: true,
    maxUses: 20,
  },
  desperate: {
    id: 'desperate',
    name: 'ラストリメディ',
    nameJa: 'ラストリメディ',
    description: '強い悲しみで自分を立て直す（最大HPの15%回復）',
    effectType: 'drain',
    magnitude: 15, // 最大HPの15%
    hasAttack: false, // 回復のみ
    maxUses: 20,
  },
};

// ========================================
// Ecstasy Variants
// ========================================

export const ECSTASY_VARIANTS: Record<EcstasyVariant, ActionVariantDefinition> = {
  inspire: {
    id: 'inspire',
    name: 'トランスブースト',
    nameJa: 'トランスブースト',
    description: '攻撃しつつ自身を高揚させ、攻撃力+30%（2ターン）',
    effectType: 'buff',
    magnitude: 30, // 30%の攻撃力上昇
    duration: 2, // 2ターン持続
    hasAttack: true,
    maxUses: 20,
  },
  convert: {
    id: 'convert',
    name: 'クリムゾンコンバータ',
    nameJa: 'クリムゾンコンバータ',
    description: 'コメントの色を変換する（最大3個を赤〈Rage〉に変換）',
    effectType: 'buff',
    magnitude: 3, // 変換数
    hasAttack: false, // 変換のみ
    maxUses: 20,
  },
};

// ========================================
// Helper Functions
// ========================================

/**
 * 感情タイプから対応するバリアント定義を取得
 */
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

export const DEFAULT_VARIANTS: Record<EmotionType, ActionVariant> = {
  rage: 'explosive',
  terror: 'weaken',
  grief: 'drain',
  ecstasy: 'inspire',
};

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
