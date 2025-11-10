/**
 * Battle Engine
 * Main battle management system
 */

import { BattleState, PlayerState, EnemyState, EmotionType, SkillUsageMap } from './types';
import { BattleParamsV2, DEFAULT_BATTLE_PARAMS_V2 } from '@/contexts/BattleParamsV2Context';
import { processTurn } from './turnProcessor';
import {
  generateComments,
  addCommentsToPool,
} from './commentSystem';
import { initializeAudienceComposition } from './fanSystem';
import { getVariantDefinition, DEFAULT_VARIANTS } from './actionVariants';

const ALL_EMOTIONS: EmotionType[] = ['rage', 'terror', 'grief', 'ecstasy'];

// ========================================
// Battle Initialization
// ========================================

/**
 * バトルを初期化
 * @param params バトル設定パラメータ
 * @returns 初期バトル状態
 */
export function initBattle(params?: BattleParamsV2): BattleState {
  const config = params || DEFAULT_BATTLE_PARAMS_V2;

  const player: PlayerState = {
    hp: config.playerMaxHp,
    maxHp: config.playerMaxHp,
    basePower: config.playerBasePower,
    fanRate: config.initialFanRate,
    activeEffects: [],
  };

  const enemy: EnemyState = {
    hp: config.enemyMaxHp,
    maxHp: config.enemyMaxHp,
    basePower: config.enemyBasePower,
    fanRate: config.initialFanRate,
    activeEffects: [],
  };

  const audience = initializeAudienceComposition(config);

  // 初期コメントを生成
  const initialComments = generateComments(
    { count: config.commentsPerTurn },
    0
  );

  const playerSkillUses: SkillUsageMap = {
    rage: 0,
    terror: 0,
    grief: 0,
    ecstasy: 0,
  };

  const enemySkillUses: SkillUsageMap = {
    rage: 0,
    terror: 0,
    grief: 0,
    ecstasy: 0,
  };

  for (const emotion of ALL_EMOTIONS) {
    const playerVariant = config.selectedActionVariants[emotion];
    const playerVariantDef = getVariantDefinition(emotion, playerVariant);
    playerSkillUses[emotion] = playerVariantDef.maxUses;

    const enemyVariant = DEFAULT_VARIANTS[emotion];
    const enemyVariantDef = getVariantDefinition(emotion, enemyVariant);
    enemySkillUses[emotion] = enemyVariantDef.maxUses;
  }

  return {
    isActive: true,
    currentTurn: 0,
    player,
    enemy,
    audience,
    comments: initialComments,
    turnHistory: [],
    winner: null,
    config,
    skillUses: {
      player: playerSkillUses,
      enemy: enemySkillUses,
    },
    pendingSuperchatTurn: false,
    permanentCommentBoost: 0,
    superchatBoostTurns: 0,
    superchatBoostMultiplier: 1,
    nextAttackMultiplier: {
      player: 1,
      enemy: 1,
    },
    commentPoolReduction: 0,
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

  if (state.skillUses?.player?.[playerAction] !== undefined && state.skillUses.player[playerAction] <= 0) {
    console.warn(`No remaining uses for player action: ${playerAction}`);
    return state;
  }

  if (state.skillUses?.enemy?.[enemyAction] !== undefined && state.skillUses.enemy[enemyAction] <= 0) {
    console.warn(`No remaining uses for enemy action: ${enemyAction}`);
    return state;
  }

  // 1. ターン処理を実行
  let updatedState = processTurn(state, playerAction, enemyAction);

  // 2. 新しいコメントを生成して追加（永続的なコメントブーストを適用）
  const commentCount = updatedState.config.commentsPerTurn + (updatedState.permanentCommentBoost ?? 0);
  const superchatMultiplier = updatedState.superchatBoostMultiplier ?? 1;
  const newComments = generateComments(
    { count: commentCount, superchatMultiplier },
    updatedState.currentTurn
  );
  const maxPoolSize = Math.max(
    1,
    updatedState.config.maxCommentPoolSize - (updatedState.commentPoolReduction ?? 0)
  );
  updatedState = {
    ...updatedState,
    comments: addCommentsToPool(updatedState.comments, newComments, maxPoolSize),
  };

  // 勝敗判定はUI側で行う（メッセージアニメーション完了後、UI側のHPが完全に反映された後）

  return updatedState;
}

/**
 * スパチャ追撃ターンを実行
 */
export function executeSuperchatTurn(
  state: BattleState,
  playerAction: EmotionType
): BattleState {
  if (!state.isActive || !state.pendingSuperchatTurn) {
    return state;
  }

  let updatedState = processTurn(state, playerAction, playerAction, {
    isSuperchatTurn: true,
  });

  // 永続的なコメントブーストを適用
  const commentCount = updatedState.config.commentsPerTurn + (updatedState.permanentCommentBoost ?? 0);
  const superchatMultiplier = updatedState.superchatBoostMultiplier ?? 1;
  const newComments = generateComments(
    { count: commentCount, superchatMultiplier },
    updatedState.currentTurn
  );
  const maxPoolSize = Math.max(
    1,
    updatedState.config.maxCommentPoolSize - (updatedState.commentPoolReduction ?? 0)
  );
  updatedState = {
    ...updatedState,
    comments: addCommentsToPool(updatedState.comments, newComments, maxPoolSize),
  };

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
  const playerDead = state.player.hp <= 0 || state.player.isDead;
  const enemyDead = state.enemy.hp <= 0 || state.enemy.isDead;

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
 * @param params バトル設定パラメータ
 * @returns 新しいバトル状態
 */
export function resetBattle(params?: BattleParamsV2): BattleState {
  return initBattle(params);
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
