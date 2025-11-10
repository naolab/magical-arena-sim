/**
 * Fan System
 * Manages fan rates and audience composition
 */

import { AudienceComposition, BattleResult } from './types';
import type { BattleParamsV2 } from '@/contexts/BattleParamsV2Context';

// ========================================
// Constants
// ========================================

/** ファン率のしきい値と対応する補正倍率 */
const FAN_RATE_THRESHOLDS = [
  { min: 0.0, max: 0.2, bonus: 1.0 },   // 0-20%: ×1.0
  { min: 0.2, max: 0.5, bonus: 1.2 },   // 21-50%: ×1.2
  { min: 0.5, max: 0.8, bonus: 1.5 },   // 51-80%: ×1.5
  { min: 0.8, max: 1.0, bonus: 2.0 },   // 81-100%: ×2.0
];

// ========================================
// Fan Rate Bonus
// ========================================

/**
 * ファン率に応じた補正倍率を取得
 * @param fanRate ファン率 (0.0 ~ 1.0)
 * @returns 補正倍率
 */
export function getFanRateBonus(fanRate: number): number {
  for (const threshold of FAN_RATE_THRESHOLDS) {
    if (fanRate >= threshold.min && fanRate <= threshold.max) {
      return threshold.bonus;
    }
  }
  return 1.0; // フォールバック
}

/**
 * ファン率のランクを取得
 * @param fanRate ファン率 (0.0 ~ 1.0)
 * @returns ランク名
 */
export function getFanRateRank(fanRate: number): string {
  if (fanRate >= 0.8) return 'S';
  if (fanRate >= 0.5) return 'A';
  if (fanRate >= 0.2) return 'B';
  return 'C';
}

// ========================================
// Fan Rate Changes
// ========================================

/**
 * プレイヤーのファン率変化量を計算（消費コメント数×5%）
 * @param commentCount 消費したコメント数
 * @returns ファン率の変化量
 */
export function calculatePlayerFanRateChange(commentCount: number): number {
  return commentCount * 0.05;
}

/**
 * 敵のファン率変化量を計算（毎ターン+10%固定）
 * @returns ファン率の変化量
 */
export function calculateEnemyFanRateChange(): number {
  return 0.10;
}

// ========================================
// Audience Composition
// ========================================

/**
 * 初期の観客構成を生成（独立したファン率システム）
 * @param config バトル設定パラメータ
 * @returns 初期観客構成
 */
export function initializeAudienceComposition(config: BattleParamsV2): AudienceComposition {
  return {
    playerFans: config.initialPlayerFans,
    enemyFans: config.initialEnemyFans,
  };
}

/**
 * 観客構成を更新（独立したファン率システム）
 * @param current 現在の観客構成
 * @param playerCommentCount プレイヤーが消費したコメント数
 * @returns 更新された観客構成
 */
export function updateAudienceComposition(
  current: AudienceComposition,
  playerCommentCount: number
): AudienceComposition {
  // プレイヤー：消費コメント数×5%増加
  const playerChange = calculatePlayerFanRateChange(playerCommentCount);
  const newPlayerFans = Math.max(0, Math.min(1, current.playerFans + playerChange));

  // 敵：毎ターン10%増加
  const enemyChange = calculateEnemyFanRateChange();
  const newEnemyFans = Math.max(0, Math.min(1, current.enemyFans + enemyChange));

  return {
    playerFans: newPlayerFans,
    enemyFans: newEnemyFans,
  };
}

/**
 * 観客構成からファン率を計算
 * @param composition 観客構成
 * @param side プレイヤーか敵か
 * @returns ファン率
 */
export function calculateFanRateFromComposition(
  composition: AudienceComposition,
  side: 'player' | 'enemy'
): number {
  if (side === 'player') {
    return composition.playerFans;
  } else {
    return composition.enemyFans;
  }
}

/**
 * 観客構成の詳細情報を取得
 * @param composition 観客構成
 * @returns 詳細情報文字列
 */
export function getAudienceCompositionDescription(
  composition: AudienceComposition
): string {
  const playerPercent = (composition.playerFans * 100).toFixed(0);
  const enemyPercent = (composition.enemyFans * 100).toFixed(0);

  return `プレイヤーファン: ${playerPercent}% / 敵ファン: ${enemyPercent}%`;
}
