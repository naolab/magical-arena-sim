/**
 * Special Effects System
 * Handles emotion-specific special effects
 */

import { SpecialEffect, SpecialEffectTriggerParams, EmotionType } from './types';

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
 * @returns 追加ダメージ量
 */
export function applyRageEffect(params: SpecialEffectTriggerParams): number {
  const { damage } = params;
  // 与えたダメージの50%を追加ダメージとして返す
  return Math.round(damage * RAGE_EXTRA_DAMAGE_RATIO);
}

/**
 * Terror（恐怖）の特殊効果: 相手にデバフ付与
 * @param params トリガーパラメータ
 * @returns デバフ効果
 */
export function applyTerrorEffect(
  params: SpecialEffectTriggerParams
): SpecialEffect {
  const { emotion, target } = params;

  // 相手の攻撃力を低下させるデバフを付与
  return {
    type: 'debuff',
    emotion,
    duration: TERROR_DEBUFF_DURATION,
    magnitude: TERROR_DEBUFF_MAGNITUDE,
    target: target === 'player' ? 'enemy' : 'player', // 相手に付与
  };
}

/**
 * Grief（悲嘆）の特殊効果: HP吸収
 * @param params トリガーパラメータ
 * @returns 回復HP量
 */
export function applyGriefEffect(params: SpecialEffectTriggerParams): number {
  const { damage } = params;
  // 与えたダメージの40%をHPとして回復
  return Math.round(damage * GRIEF_DRAIN_RATIO);
}

/**
 * Ecstasy（恍惚）の特殊効果: 自分にバフ付与
 * @param params トリガーパラメータ
 * @returns バフ効果
 */
export function applyEcstasyEffect(
  params: SpecialEffectTriggerParams
): SpecialEffect {
  const { emotion, target } = params;

  // 自分の攻撃力を上昇させるバフを付与
  return {
    type: 'buff',
    emotion,
    duration: ECSTASY_BUFF_DURATION,
    magnitude: ECSTASY_BUFF_MAGNITUDE,
    target, // 自分に付与
  };
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
    case 'extra_damage':
      return `${emotionName}: 追加ダメージ`;
    case 'drain':
      return `${emotionName}: HP吸収`;
    default:
      return `${emotionName}: 効果`;
  }
}
