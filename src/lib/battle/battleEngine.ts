/**
 * バトルエンジン
 * バトル初期化、勝敗判定、敵AI
 */

import { BATTLE_PARAMS } from '@/config/battleParams';
import { generateAudienceCommand } from './audienceCommand';
import { processTurn } from './turnProcessor';
import type { BattleState, ActionType } from './types';

/**
 * バトルを初期化
 */
export function initBattle(): BattleState {
  const { INITIAL_HP, BASE_POWER, INITIAL_AUDIENCE } = BATTLE_PARAMS;

  return {
    isActive: true,
    currentTurn: 0,
    player: {
      hp: INITIAL_HP,
      maxHp: INITIAL_HP,
      basePower: BASE_POWER,
      fanRate: INITIAL_AUDIENCE.PLAYER_FANS,
      antiGauge: 0,
      antiLevel: 0,
    },
    enemy: {
      hp: INITIAL_HP,
      maxHp: INITIAL_HP,
      basePower: BASE_POWER,
      fanRate: INITIAL_AUDIENCE.ENEMY_FANS,
    },
    audience: {
      enemyFans: INITIAL_AUDIENCE.ENEMY_FANS,
      neutralFans: INITIAL_AUDIENCE.NEUTRAL_FANS,
      playerFans: INITIAL_AUDIENCE.PLAYER_FANS,
    },
    currentCommands: [
      generateAudienceCommand(),
      generateAudienceCommand(),
      generateAudienceCommand(),
    ],
    turnHistory: [],
    winner: null,
  };
}

/**
 * プレイヤーの行動を受け取ってターンを進行
 */
export function executePlayerAction(
  state: BattleState,
  playerAction: ActionType
): BattleState {
  if (!state.isActive) {
    return state;
  }

  // 敵の行動を決定（簡易AI）
  const enemyAction = decideEnemyAction(state);

  // ターン処理
  const turnResult = processTurn(state, playerAction, enemyAction);

  // 新しい観客指示を生成（3つ）
  const nextCommands = [
    generateAudienceCommand(),
    generateAudienceCommand(),
    generateAudienceCommand(),
  ];

  // バトル状態を更新
  const newState: BattleState = {
    ...state,
    currentTurn: turnResult.turnNumber,
    player: turnResult.playerState,
    enemy: turnResult.enemyState,
    audience: turnResult.audienceComposition,
    currentCommands: nextCommands,
    turnHistory: [...state.turnHistory, turnResult],
    winner: null,
    isActive: true,
  };

  // 勝敗判定
  const winner = checkWinner(newState);
  if (winner) {
    newState.winner = winner;
    newState.isActive = false;
  }

  return newState;
}

/**
 * 敵の行動を決定（簡易AI）
 * ランダムに行動を選択
 */
function decideEnemyAction(_state: BattleState): ActionType {
  const actions: ActionType[] = ['attack', 'appeal', 'guard'];
  const rand = Math.floor(Math.random() * actions.length);
  return actions[rand];
}

/**
 * 勝敗を判定
 * 勝利条件: 相手HP 0以下
 */
export function checkWinner(state: BattleState): 'player' | 'enemy' | null {
  const { HP_THRESHOLD } = BATTLE_PARAMS.WIN_CONDITIONS;

  // HPによる判定
  if (state.enemy.hp <= HP_THRESHOLD) {
    return 'player';
  }
  if (state.player.hp <= HP_THRESHOLD) {
    return 'enemy';
  }

  return null;
}

/**
 * バトルをリセット
 */
export function resetBattle(): BattleState {
  return initBattle();
}
