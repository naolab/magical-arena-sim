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
  berserk_lowhp: {
    id: 'berserk_lowhp',
    name: 'ブラッディバーサーク',
    nameJa: 'ブラッディバーサーク',
    description: 'HPが減るほど火力が上がる（残HPが低いほど倍率UP）',
    effectType: 'extra_damage',
    magnitude: 0,
    hasAttack: true,
    maxUses: 20,
    metadata: {
      scaling: 'lowhp',
    },
  },
  chaos_strike: {
    id: 'chaos_strike',
    name: 'カオスストライク',
    nameJa: 'カオスストライク',
    description: 'ダメージが大きくブレる（50%〜200%）',
    effectType: 'extra_damage',
    magnitude: 0,
    hasAttack: true,
    maxUses: 20,
    metadata: {
      randomRange: [0.5, 2.0],
    },
  },
  debuff_scaling: {
    id: 'debuff_scaling',
    name: 'ヘルファイア・スパイク',
    nameJa: 'ヘルファイア・スパイク',
    description: '敵のデバフ/毒の数に応じて追撃ダメージ（1個ごとに+40%）',
    effectType: 'extra_damage',
    magnitude: 0,
    hasAttack: true,
    maxUses: 20,
  },
  sacrifice: {
    id: 'sacrifice',
    name: 'ブラッドサクリファイス',
    nameJa: 'ブラッドサクリファイス',
    description: '自身のHPを5%削り、攻撃を200%までブーストする',
    effectType: 'extra_damage',
    magnitude: 200,
    hasAttack: true,
    maxUses: 20,
    metadata: {
      damageMultiplier: 2.0,
      hpCostPercentage: 5,
    },
  },
  blood_pact: {
    id: 'blood_pact',
    name: 'カーストブラッド',
    nameJa: 'カーストブラッド',
    description: '自身のHPを15%犠牲にし、敵に最大HPの24%ダメージを叩き込む',
    effectType: 'extra_damage',
    magnitude: 0,
    hasAttack: false,
    maxUses: 20,
    metadata: {
      hpCostPercentage: 15,
      targetHpDamagePercentage: 24,
    },
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
    description: '毒で相手を蝕む（毎ターン100ダメージ、3ターン）',
    effectType: 'poison',
    magnitude: 100, // 毎ターン100ダメージ
    duration: 3, // 3ターン持続
    hasAttack: false,
    maxUses: 20,
  },
  curse: {
    id: 'curse',
    name: 'カースドシャドウ',
    nameJa: 'カースドシャドウ',
    description: '呪いで相手を蝕む（毎ターン最大HPの5%ダメージ、3ターン）',
    effectType: 'curse',
    magnitude: 5, // 最大HPの5%
    duration: 3, // 3ターン持続
    hasAttack: false,
    maxUses: 20,
  },
  fan_block: {
    id: 'fan_block',
    name: 'サイレントチェイン',
    nameJa: 'サイレントチェイン',
    description: '2ターンの間、相手のファンが一切増えなくなる呪縛を与える',
    effectType: 'fan_block',
    magnitude: 0,
    duration: 2,
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
  cleanse_heal: {
    id: 'cleanse_heal',
    name: 'ピュアリファイン',
    nameJa: 'ピュアリファイン',
    description: '150回復し、自分のデバフをすべて解除する',
    effectType: 'drain',
    magnitude: 150,
    hasAttack: false,
    maxUses: 20,
  },
  regen: {
    id: 'regen',
    name: 'リジェネレイト',
    nameJa: 'リジェネレイト',
    description: '3ターン継続で、毎ターン90回復する効果を自分に付与',
    effectType: 'regen',
    magnitude: 90, // 毎ターン90回復
    duration: 3, // 3ターン持続
    hasAttack: false,
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
  comment_boost: {
    id: 'comment_boost',
    name: 'コメントブースト',
    nameJa: 'コメントブースト',
    description: '毎ターンのコメント追加量を永続的に+1（5回まで使用可能）',
    effectType: 'buff',
    magnitude: 1, // コメント追加量+1
    hasAttack: false, // 効果のみ
    maxUses: 5,
  },
  refresh: {
    id: 'refresh',
    name: 'コメントリライブ',
    nameJa: 'コメントリライブ',
    description: '現在のコメントを全てリフレッシュし、ランダムな感情（スパチャ含む）に変換する',
    effectType: 'buff',
    magnitude: 0,
    hasAttack: false,
    maxUses: 20,
  },
  dual_refresh: {
    id: 'dual_refresh',
    name: 'デュアルシャッフル',
    nameJa: 'デュアルシャッフル',
    description: '現在のコメントをすべてランダムな2属性に付け替える（スパチャは含めない）',
    effectType: 'buff',
    magnitude: 0,
    hasAttack: false,
    maxUses: 20,
  },
  superchat_boost: {
    id: 'superchat_boost',
    name: 'ミラージュスパーク',
    nameJa: 'ミラージュスパーク',
    description: '3ターンの間、スパチャ出現率が2倍になる祝祭の波を呼び込む（重ね掛け不可）',
    effectType: 'buff',
    magnitude: 2,
    duration: 3,
    hasAttack: false,
    maxUses: 20,
  },
  attack_charge: {
    id: 'attack_charge',
    name: 'ハイテンポチャージ',
    nameJa: 'ハイテンポチャージ',
    description: '次のターンの攻撃力を+80%にする（重ね掛け不可）',
    effectType: 'buff',
    magnitude: 80,
    duration: 1,
    hasAttack: false,
    maxUses: 20,
    metadata: {
      attackMultiplier: 1.8,
    },
  },
  damage_resonance: {
    id: 'damage_resonance',
    name: 'レゾナンスブレイク',
    nameJa: 'レゾナンスブレイク',
    description: '次のターンの与ダメージを+50%にする（継続ダメージ含む, 重ね掛け不可）',
    effectType: 'buff',
    magnitude: 50,
    duration: 1,
    hasAttack: false,
    maxUses: 20,
    metadata: {
      damageMultiplier: 1.5,
    },
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
