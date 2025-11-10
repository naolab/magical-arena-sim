/**
 * Damage Calculation
 * Calculate damage with fan rate, comment, and matchup bonuses
 */

import { DamageParams, SpecialEffect } from './types';
import { getMatchupBonus } from './emotionSystem';
import type { BattleParamsV2 } from '@/contexts/BattleParamsV2Context';

// ========================================
// Constants
// ========================================

/** コメント1つあたりの補正（+20%） */
const COMMENT_BONUS_PER_COUNT = 0.2;

/** ファン率の最大補正（ファン率100%で+200% = 3倍） */
const FAN_RATE_MAX_BONUS = 2.0;

// ========================================
// Damage Calculation
// ========================================

/**
 * ダメージを計算
 * @param params ダメージ計算パラメータ
 * @param config バトル設定パラメータ
 * @returns 最終ダメージ
 */
export function calculateDamage(params: DamageParams, config: BattleParamsV2): number {
  const {
    basePower,
    fanRate,
    consumedCommentCount,
    matchupResult,
    activeEffects,
  } = params;

  // 1. 基本ダメージ
  const baseDamage = basePower;

  // 2. ファン率補正
  const fanRateMultiplier = calculateFanRateBonus(fanRate, config);

  // 3. コメント補正
  const commentMultiplier = calculateCommentBonus(consumedCommentCount, config);

  // 4. 相性補正
  const matchupMultiplier = getMatchupBonus(matchupResult, config);

  // 5. 特殊効果補正（バフ・デバフ）
  const effectMultiplier = calculateEffectBonus(activeEffects);

  // 最終ダメージ = 基本ダメージ × 各種補正
  const finalDamage =
    baseDamage *
    fanRateMultiplier *
    commentMultiplier *
    matchupMultiplier *
    effectMultiplier;

  // 小数点以下を四捨五入
  return Math.round(finalDamage);
}

/**
 * ファン率による補正を計算
 * @param fanRate ファン率 (0.0 ~ 1.0)
 * @param config バトル設定パラメータ
 * @returns 補正倍率
 */
export function calculateFanRateBonus(fanRate: number, config: BattleParamsV2): number {
  // ファン率0%: 1.0倍
  // ファン率100%: 1.0 + fanRateMaxBonus
  return 1.0 + fanRate * config.fanRateMaxBonus;
}

/**
 * コメント数による補正を計算
 * @param consumedCount 消費したコメント数
 * @param config バトル設定パラメータ
 * @returns 補正倍率
 */
export function calculateCommentBonus(consumedCount: number, config: BattleParamsV2): number {
  // 1コメントにつき commentBonusPerCount 分上昇
  return 1.0 + consumedCount * config.commentBonusPerCount;
}

/**
 * 特殊効果（バフ・デバフ）による補正を計算
 * @param activeEffects 有効な特殊効果
 * @returns 補正倍率
 */
export function calculateEffectBonus(activeEffects: SpecialEffect[]): number {
  let multiplier = 1.0;

  for (const effect of activeEffects) {
    if (effect.type === 'buff') {
      // バフ: 攻撃力上昇
      multiplier *= 1.0 + effect.magnitude / 100;
    } else if (effect.type === 'debuff') {
      // デバフ: 攻撃力低下
      multiplier *= 1.0 - effect.magnitude / 100;
    }
  }

  return multiplier;
}

// ========================================
// Damage Display Helpers
// ========================================

/**
 * ダメージの詳細情報を文字列で取得
 * @param params ダメージ計算パラメータ
 * @param config バトル設定パラメータ
 * @returns ダメージの詳細説明
 */
export function getDamageBreakdown(params: DamageParams, config: BattleParamsV2): string {
  const {
    basePower,
    fanRate,
    consumedCommentCount,
    matchupResult,
    activeEffects,
  } = params;

  const fanRateMultiplier = calculateFanRateBonus(fanRate, config);
  const commentMultiplier = calculateCommentBonus(consumedCommentCount, config);
  const matchupMultiplier = getMatchupBonus(matchupResult, config);
  const effectMultiplier = calculateEffectBonus(activeEffects);
  const finalDamage = calculateDamage(params, config);

  return `
基本攻撃力: ${basePower}
ファン率補正: ×${fanRateMultiplier.toFixed(2)} (ファン率${(fanRate * 100).toFixed(0)}%)
コメント補正: ×${commentMultiplier.toFixed(2)} (${consumedCommentCount}コメント)
相性補正: ×${matchupMultiplier.toFixed(2)} (${matchupResult})
効果補正: ×${effectMultiplier.toFixed(2)}
---
最終ダメージ: ${finalDamage}
  `.trim();
}

/**
 * ダメージ予測を計算（実際に与える前の予測用）
 * @param params ダメージ計算パラメータ
 * @param config バトル設定パラメータ
 * @returns 予測ダメージ
 */
export function predictDamage(params: DamageParams, config: BattleParamsV2): number {
  return calculateDamage(params, config);
}
