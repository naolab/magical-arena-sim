/**
 * Special Effects System
 * Handles emotion-specific special effects
 *
 * Note: This system works in conjunction with the Action Variants system.
 * - Selected variants are stored in config.selectedActionVariants
 * - Effect values (magnitude, duration) are controlled by config parameters
 * - When multiple variants per emotion are added, this system will need to
 *   dispatch to different effect functions based on the selected variant
 */

import { SpecialEffect, SpecialEffectTriggerParams, EmotionType, Comment } from './types';
import type { BattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { getVariantDefinition } from './actionVariants';

// ========================================
// Extended Types for Variant Effects
// ========================================

/** 拡張された特殊効果トリガーパラメータ（バリアント対応） */
export interface ExtendedEffectTriggerParams extends SpecialEffectTriggerParams {
  enemyMaxHp?: number; // 敵の最大HP（割合ダメージ用）
  playerHp?: number; // プレイヤーの現在HP（HP依存回復用）
  playerMaxHp?: number; // プレイヤーの最大HP（HP依存回復用）
  comments?: Comment[]; // コメントプール（コメント変換用）
}

/** コメント変換の結果 */
export interface CommentConversionResult {
  comments: Comment[];
  convertedCommentIds: string[];
  targetEmotion: EmotionType;
}

// ========================================
// Constants
// ========================================

/** Rage: 追加ダメージの割合（基本ダメージの50%） */
const RAGE_EXTRA_DAMAGE_RATIO = 0.5;

/** Terror: デバフの強度（攻撃力-20%） */
const TERROR_DEBUFF_MAGNITUDE = 20;

/** Terror: デバフの持続ターン */
const TERROR_DEBUFF_DURATION = 2;

/** Grief: HP吸収の割合（与えたダメージの40%） */
const GRIEF_DRAIN_RATIO = 0.4;

/** Ecstasy: バフの強度（攻撃力+30%） */
const ECSTASY_BUFF_MAGNITUDE = 30;

/** Ecstasy: バフの持続ターン */
const ECSTASY_BUFF_DURATION = 2;

// ========================================
// Special Effect Triggers
// ========================================

/**
 * Rage（激怒）の特殊効果: 追加ダメージ
 * @param params トリガーパラメータ
 * @param config バトル設定パラメータ
 * @returns 追加ダメージ量
 */
export function applyRageEffect(params: SpecialEffectTriggerParams, config: BattleParamsV2): number {
  const { damage } = params;
  // 与えたダメージの指定割合を追加ダメージとして返す
  return Math.round(damage * config.rageExtraDamageRatio);
}

/**
 * Terror（恐怖）の特殊効果: 相手にデバフ付与
 * @param params トリガーパラメータ
 * @param config バトル設定パラメータ
 * @returns デバフ効果
 */
export function applyTerrorEffect(
  params: SpecialEffectTriggerParams,
  config: BattleParamsV2
): SpecialEffect {
  const { emotion, target } = params;

  // 相手の攻撃力を低下させるデバフを付与
  return {
    type: 'debuff',
    emotion,
    duration: config.terrorDebuffDuration,
    magnitude: config.terrorDebuffMagnitude,
    target: target === 'player' ? 'enemy' : 'player', // 相手に付与
  };
}

/**
 * Grief（悲嘆）の特殊効果: HP吸収
 * @param params トリガーパラメータ
 * @param config バトル設定パラメータ
 * @returns 回復HP量
 */
export function applyGriefEffect(params: SpecialEffectTriggerParams, config: BattleParamsV2): number {
  const { damage } = params;
  // 与えたダメージの指定割合をHPとして回復
  return Math.round(damage * config.griefDrainRatio);
}

/**
 * Ecstasy（恍惚）の特殊効果: 自分にバフ付与
 * @param params トリガーパラメータ
 * @param config バトル設定パラメータ
 * @returns バフ効果
 */
export function applyEcstasyEffect(
  params: SpecialEffectTriggerParams,
  config: BattleParamsV2
): SpecialEffect {
  const { emotion, target } = params;

  // 自分の攻撃力を上昇させるバフを付与
  return {
    type: 'buff',
    emotion,
    duration: config.ecstasyBuffDuration,
    magnitude: config.ecstasyBuffMagnitude,
    target, // 自分に付与
  };
}

// ========================================
// New Variant-Specific Effects
// ========================================

/**
 * Rage Percentage: 敵の最大HPに応じた割合ダメージ
 * @param params 拡張トリガーパラメータ
 * @param variant バリアント定義
 * @returns 追加ダメージ量
 */
export function applyRagePercentageEffect(
  params: ExtendedEffectTriggerParams,
  variant: { magnitude: number }
): number {
  const { enemyMaxHp } = params;
  if (!enemyMaxHp) return 0;

  // 敵の最大HP × 割合（magnitude%）
  return Math.round(enemyMaxHp * (variant.magnitude / 100));
}

/**
 * Terror Poison: 毒効果（持続ダメージ）
 * @param params トリガーパラメータ
 * @param variant バリアント定義
 * @returns 毒効果
 */
export function applyTerrorPoisonEffect(
  params: SpecialEffectTriggerParams,
  variant: { magnitude: number; duration?: number }
): SpecialEffect {
  const { emotion, target } = params;

  return {
    type: 'poison',
    emotion,
    duration: variant.duration || 3,
    magnitude: variant.magnitude, // 毎ターンのダメージ量
    target: target === 'player' ? 'enemy' : 'player', // 相手に付与
  };
}

/**
 * Terror - 呪い効果: 割合持続ダメージ
 * @param params トリガーパラメータ
 * @param variant バリアント定義
 * @returns 呪い効果
 */
export function applyTerrorCurseEffect(
  params: SpecialEffectTriggerParams,
  variant: { magnitude: number; duration?: number }
): SpecialEffect {
  const { emotion, target } = params;

  return {
    type: 'curse',
    emotion,
    duration: variant.duration || 3,
    magnitude: variant.magnitude, // 最大HPの%
    target: target === 'player' ? 'enemy' : 'player', // 相手に付与
  };
}

/**
 * Grief Desperate: HP率に応じた回復（HP低いほど回復UP）
 * @param params 拡張トリガーパラメータ
 * @param variant バリアント定義
 * @returns 回復HP量
 */
export function applyGriefDesperateEffect(
  params: ExtendedEffectTriggerParams,
  variant: { magnitude: number }
): number {
  const { playerMaxHp } = params;
  if (!playerMaxHp) return 0;

  // 最大HPに対する固定割合回復
  return Math.round(playerMaxHp * (variant.magnitude / 100));
}

/**
 * Ecstasy Convert: コメント色変換
 * @param params 拡張トリガーパラメータ
 * @param variant バリアント定義
 * @returns 変換後のコメント配列
 */
export function applyEcstasyConvertEffect(
  params: ExtendedEffectTriggerParams,
  variant: { magnitude: number }
): CommentConversionResult | null {
  const { comments } = params;
  if (!comments || comments.length === 0) return null;

  const convertCount = variant.magnitude;
  if (convertCount <= 0) return null;

  const convertedComments = [...comments];
  const convertedIndices: number[] = [];
  const targetEmotion: EmotionType = 'rage'; // 赤（Rage）に変換

  // コメント全体から赤以外のコメントを探し、指定数分だけ変換
  for (let i = 0; i < convertedComments.length && convertedIndices.length < convertCount; i++) {
    if (convertedComments[i].emotion === targetEmotion) continue;
    convertedComments[i] = {
      ...convertedComments[i],
      emotion: targetEmotion,
    };
    convertedIndices.push(i);
  }

  if (convertedIndices.length === 0) {
    return null;
  }

  return {
    comments: convertedComments,
    convertedCommentIds: convertedIndices.map((index) => comments[index].id),
    targetEmotion,
  };
}

/**
 * Ecstasy - コメントブースト効果: 永続的にコメント追加量を増やす
 * @param variant バリアント定義
 * @returns コメント追加量の増加値
 */
export function applyEcstasyCommentBoostEffect(
  variant: { magnitude: number }
): number {
  return variant.magnitude; // 追加量（例: +1）
}

// ========================================
// Effect Management
// ========================================

/**
 * すべての効果の持続ターンを1減らす
 * @param effects 現在の効果リスト
 * @returns 更新された効果リスト
 */
export function updateEffectDurations(
  effects: SpecialEffect[]
): SpecialEffect[] {
  return effects.map((effect) => ({
    ...effect,
    duration: effect.duration - 1,
  }));
}

/**
 * 期限切れの効果を削除
 * @param effects 現在の効果リスト
 * @returns 有効な効果のみのリスト
 */
export function removeExpiredEffects(
  effects: SpecialEffect[]
): SpecialEffect[] {
  return effects.filter((effect) => effect.duration > 0);
}

/**
 * 指定したタイプの効果を取得
 * @param effects 効果リスト
 * @param type 効果タイプ
 * @returns 該当する効果の配列
 */
export function getEffectsByType(
  effects: SpecialEffect[],
  type: SpecialEffect['type']
): SpecialEffect[] {
  return effects.filter((effect) => effect.type === type);
}

/**
 * 指定した感情の効果を取得
 * @param effects 効果リスト
 * @param emotion 感情タイプ
 * @returns 該当する効果の配列
 */
export function getEffectsByEmotion(
  effects: SpecialEffect[],
  emotion: EmotionType
): SpecialEffect[] {
  return effects.filter((effect) => effect.emotion === emotion);
}

/**
 * バフ・デバフが有効かどうかをチェック
 * @param effects 効果リスト
 * @returns { hasBuff: バフがあるか, hasDebuff: デバフがあるか }
 */
export function checkActiveBuffsDebuffs(effects: SpecialEffect[]): {
  hasBuff: boolean;
  hasDebuff: boolean;
} {
  return {
    hasBuff: effects.some((e) => e.type === 'buff'),
    hasDebuff: effects.some((e) => e.type === 'debuff'),
  };
}

/**
 * 効果の説明文を生成
 * @param effect 特殊効果
 * @returns 説明文
 */
export function getEffectDescription(effect: SpecialEffect): string {
  const emotionNames: Record<EmotionType, string> = {
    rage: 'Rage',
    terror: 'Terror',
    grief: 'Grief',
    ecstasy: 'Ecstasy',
  };

  const emotionName = emotionNames[effect.emotion];

  switch (effect.type) {
    case 'buff':
      return `${emotionName}: 攻撃力+${effect.magnitude}% (残り${effect.duration}ターン)`;
    case 'debuff':
      return `${emotionName}: 攻撃力-${effect.magnitude}% (残り${effect.duration}ターン)`;
    case 'poison':
      return `${emotionName}: 毒 (${effect.magnitude}ダメージ/ターン, 残り${effect.duration}ターン)`;
    case 'curse':
      return `${emotionName}: 呪い (最大HPの${effect.magnitude}%ダメージ/ターン, 残り${effect.duration}ターン)`;
    case 'extra_damage':
      return `${emotionName}: 追加ダメージ`;
    case 'drain':
      return `${emotionName}: HP吸収`;
    default:
      return `${emotionName}: 効果`;
  }
}

/**
 * 毒効果によるダメージを計算・適用
 * @param effects 有効な効果リスト
 * @returns 毒ダメージの合計
 */
export function calculatePoisonDamage(effects: SpecialEffect[]): number {
  const poisonEffects = effects.filter((e) => e.type === 'poison');
  return poisonEffects.reduce((total, effect) => total + effect.magnitude, 0);
}

/**
 * 呪い効果によるダメージを計算・適用（割合ダメージ）
 * @param effects 有効な効果リスト
 * @param maxHp 対象の最大HP
 * @returns 呪いダメージの合計
 */
export function calculateCurseDamage(effects: SpecialEffect[], maxHp: number): number {
  const curseEffects = effects.filter((e) => e.type === 'curse');
  const totalPercentage = curseEffects.reduce((total, effect) => total + effect.magnitude, 0);
  return Math.round(maxHp * (totalPercentage / 100));
}
