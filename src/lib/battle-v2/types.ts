/**
 * V2 Battle System Type Definitions
 * 4-way emotion-based battle system with comment mechanics
 */

import type { BattleParamsV2 } from '@/contexts/BattleParamsV2Context';

// ========================================
// Emotion System
// ========================================

/** 4つの感情アクション */
export type EmotionType = 'rage' | 'terror' | 'grief' | 'ecstasy';

/** 勝敗結果 */
export type BattleResult = 'win' | 'draw' | 'lose';

// ========================================
// Action Variants
// ========================================

/** Rageのバリアント */
export type RageVariant =
  | 'explosive'
  | 'percentage'
  | 'berserk_lowhp'
  | 'chaos_strike'
  | 'debuff_scaling'
  | 'sacrifice'
  | 'blood_pact';

/** Terrorのバリアント */
export type TerrorVariant =
  | 'weaken'
  | 'poison'
  | 'curse'
  | 'fan_block'
  | 'chaotic_plague'
  | 'damage_amplify'
  | 'victory_trigger';

/** Griefのバリアント */
export type GriefVariant =
  | 'drain'
  | 'desperate'
  | 'cleanse_heal'
  | 'regen'
  | 'limit_heal'
  | 'debuff_heal';

/** Ecstasyのバリアント */
export type EcstasyVariant =
  | 'inspire'
  | 'convert'
  | 'comment_boost'
  | 'refresh'
  | 'dual_refresh'
  | 'superchat_boost'
  | 'attack_charge'
  | 'damage_resonance';

/** 全てのアクションバリアント */
export type ActionVariant =
  | RageVariant
  | TerrorVariant
  | GriefVariant
  | EcstasyVariant;

/** 選択されたアクションバリアント */
export interface ActionVariants {
  rage: RageVariant;
  terror: TerrorVariant;
  grief: GriefVariant;
  ecstasy: EcstasyVariant;
}

/** 技の使用回数管理 */
export type SkillUsageMap = Record<EmotionType, number>;

/** アクションバリアントの定義 */
export interface ActionVariantDefinition {
  id: string;
  name: string;
  nameJa: string; // 日本語名
  description: string;
  effectType: SpecialEffectType;
  magnitude: number; // 効果量（%）
  duration?: number; // 効果持続ターン数（buff/debuffの場合）
  hasAttack: boolean; // 攻撃を行うか（false = 特殊効果のみ）
  maxUses: number; // 使用可能回数
  metadata?: Record<string, unknown>;
}

// ========================================
// Comment System
// ========================================

/** コメント */
export interface Comment {
  id: string; // ユニークID
  emotion: EmotionType; // 感情属性
  text: string; // コメントテキスト
  createdAt: number; // 作成ターン
  isSuperchat?: boolean; // スパチャかどうか
}

/** コメント生成パラメータ */
export interface CommentGenerationParams {
  count: number; // 生成数
  emotionWeights?: Record<EmotionType, number>; // 感情の重み（省略時は均等）
  superchatMultiplier?: number; // スパチャ確率の倍率
}

/** コメント変換イベント */
export interface CommentConversionEvent {
  target: 'player' | 'enemy';
  emotion: EmotionType; // 変換後の感情
  count: number; // 変換数
  commentIds: string[]; // 対象コメントID
}

// ========================================
// Special Effects
// ========================================

/** 特殊効果の種類 */
export type SpecialEffectType =
  | 'extra_damage'  // Rage: 追加ダメージ
  | 'debuff'        // Terror: デバフ（攻撃力低下）
  | 'drain'         // Grief: HP吸収
  | 'buff'          // Ecstasy: バフ（攻撃力上昇）
  | 'poison'        // Terror: 毒（持続ダメージ）
  | 'curse'         // Terror: 呪い（割合持続ダメージ）
  | 'cleanse'       // Grief: デバフ解除
  | 'regen'         // Grief: リジェネ（持続回復）
  | 'fan_block'     // Terror: ファン増加阻害
  | 'superchat_boost' // Ecstasy: スパチャ率上昇
  | 'damage_amp'    // 与ダメージ増幅（被ダメ増加）
  | 'victory_trigger'; // コメント枯渇勝利トリガー

/** 特殊効果 */
export interface SpecialEffect {
  type: SpecialEffectType;
  emotion: EmotionType; // どの感情から発動したか
  duration: number; // 残りターン数（0で消滅）
  magnitude: number; // 効果量（%で表現: 20 = 20%）
  target: 'player' | 'enemy'; // 効果対象
}

// ========================================
// Combatant State
// ========================================

/** 戦闘者の基本状態 */
export interface Combatant {
  hp: number;
  maxHp: number;
  basePower: number; // 基本攻撃力
  isDead?: boolean; // 一度HPが0以下になったら復活不可
}

/** プレイヤー状態 */
export interface PlayerState extends Combatant {
  fanRate: number; // ファン率 (0.0 ~ 1.0)
  activeEffects: SpecialEffect[]; // 有効な特殊効果
}

/** 敵状態 */
export interface EnemyState extends Combatant {
  fanRate: number; // ファン率 (0.0 ~ 1.0)
  activeEffects: SpecialEffect[]; // 有効な特殊効果
}

