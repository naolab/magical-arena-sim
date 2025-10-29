/**
 * Battle Engine
 * Main battle management system
 */

import { BattleState, PlayerState, EnemyState, EmotionType } from './types';
import { processTurn } from './turnProcessor';
import {
  generateComments,
  addCommentsToPool,
  COMMENTS_PER_TURN,
} from './commentSystem';
import { initializeAudienceComposition } from './fanSystem';

// ========================================
// Battle Initialization
// ========================================

/**
 * バトルを初期化
 * @param config バトル設定
 * @returns 初期バトル状態
 */
export function initBattle(config?: {
  playerMaxHp?: number;
  enemyMaxHp?: number;
  playerBasePower?: number;
  enemyBasePower?: number;
}): BattleState {
  const {
    playerMaxHp = 1000,
    enemyMaxHp = 1000,
    playerBasePower = 100,
    enemyBasePower = 100,
  } = config || {};

  const player: PlayerState = {
    hp: playerMaxHp,
    maxHp: playerMaxHp,
    basePower: playerBasePower,
    fanRate: 0.2, // 初期ファン率20%
    activeEffects: [],
  };

  const enemy: EnemyState = {
    hp: enemyMaxHp,
    maxHp: enemyMaxHp,
    basePower: enemyBasePower,
    fanRate: 0.2, // 初期ファン率20%
    activeEffects: [],
  };

  const audience = initializeAudienceComposition();

  // 初期コメントを生成（3個）
  const initialComments = generateComments(
    { count: COMMENTS_PER_TURN },
    0
  );

  return {
    isActive: true,
    currentTurn: 0,
    player,
    enemy,
    audience,
    comments: initialComments,
    turnHistory: [],
    winner: null,
  };
}

// ========================================
// Turn Execution
// ========================================

/**
 * プレイヤーのアクションを実行してターンを進める
 * @param state 現在のバトル状態
 * @param playerAction プレイヤーのアクション
 * @param enemyAction 敵のアクション（AI決定済み）
 * @returns 更新されたバトル状態
 */
export function executePlayerAction(
  state: BattleState,
  playerAction: EmotionType,
  enemyAction: EmotionType
): BattleState {
  if (!state.isActive) {
    console.warn('Battle is not active');
    return state;
  }

  // 1. ターン処理を実行
  let updatedState = processTurn(state, playerAction, enemyAction);

  // 2. 新しいコメントを生成して追加
  const newComments = generateComments(
    { count: COMMENTS_PER_TURN },
    updatedState.currentTurn
  );
  updatedState = {
    ...updatedState,
    comments: addCommentsToPool(updatedState.comments, newComments),
  };

  // 3. 勝敗判定
  const winner = checkWinner(updatedState);
  if (winner) {
    updatedState = {
      ...updatedState,
      isActive: false,
      winner,
    };
  }

  return updatedState;
}

// ========================================
// Winner Check
// ========================================

/**
 * 勝者を判定
 * @param state バトル状態
 * @returns 勝者（null = まだ決着していない）
 */
export function checkWinner(
  state: BattleState
): 'player' | 'enemy' | 'draw' | null {
  const playerDead = state.player.hp <= 0;
  const enemyDead = state.enemy.hp <= 0;

  if (playerDead && enemyDead) {
    return 'draw'; // 相打ち
  } else if (enemyDead) {
    return 'player'; // プレイヤー勝利
  } else if (playerDead) {
    return 'enemy'; // 敵勝利
  }

  // ターン制限チェック（オプション: 50ターンで引き分け）
  if (state.currentTurn >= 50) {
    // HPが多い方の勝利
    if (state.player.hp > state.enemy.hp) {
      return 'player';
    } else if (state.enemy.hp > state.player.hp) {
      return 'enemy';
    } else {
      return 'draw';
    }
  }

  return null; // まだ決着していない
}

// ========================================
// Battle Reset
// ========================================

/**
 * バトルをリセット
 * @param config バトル設定（省略時は前回と同じ設定）
 * @returns 新しいバトル状態
 */
export function resetBattle(config?: {
  playerMaxHp?: number;
  enemyMaxHp?: number;
  playerBasePower?: number;
  enemyBasePower?: number;
}): BattleState {
  return initBattle(config);
}

// ========================================
// Battle Status Helpers
// ========================================

/**
 * バトルが終了しているかチェック
 * @param state バトル状態
 * @returns 終了している場合true
 */
export function isBattleOver(state: BattleState): boolean {
  return !state.isActive || state.winner !== null;
}

/**
 * バトルの進行状況を取得
 * @param state バトル状態
 * @returns 進行状況の説明
 */
export function getBattleStatus(state: BattleState): string {
  if (state.winner) {
    if (state.winner === 'player') {
      return 'プレイヤーの勝利！';
    } else if (state.winner === 'enemy') {
      return '敵の勝利…';
    } else {
      return '引き分け';
    }
  }

  return `ターン ${state.currentTurn} - 進行中`;
}

/**
 * HPの割合を取得
 * @param current 現在のHP
 * @param max 最大HP
 * @returns HP割合（0.0 ~ 1.0）
 */
export function getHpRatio(current: number, max: number): number {
  return Math.max(0, Math.min(1, current / max));
}
