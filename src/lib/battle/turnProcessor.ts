/**
 * ターン処理ロジック
 * 1ターンの完全な処理フローを実行
 */

import { judgeAction, getActionName, getResultName } from './judgement';
import { calculateDamage } from './damage';
import { calculateMultipleFanChange, updateAudienceComposition } from './fanSystem';
import { calculateMultipleAntiChange, getAntiLevel, clampAntiGauge } from './antiGauge';
import { checkMultipleCommands } from './audienceCommand';
import { BATTLE_PARAMS } from '@/config/battleParams';
import type { BattleState, ActionType, TurnResult } from './types';

/**
 * 1ターンを処理
 */
export function processTurn(
  state: BattleState,
  playerAction: ActionType,
  enemyAction: ActionType,
  battleParams: BattleParams,
): TurnResult {
  const turnNumber = state.currentTurn + 1;
  const commands = state.currentCommands;

  // 1. 三すくみ判定
  const judgement = judgeAction(playerAction, enemyAction);
  const enemyJudgement = judgeAction(enemyAction, playerAction);

  // 2. 観客指示のチェック（3つすべて）
  const commandsFollowed = checkMultipleCommands(commands, playerAction);

  // 3. ダメージ計算
  const damageToEnemy = calculateDamage(
    {
      action: playerAction,
      basePower: state.player.basePower,
      fanRate: state.player.fanRate,
      antiLevel: state.player.antiLevel,
      result: judgement,
      isDefending: enemyAction === 'guard',
      fanPowerBonusRate: battleParams.FAN_POWER_BONUS_RATE,
    },
    battleParams
  );

  const damageToPlayer = calculateDamage(
    {
      action: enemyAction,
      basePower: state.enemy.basePower,
      fanRate: state.enemy.fanRate,
      antiLevel: 0, // 敵にはアンチゲージなし
      result: enemyJudgement,
      isDefending: playerAction === 'guard',
      fanPowerBonusRate: battleParams.FAN_POWER_BONUS_RATE,
    },
    battleParams
  );

  // 4. アンチゲージ変動（3つの指示すべて）
  const antiChange = calculateMultipleAntiChange(
    {
      action: playerAction,
      result: judgement,
      commandsFollowed,
      audienceCommands: commands,
    },
    battleParams
  );

  const newAntiGauge = clampAntiGauge(state.player.antiGauge + antiChange);
  const newAntiLevel = getAntiLevel(newAntiGauge, battleParams);

  // 7. ファン変動計算（3つの指示すべて）
  const playerFanChange = calculateMultipleFanChange(
    judgement,
    playerAction,
    commandsFollowed,
    newAntiLevel
  );

  // 敵のファン変動計算（観客指示は常に±0）
  let enemyFanChange = 0;
  // 1. 勝敗補正
  if (enemyJudgement === 'win') {
    enemyFanChange += BATTLE_PARAMS.FAN_CHANGE.WIN;
  } else if (enemyJudgement === 'draw') {
    enemyFanChange += BATTLE_PARAMS.FAN_CHANGE.DRAW_WIN;
  } else if (enemyJudgement === 'lose') {
    enemyFanChange += BATTLE_PARAMS.FAN_CHANGE.LOSE;
  }
  // 2. 技成功ボーナス
  if (enemyJudgement === 'win') {
    if (enemyAction === 'appeal') {
      enemyFanChange += BATTLE_PARAMS.FAN_CHANGE.APPEAL_SUCCESS;
    } else if (enemyAction === 'guard') {
      enemyFanChange += BATTLE_PARAMS.FAN_CHANGE.GUARD_SUCCESS;
    }
  }

  // 8. ファン率更新
  const newPlayerFanRate = Math.max(0, Math.min(1, state.player.fanRate + playerFanChange));
  const newEnemyFanRate = Math.max(0, Math.min(1, state.enemy.fanRate + enemyFanChange));

  // 9. 観客構成更新
  const newAudience = updateAudienceComposition(state.audience, playerFanChange, enemyFanChange);

  // 10. メッセージ生成
  const message = generateTurnMessage({
    playerAction,
    enemyAction,
    judgement,
    commandsFollowed,
    damageToEnemy,
    damageToPlayer,
    playerFanChange,
    antiChange,
  });

  // ターン結果を返す
  return {
    turnNumber,
    playerAction,
    enemyAction,
    judgement,
    audienceCommands: commands,
    commandsFollowed,
    damage: {
      toEnemy: damageToEnemy,
      toPlayer: damageToPlayer,
    },
    fanChange: {
      player: playerFanChange,
      enemy: enemyFanChange,
    },
    antiChange,
    playerState: {
      ...state.player,
      hp: newPlayerHp,
      fanRate: newPlayerFanRate,
      antiGauge: newAntiGauge,
      antiLevel: newAntiLevel,
    },
    enemyState: {
      ...state.enemy,
      hp: newEnemyHp,
      fanRate: newEnemyFanRate,
    },
    audienceComposition: newAudience,
    message,
  };
}

/**
 * ターンメッセージを生成
 */
function generateTurnMessage(params: {
  playerAction: ActionType;
  enemyAction: ActionType;
  judgement: 'win' | 'draw' | 'lose';
  commandsFollowed: boolean[];
  damageToEnemy: number;
  damageToPlayer: number;
  playerFanChange: number;
  antiChange: number;
}): string {
  const {
    playerAction,
    enemyAction,
    judgement,
    commandsFollowed,
    damageToEnemy,
    damageToPlayer,
    playerFanChange,
    antiChange,
  } = params;

  let msg = `プレイヤー: ${getActionName(playerAction)}、敵: ${getActionName(enemyAction)} → ${getResultName(judgement)}！ `;

  if (damageToEnemy > 0) {
    msg += `敵に${damageToEnemy}ダメージ！ `;
  }
  if (damageToPlayer > 0) {
    msg += `${damageToPlayer}ダメージを受けた！ `;
  }

  const followedCount = commandsFollowed.filter((f) => f).length;
  if (followedCount === 3) {
    msg += `観客の指示すべてに従った！ `;
  } else if (followedCount > 0) {
    msg += `観客の指示に${followedCount}つ従った！ `;
  } else {
    msg += `観客の指示をすべて無視した... `;
  }

  if (playerFanChange > 0) {
    msg += `ファン +${(playerFanChange * 100).toFixed(1)}% `;
  } else if (playerFanChange < 0) {
    msg += `ファン ${(playerFanChange * 100).toFixed(1)}% `;
  }

  if (antiChange > 0) {
    msg += `アンチ +${antiChange}`;
  } else if (antiChange < 0) {
    msg += `アンチ ${antiChange}`;
  }

  return msg;
}
