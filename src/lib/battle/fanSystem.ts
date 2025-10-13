/**
 * ファンシステム（オーディエンスシンク）ロジック
 * ファン率の変動と観客構成の更新を管理
 */

import type {
  FanChangeParams,
  AudienceComposition,
  ActionType,
  BattleResult,
  AntiLevel,
  BattleParams,
} from './types';

/**
 * ファン率の変化量を計算
 * 勝敗補正 + 指示補正 - アンチ補正
 */
export function calculateFanChange(
  params: FanChangeParams,
  battleParams: BattleParams
): number {
  const { result, action, commandFollowed, antiLevel } = params;

  let change = 0;

  // 1. 勝敗補正
  if (result === 'win') {
    change += battleParams.FAN_CHANGE.WIN;
  } else if (result === 'draw') {
    change += battleParams.FAN_CHANGE.DRAW_WIN;
  } else if (result === 'lose') {
    change += battleParams.FAN_CHANGE.LOSE;
  }

  // 2. 技成功時の追加ボーナス
  if (result === 'win') {
    if (action === 'appeal') {
      change += battleParams.FAN_CHANGE.APPEAL_SUCCESS;
    } else if (action === 'guard') {
      change += battleParams.FAN_CHANGE.GUARD_SUCCESS;
    }
  }

  // 3. 観客指示補正
  if (commandFollowed) {
    change += battleParams.FAN_CHANGE.COMMAND_FOLLOW;
  } else {
    change += battleParams.FAN_CHANGE.COMMAND_BREAK;
  }

  // 4. アンチレベルによるペナルティ
  const antiPenalty = battleParams.ANTI_EFFECTS[`LV${antiLevel}`].fanPenalty;
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
  let { playerFans, enemyFans, neutralFans } = current;

  // プレイヤーファンの変動
  if (playerFanChange > 0) {
    // ファン増加: 中立と敵ファンから半分ずつ奪う
    const halfGain = playerFanChange / 2;

    // 1. 中立ファンから半分を試みる
    const gainFromNeutral = Math.min(halfGain, neutralFans);

    // 2. 敵ファンから残りを奪う
    const remainingGain = playerFanChange - gainFromNeutral;
    const gainFromEnemy = Math.min(remainingGain, enemyFans);

    // 3. 適用
    neutralFans -= gainFromNeutral;
    enemyFans -= gainFromEnemy;
    playerFans += gainFromNeutral + gainFromEnemy;
  } else if (playerFanChange < 0) {
    // ファン減少: どっちつかずに移動
    const loss = Math.min(Math.abs(playerFanChange), playerFans);
    playerFans -= loss;
    neutralFans += loss;
  }

  // 敵ファンの変動
  if (enemyFanChange > 0) {
    // ファン増加: 中立とプレイヤーファンから半分ずつ奪う
    const halfGain = enemyFanChange / 2;

    // 1. 中立ファンから半分を試みる
    const gainFromNeutral = Math.min(halfGain, neutralFans);

    // 2. プレイヤーファンから残りを奪う
    const remainingGain = enemyFanChange - gainFromNeutral;
    const gainFromPlayer = Math.min(remainingGain, playerFans);

    // 3. 適用
    neutralFans -= gainFromNeutral;
    playerFans -= gainFromPlayer;
    enemyFans += gainFromNeutral + gainFromPlayer;
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
  antiLevel: AntiLevel,
  battleParams: BattleParams
): number {
  let totalCommandChange = 0;

  // 各指示に対する従った/破った補正を合計
  for (const followed of commandsFollowed) {
    if (followed) {
      totalCommandChange += battleParams.FAN_CHANGE.COMMAND_FOLLOW;
    } else {
      totalCommandChange += battleParams.FAN_CHANGE.COMMAND_BREAK;
    }
  }

  let change = 0;

  // 1. 勝敗補正
  if (result === 'win') {
    change += battleParams.FAN_CHANGE.WIN;
  } else if (result === 'draw') {
    change += battleParams.FAN_CHANGE.DRAW_WIN;
  } else if (result === 'lose') {
    change += battleParams.FAN_CHANGE.LOSE;
  }

  // 2. 技成功時の追加ボーナス
  if (result === 'win') {
    if (action === 'appeal') {
      change += battleParams.FAN_CHANGE.APPEAL_SUCCESS;
    } else if (action === 'guard') {
      change += battleParams.FAN_CHANGE.GUARD_SUCCESS;
    }
  }

  // 3. 観客指示補正（合計）
  change += totalCommandChange;

  // 4. アンチレベルによるペナルティ
  const antiPenalty = battleParams.ANTI_EFFECTS[`LV${antiLevel}`].fanPenalty;
  change *= 1 - antiPenalty;

  return change;
}

/**
 * 値を指定範囲にクランプ
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}