/**
 * Emotion System
 * 4-way emotion matchup logic
 */

import { EmotionType, BattleResult } from './types';
import type { BattleParamsV2 } from '@/contexts/BattleParamsV2Context';

// ========================================
// Emotion Matchup Configuration
// ========================================

/**
 * 4すくみの相性関係
 * Rage > Terror > Grief > Ecstasy > Rage
 */
const EMOTION_MATCHUP: Record<EmotionType, EmotionType> = {
  rage: 'terror',     // Rage beats Terror
  terror: 'grief',    // Terror beats Grief
  grief: 'ecstasy',   // Grief beats Ecstasy
  ecstasy: 'rage',    // Ecstasy beats Rage
};

/**
 * 相性による補正倍率
 */
const MATCHUP_BONUS = {
  win: 1.5,   // 有利
  draw: 1.0,  // 互角
  lose: 0.7,  // 不利
} as const;

/**
 * 感情の色設定
 */
const EMOTION_COLORS: Record<EmotionType, string> = {
  rage: '#ef4444',     // 赤
  terror: '#22c55e',   // 緑
  grief: '#3b82f6',    // 青
  ecstasy: '#eab308',  // 黄
};

/**
 * 感情の表示名
 */
const EMOTION_NAMES: Record<EmotionType, string> = {
  rage: 'Rage',
  terror: 'Terror',
  grief: 'Grief',
  ecstasy: 'Ecstasy',
};

// ========================================
// Emotion Judgement
// ========================================

/**
 * 4すくみの勝敗を判定
 * @param playerEmotion プレイヤーの感情
 * @param enemyEmotion 敵の感情
 * @returns プレイヤー視点での勝敗
 */
export function judgeEmotion(
  playerEmotion: EmotionType,
  enemyEmotion: EmotionType
): BattleResult {
  if (playerEmotion === enemyEmotion) {
    return 'draw'; // 同じ感情なら引き分け
  }

  // プレイヤーが勝つパターン: playerがenemyに強い
  if (EMOTION_MATCHUP[playerEmotion] === enemyEmotion) {
    return 'win';
  }

  // それ以外は負け
  return 'lose';
}

/**
 * 相性による補正倍率を取得
 * @param result 勝敗結果
 * @param config バトル設定パラメータ（省略時はデフォルト値）
 * @returns 補正倍率
 */
export function getMatchupBonus(result: BattleResult, config?: BattleParamsV2): number {
  if (config && config.enableMatchups === false) {
    return 1.0;
  }

  if (config) {
    if (result === 'win') return config.matchupBonusWin;
    if (result === 'lose') return config.matchupBonusLose;
    return config.matchupBonusDraw;
  }

  return MATCHUP_BONUS[result];
}

// ========================================
// Emotion Metadata
// ========================================

/**
 * 感情の色を取得
 * @param emotion 感情
 * @returns カラーコード
 */
export function getEmotionColor(emotion: EmotionType): string {
  return EMOTION_COLORS[emotion];
}

/**
 * 感情の表示名を取得
 * @param emotion 感情
 * @returns 表示名
 */
export function getEmotionName(emotion: EmotionType): string {
  return EMOTION_NAMES[emotion];
}

/**
 * すべての感情タイプを取得
 * @returns 感情タイプの配列
 */
export function getAllEmotions(): EmotionType[] {
  return ['rage', 'terror', 'grief', 'ecstasy'];
}

/**
 * 感情に勝てる感情を取得
 * @param emotion 感情
 * @returns 勝てる相手の感情
 */
export function getWinningEmotion(emotion: EmotionType): EmotionType {
  return EMOTION_MATCHUP[emotion];
}

/**
 * 感情に負ける感情を取得
 * @param emotion 感情
 * @returns 負ける相手の感情
 */
export function getLosingEmotion(emotion: EmotionType): EmotionType {
  // 逆引き: どの感情がこの感情に勝つか
  const entry = Object.entries(EMOTION_MATCHUP).find(([_, beats]) => beats === emotion);
  return entry ? (entry[0] as EmotionType) : emotion;
}
