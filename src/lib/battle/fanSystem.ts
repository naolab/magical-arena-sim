/**
 * ファンシステム（オーディエンスシンク）ロジック
 * ファン率の変動と観客構成の更新を管理
 */

import { BATTLE_PARAMS } from '@/config/battleParams';
import type { FanChangeParams, AudienceComposition, ActionType, BattleResult, AntiLevel, AudienceCommand } from './types';

/**
 * ファン率の変化量を計算
 * 勝敗補正 + 指示補正 - アンチ補正
 */
export function calculateFanChange(params: FanChangeParams): number {
  const { result, action, commandFollowed, antiLevel } = params;

  let change = 0;

  // 1. 勝敗補正
  if (result === 'win') {
    change += BATTLE_PARAMS.FAN_CHANGE.WIN;
  } else if (result === 'draw') {
    change += BATTLE_PARAMS.FAN_CHANGE.DRAW_WIN;
  } else if (result === 'lose') {
    change += BATTLE_PARAMS.FAN_CHANGE.LOSE;
  }

  // 2. 技成功時の追加ボーナス
  if (result === 'win') {
    if (action === 'appeal') {
      change += BATTLE_PARAMS.FAN_CHANGE.APPEAL_SUCCESS;
    } else if (action === 'guard') {
      change += BATTLE_PARAMS.FAN_CHANGE.GUARD_SUCCESS;
    }
  }

  // 3. 観客指示補正
  if (commandFollowed) {
    change += BATTLE_PARAMS.FAN_CHANGE.COMMAND_FOLLOW;
  } else {
    change += BATTLE_PARAMS.FAN_CHANGE.COMMAND_BREAK;
  }

  // 4. アンチレベルによるペナルティ
  const antiPenalty = BATTLE_PARAMS.ANTI_EFFECTS[`LV${antiLevel}`].fanPenalty;
  change *= 1 - antiPenalty;

  return change;
}

/**
 * 観客構成を更新
 * ファン率の変化に応じて、どっちつかずのファンと敵ファンから移動
 */
export function updateAudienceComposition(
  current: AudienceComposition,
  playerFanChange: number,
  enemyFanChange: number
): AudienceComposition {
  const MIN_NEUTRAL_RESERVE = 0.1;
  let { playerFans, enemyFans, neutralFans } = current;

  // プレイヤーファンの変動
  if (playerFanChange > 0) {
    // ファン増加: どっちつかずのリザーブを残して獲得
    const availableNeutral = Math.max(neutralFans - MIN_NEUTRAL_RESERVE, 0);
    const gain = Math.min(playerFanChange, availableNeutral);
    playerFans += gain;
    neutralFans -= gain;
  } else if (playerFanChange < 0) {
    // ファン減少: どっちつかずに移動
    const loss = Math.min(Math.abs(playerFanChange), playerFans);
    playerFans -= loss;
    neutralFans += loss;
  }

  // 敵ファンの変動
  if (enemyFanChange > 0) {
    const availableNeutral = Math.max(neutralFans - MIN_NEUTRAL_RESERVE, 0);
    const gain = Math.min(enemyFanChange, availableNeutral);
    enemyFans += gain;
    neutralFans -= gain;
  } else if (enemyFanChange < 0) {
    const loss = Math.min(Math.abs(enemyFanChange), enemyFans);
    enemyFans -= loss;
    neutralFans += loss;
  }

  // 合計が1.0になるように正規化
  const total = playerFans + enemyFans + neutralFans;
  if (total > 0) {
    playerFans /= total;
    enemyFans /= total;
    neutralFans /= total;
  }

  // 0-1の範囲にクランプ
  return {
    playerFans: clamp(playerFans, 0, 1),
    enemyFans: clamp(enemyFans, 0, 1),
    neutralFans: clamp(neutralFans, 0, 1),
  };
}

/**
 * 複数の観客指示に対するファン率の変化量を計算（合計）
 */
export function calculateMultipleFanChange(
  result: BattleResult,
  action: ActionType,
  commandsFollowed: boolean[],
  antiLevel: AntiLevel
): number {
  let totalCommandChange = 0;

  // 各指示に対する従った/破った補正を合計
  for (const followed of commandsFollowed) {
    if (followed) {
      totalCommandChange += BATTLE_PARAMS.FAN_CHANGE.COMMAND_FOLLOW;
    } else {
      totalCommandChange += BATTLE_PARAMS.FAN_CHANGE.COMMAND_BREAK;
    }
  }

  let change = 0;

  // 1. 勝敗補正
  if (result === 'win') {
    change += BATTLE_PARAMS.FAN_CHANGE.WIN;
  } else if (result === 'draw') {
    change += BATTLE_PARAMS.FAN_CHANGE.DRAW_WIN;
  } else if (result === 'lose') {
    change += BATTLE_PARAMS.FAN_CHANGE.LOSE;
  }

  // 2. 技成功時の追加ボーナス
  if (result === 'win') {
    if (action === 'appeal') {
      change += BATTLE_PARAMS.FAN_CHANGE.APPEAL_SUCCESS;
    } else if (action === 'guard') {
      change += BATTLE_PARAMS.FAN_CHANGE.GUARD_SUCCESS;
    }
  }

  // 3. 観客指示補正（合計）
  change += totalCommandChange;

  // 4. アンチレベルによるペナルティ
  const antiPenalty = BATTLE_PARAMS.ANTI_EFFECTS[`LV${antiLevel}`].fanPenalty;
  change *= 1 - antiPenalty;

  return change;
}

/**
 * 値を指定範囲にクランプ
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
