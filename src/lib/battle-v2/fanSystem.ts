/**
 * Fan System
 * Manages fan rates and audience composition
 */

import { AudienceComposition, BattleResult } from './types';

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
 * 勝敗に応じたファン率の変化量を計算
 * @param result 勝敗結果
 * @param commentCount 消費したコメント数
 * @returns ファン率の変化量
 */
export function calculateFanRateChange(
  result: BattleResult,
  commentCount: number
): number {
  let change = 0;

  // 基本変動
  if (result === 'win') {
    change = 0.1; // +10%
  } else if (result === 'lose') {
    change = -0.05; // -5%
  } else {
    change = 0; // 引き分けは変化なし
  }

  // コメントボーナス: 1コメントにつき+2%
  change += commentCount * 0.02;

  return change;
}

// ========================================
// Audience Composition
// ========================================

/**
 * 初期の観客構成を生成
 * @returns 初期観客構成
 */
export function initializeAudienceComposition(): AudienceComposition {
  return {
    playerFans: 0.2,    // プレイヤーファン 20%
    enemyFans: 0.2,     // 敵ファン 20%
    neutralFans: 0.6,   // 中立ファン 60%
  };
}

/**
 * 観客構成を更新
 * @param current 現在の観客構成
 * @param result プレイヤー視点での勝敗
 * @param playerFanRate プレイヤーのファン率
 * @param enemyFanRate 敵のファン率
 * @returns 更新された観客構成
 */
export function updateAudienceComposition(
  current: AudienceComposition,
  result: BattleResult,
  playerFanRate: number,
  enemyFanRate: number
): AudienceComposition {
  const fanStealAmount = 0.05; // 1回の勝利で5%のファンを奪う

  let playerFans = current.playerFans;
  let enemyFans = current.enemyFans;
  let neutralFans = current.neutralFans;

  if (result === 'win') {
    // プレイヤー勝利: 中立ファンと敵ファンを奪う
    const fromNeutral = Math.min(neutralFans, fanStealAmount / 2);
    const fromEnemy = Math.min(enemyFans, fanStealAmount / 2);

    playerFans += fromNeutral + fromEnemy;
    neutralFans -= fromNeutral;
    enemyFans -= fromEnemy;
  } else if (result === 'lose') {
    // プレイヤー敗北: プレイヤーファンが離れる
    const toNeutral = Math.min(playerFans, fanStealAmount / 2);
    const toEnemy = Math.min(playerFans - toNeutral, fanStealAmount / 2);

    playerFans -= toNeutral + toEnemy;
    neutralFans += toNeutral;
    enemyFans += toEnemy;
  }

  // 合計が1.0になるように正規化
  const total = playerFans + enemyFans + neutralFans;
  if (total > 0) {
    playerFans /= total;
    enemyFans /= total;
    neutralFans /= total;
  }

  return {
    playerFans: Math.max(0, Math.min(1, playerFans)),
    enemyFans: Math.max(0, Math.min(1, enemyFans)),
    neutralFans: Math.max(0, Math.min(1, neutralFans)),
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
  const neutralPercent = (composition.neutralFans * 100).toFixed(0);

  return `プレイヤーファン: ${playerPercent}% / 敵ファン: ${enemyPercent}% / 中立: ${neutralPercent}%`;
}