// ========================================
// Audience System
// ========================================

/** 観客構成（独立したファン率システム） */
export interface AudienceComposition {
  playerFans: number; // プレイヤーファン率 (0.0 ~ 1.0, 独立)
  enemyFans: number; // 敵ファン率 (0.0 ~ 1.0, 独立)
}

// ========================================
// Turn Result
// ========================================

/** ターン結果 */
export interface TurnResult {
  turnNumber: number;
  playerAction: EmotionType;
  enemyAction: EmotionType;
  judgement: BattleResult; // プレイヤー視点での勝敗
  consumedComments: Comment[]; // 消費されたコメント
  damage: {
    toEnemy: number;
    toPlayer: number;
    extraToEnemy: number;
    extraToPlayer: number;
  };
  specialEffects: {
    player: SpecialEffect[]; // プレイヤーに発動した効果
    enemy: SpecialEffect[]; // 敵に発動した効果
  };
  secondaryEffects: {
    player: {
      extraDamage: number;
      healing: number;
      poisonDamage: number; // 毒ダメージ
      curseDamage: number; // 呪いダメージ
      regenHealing: number; // リジェネ回復
      selfDamage: number; // 自傷ダメージ
    };
    enemy: {
      extraDamage: number;
      healing: number;
      poisonDamage: number; // 毒ダメージ
      curseDamage: number; // 呪いダメージ
      regenHealing: number; // リジェネ回復
      selfDamage: number; // 自傷ダメージ
    };
  };
  fanChange: {
    player: number; // ファン率の変化量
    enemy: number;
  };
  playerState: PlayerState; // ターン終了時のプレイヤー状態
  enemyState: EnemyState; // ターン終了時の敵状態
  audienceComposition: AudienceComposition; // ターン終了時の観客構成
  message: string; // ターンの説明メッセージ
  commentConversions?: CommentConversionEvent[]; // コメント変換イベント
  commentRefresh?: {
    count: number;
    comments: Comment[];
    limitedEmotions?: EmotionType[];
  }; // コメントリフレッシュイベント
  commentLimitChanged?: {
    newMax: number;
    reduction: number;
  };
  commentVictory?: 'player' | 'enemy' | 'both'; // コメント枯渇勝利イベント
  superchatAwarded?: boolean; // スパチャ追撃獲得
  commentBoostApplied?: number; // このターンで増加したコメントブースト量
  currentCommentBoost?: number; // 現在の累積コメントブースト量
  cleansed?: boolean; // プレイヤーのデバフが全て解除されたか
}

// ========================================
// Battle State
// ========================================

/** バトル全体の状態 */
export interface BattleState {
  isActive: boolean; // バトル進行中かどうか
  currentTurn: number; // 現在のターン数
  player: PlayerState;
  enemy: EnemyState;
  audience: AudienceComposition;
  comments: Comment[]; // 現在のコメントプール（最大10件）
  turnHistory: TurnResult[]; // 過去のターン履歴
  winner: 'player' | 'enemy' | 'draw' | null; // 勝者
  config: BattleParamsV2; // バトル設定パラメータ
  pendingSuperchatTurn: boolean; // スパチャ追撃待機
  superchatBoostTurns?: number; // スパチャ確率上昇ターン残数
  superchatBoostMultiplier?: number; // スパチャ確率の倍率
  nextAttackMultiplier?: {
    player: number;
    enemy: number;
  }; // 次ターンの攻撃力倍率
  commentPoolReduction?: number; // 減少したコメント上限
  skillUses: {
    player: SkillUsageMap;
    enemy: SkillUsageMap;
  };
  permanentCommentBoost: number; // 永続的なコメント追加量補正（+1, +2など）
}

// ========================================
// Calculation Parameters
// ========================================

/** ダメージ計算パラメータ */
export interface DamageParams {
  action: EmotionType;
  basePower: number;
  fanRate: number;
  consumedCommentCount: number; // 消費したコメント数
  matchupResult: BattleResult; // 相性判定結果
  activeEffects: SpecialEffect[]; // 有効な特殊効果
}

/** ファン変動計算パラメータ */
export interface FanChangeParams {
  result: BattleResult;
  consumedCommentCount: number;
}

/** 特殊効果発動パラメータ */
export interface SpecialEffectTriggerParams {
  emotion: EmotionType;
  target: 'player' | 'enemy';
  damage: number; // 与えたダメージ（drain計算用）
}

// ========================================
// Dialogue System
// ========================================

/** 会話トリガーのタイミング */
export type DialogueTrigger =
  | 'battle_start'
  | 'turn_start'
  | 'turn_end'
  | 'special_effect'
  | 'low_hp'
  | 'high_fan_rate'
  | 'battle_end';

/** 会話データ */
export interface Dialogue {
  trigger: DialogueTrigger;
  speaker: 'player' | 'enemy';
  text: string;
  emotion?: EmotionType; // 感情に関連する会話の場合
}

/** 会話状態 */
export interface DialogueState {
  queue: Dialogue[]; // 表示待ちの会話
  current: Dialogue | null; // 現在表示中の会話
}
