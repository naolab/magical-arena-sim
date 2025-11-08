/**
 * Turn Processor
 * Processes a complete turn of battle
 */

import {
  BattleState,
  EmotionType,
  TurnResult,
  PlayerState,
  EnemyState,
  SpecialEffect,
  Comment,
} from './types';
import type { BattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { judgeEmotion } from './emotionSystem';
import { consumeComments } from './commentSystem';
import { calculateDamage } from './damageCalculation';
import {
  applyRageEffect,
  applyTerrorEffect,
  applyGriefEffect,
  applyEcstasyEffect,
  updateEffectDurations,
  removeExpiredEffects,
} from './specialEffects';

// ========================================
// Turn Processing
// ========================================

/**
 * 1ターンの処理を実行
 * @param state 現在のバトル状態
 * @param playerAction プレイヤーのアクション
 * @param enemyAction 敵のアクション
 * @returns 更新されたバトル状態
 */
export function processTurn(
  state: BattleState,
  playerAction: EmotionType,
  enemyAction: EmotionType
): BattleState {
  const turnNumber = state.currentTurn + 1;

  // 1. 感情の相性判定
  const judgement = judgeEmotion(playerAction, enemyAction);

  // 2. プレイヤーのコメント消費
  const { remaining: remainingComments, consumed: consumedPlayerComments } =
    consumeComments(state.comments, playerAction);

  // 3. プレイヤーのダメージ計算と適用
  const playerDamageResult = calculateAndApplyDamage({
    attacker: state.player,
    defender: state.enemy,
    action: playerAction,
    judgement,
    consumedComments: consumedPlayerComments,
    config: state.config,
  });

  // 4. 敵のダメージ計算と適用
  const enemyDamageResult = calculateAndApplyDamage({
    attacker: state.enemy,
    defender: playerDamageResult.defender, // プレイヤーのダメージ適用後の敵
    action: enemyAction,
    judgement: judgement === 'win' ? 'lose' : judgement === 'lose' ? 'win' : 'draw',
    consumedComments: [], // 敵はコメントを消費しない
    config: state.config,
  });

  type ActiveEffectExtended = SpecialEffect & { appliedTurn?: number };

  const playerEffectsBeforeTurn = state.player.activeEffects as ActiveEffectExtended[];
  const enemyEffectsBeforeTurn = state.enemy.activeEffects as ActiveEffectExtended[];

  let updatedPlayer = enemyDamageResult.defender as PlayerState; // 敵の攻撃後のプレイヤー
  let updatedEnemy = playerDamageResult.defender as EnemyState; // プレイヤーの攻撃後の敵

  // 5. プレイヤーの特殊効果を発動
  const playerSpecialEffects = triggerSpecialEffects({
    emotion: playerAction,
    target: 'player',
    damage: playerDamageResult.damage,
    defender: updatedEnemy,
    config: state.config,
  });

  let playerExtraDamage = 0;
  let playerHealing = 0;

  if (playerSpecialEffects.extraDamage > 0) {
    playerExtraDamage = playerSpecialEffects.extraDamage;
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.max(0, updatedEnemy.hp - playerSpecialEffects.extraDamage),
    };
  }

  if (playerSpecialEffects.healing > 0) {
    playerHealing = playerSpecialEffects.healing;
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.min(updatedPlayer.maxHp, updatedPlayer.hp + playerSpecialEffects.healing),
    };
  }

  // 5. 敵側の特殊効果を発動
  const enemySpecialEffects = triggerSpecialEffects({
    emotion: enemyAction,
    target: 'enemy',
    damage: enemyDamageResult.damage,
    defender: updatedPlayer,
    config: state.config,
  });

  let enemyExtraDamage = 0;
  let enemyHealing = 0;

  if (enemySpecialEffects.extraDamage > 0) {
    enemyExtraDamage = enemySpecialEffects.extraDamage;
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.max(0, updatedPlayer.hp - enemySpecialEffects.extraDamage),
    };
  }

  if (enemySpecialEffects.healing > 0) {
    enemyHealing = enemySpecialEffects.healing;
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.min(updatedEnemy.maxHp, updatedEnemy.hp + enemySpecialEffects.healing),
    };
  }

  // 6. 既存効果の更新と新規効果の追加
  const tickExistingEffects = (effects: ActiveEffectExtended[]) =>
    removeExpiredEffects(
      effects.map((effect) => {
        const appliedTurn = effect.appliedTurn ?? state.currentTurn;
        const shouldTick = appliedTurn < turnNumber;
        return {
          ...effect,
          duration: shouldTick ? effect.duration - 1 : effect.duration,
          appliedTurn,
        };
      })
    ) as ActiveEffectExtended[];

  const annotateNewEffects = (effects: SpecialEffect[]): ActiveEffectExtended[] =>
    effects.map((effect) => ({ ...effect, appliedTurn: turnNumber }));

  const playerEffectsAfterTick = tickExistingEffects(playerEffectsBeforeTurn);
  const enemyEffectsAfterTick = tickExistingEffects(enemyEffectsBeforeTurn);

  const finalPlayerEffects: ActiveEffectExtended[] = [
    ...playerEffectsAfterTick,
    ...annotateNewEffects(playerSpecialEffects.playerEffects),
    ...annotateNewEffects(enemySpecialEffects.playerEffects),
  ];

  const finalEnemyEffects: ActiveEffectExtended[] = [
    ...enemyEffectsAfterTick,
    ...annotateNewEffects(playerSpecialEffects.enemyEffects),
    ...annotateNewEffects(enemySpecialEffects.enemyEffects),
  ];

  updatedPlayer = {
    ...updatedPlayer,
    activeEffects: finalPlayerEffects,
  };

  updatedEnemy = {
    ...updatedEnemy,
    activeEffects: finalEnemyEffects,
  };

  // 7. ファン率の変化量を計算
  const fanChanges = calculateFanChanges({
    judgement,
    consumedCommentCount: consumedPlayerComments.length,
    playerFanRate: updatedPlayer.fanRate,
    enemyFanRate: updatedEnemy.fanRate,
  });

  // 8. 観客構成を更新（中立ファンから獲得）
  const updatedAudience = updateAudienceComposition(
    state.audience,
    fanChanges.playerChange,
    fanChanges.enemyChange
  );

  // 9. ファン率を観客構成から設定
  updatedPlayer = {
    ...updatedPlayer,
    fanRate: updatedAudience.playerFans,
  };

  updatedEnemy = {
    ...updatedEnemy,
    fanRate: updatedAudience.enemyFans,
  };

  // 10. ターン結果を作成
  const turnResult: TurnResult = {
    turnNumber,
    playerAction,
    enemyAction,
    judgement,
    consumedComments: consumedPlayerComments,
    damage: {
      toEnemy: playerDamageResult.damage + playerExtraDamage,
      toPlayer: enemyDamageResult.damage + enemyExtraDamage,
      extraToEnemy: playerExtraDamage,
      extraToPlayer: enemyExtraDamage,
    },
    specialEffects: {
      player: [
        ...playerSpecialEffects.playerEffects,
        ...enemySpecialEffects.playerEffects,
      ],
      enemy: [
        ...playerSpecialEffects.enemyEffects,
        ...enemySpecialEffects.enemyEffects,
      ],
    },
    secondaryEffects: {
      player: {
        extraDamage: playerExtraDamage,
        healing: playerHealing,
      },
      enemy: {
        extraDamage: enemyExtraDamage,
        healing: enemyHealing,
      },
    },
    fanChange: {
      player: fanChanges.playerChange,
      enemy: fanChanges.enemyChange,
    },
    playerState: updatedPlayer,
    enemyState: updatedEnemy,
    audienceComposition: updatedAudience,
    message: generateTurnMessage(judgement, playerAction, enemyAction),
  };

  // 11. 状態を更新して返す
  return {
    ...state,
    currentTurn: turnNumber,
    player: updatedPlayer,
    enemy: updatedEnemy,
    audience: updatedAudience,
    comments: remainingComments,
    turnHistory: [...state.turnHistory, turnResult],
  };
}

// ========================================
// Helper Functions
// ========================================

interface DamageCalculationParams {
  attacker: PlayerState | EnemyState;
  defender: PlayerState | EnemyState;
  action: EmotionType;
  judgement: 'win' | 'draw' | 'lose';
  consumedComments: Comment[];
  config: BattleParamsV2;
}

interface DamageResult {
  damage: number;
  defender: PlayerState | EnemyState;
}

/**
 * ダメージを計算して適用
 */
function calculateAndApplyDamage(params: DamageCalculationParams): DamageResult {
  const { attacker, defender, action, judgement, consumedComments, config } = params;

  const damage = calculateDamage({
    action,
    basePower: attacker.basePower,
    fanRate: attacker.fanRate,
    consumedCommentCount: consumedComments.length,
    matchupResult: judgement,
    activeEffects: attacker.activeEffects,
  }, config);

  const updatedDefender = {
    ...defender,
    hp: Math.max(0, defender.hp - damage),
  };

  return {
    damage,
    defender: updatedDefender,
  };
}

interface SpecialEffectResult {
  extraDamage: number;
  healing: number;
  playerEffects: SpecialEffect[];
  enemyEffects: SpecialEffect[];
}

/**
 * 特殊効果を発動
 */
function triggerSpecialEffects(params: {
  emotion: EmotionType;
  target: 'player' | 'enemy';
  damage: number;
  defender: PlayerState | EnemyState;
  config: BattleParamsV2;
}): SpecialEffectResult {
  const { emotion, target, damage, config } = params;

  const result: SpecialEffectResult = {
    extraDamage: 0,
    healing: 0,
    playerEffects: [],
    enemyEffects: [],
  };

  switch (emotion) {
    case 'rage':
      result.extraDamage = applyRageEffect({ emotion, target, damage }, config);
      break;

    case 'terror': {
      const debuff = applyTerrorEffect({ emotion, target, damage }, config);
      if (debuff.target === 'player') {
        result.playerEffects.push(debuff);
      } else {
        result.enemyEffects.push(debuff);
      }
      break;
    }

    case 'grief':
      result.healing = applyGriefEffect({ emotion, target, damage }, config);
      break;

    case 'ecstasy': {
      const buff = applyEcstasyEffect({ emotion, target, damage }, config);
      if (buff.target === 'player') {
        result.playerEffects.push(buff);
      } else {
        result.enemyEffects.push(buff);
      }
      break;
    }
  }

  return result;
}

/**
 * ファン率の変動を計算
 * プレイヤー: 消費コメント数 × 6%
 * 敵: 毎ターン固定で10%
 */
function calculateFanChanges(params: {
  judgement: 'win' | 'draw' | 'lose';
  consumedCommentCount: number;
  playerFanRate: number;
  enemyFanRate: number;
}): { playerChange: number; enemyChange: number } {
  const { consumedCommentCount } = params;

  // プレイヤー: 消費コメント1個につき+6%
  const playerChange = consumedCommentCount * 0.06;

  // 敵: 毎ターン固定で+10%
  const enemyChange = 0.1;

  return { playerChange, enemyChange };
}

/**
 * 観客構成を更新
 * まず中立ファンから獲得、足りなければ相手のファンを奪う
 */
function updateAudienceComposition(
  current: { playerFans: number; enemyFans: number; neutralFans: number },
  playerFanChange: number,
  enemyFanChange: number
): { playerFans: number; enemyFans: number; neutralFans: number } {
  // 現在の構成をコピー
  let playerFans = current.playerFans;
  let enemyFans = current.enemyFans;
  let neutralFans = current.neutralFans;

  // プレイヤーの獲得処理
  if (playerFanChange > 0) {
    // まず中立ファンから獲得
    const fromNeutral = Math.min(playerFanChange, neutralFans);
    playerFans += fromNeutral;
    neutralFans -= fromNeutral;

    // 不足分は敵ファンから奪う
    const remaining = playerFanChange - fromNeutral;
    if (remaining > 0) {
      const fromEnemy = Math.min(remaining, enemyFans);
      playerFans += fromEnemy;
      enemyFans -= fromEnemy;
    }
  }

  // 敵の獲得処理
  if (enemyFanChange > 0) {
    // まず中立ファンから獲得
    const fromNeutral = Math.min(enemyFanChange, neutralFans);
    enemyFans += fromNeutral;
    neutralFans -= fromNeutral;

    // 不足分はプレイヤーファンから奪う
    const remaining = enemyFanChange - fromNeutral;
    if (remaining > 0) {
      const fromPlayer = Math.min(remaining, playerFans);
      enemyFans += fromPlayer;
      playerFans -= fromPlayer;
    }
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
 * ターンメッセージを生成
 */
function generateTurnMessage(
  judgement: 'win' | 'draw' | 'lose',
  playerAction: EmotionType,
  enemyAction: EmotionType
): string {
  const actionNames: Record<EmotionType, string> = {
    rage: 'Rage',
    terror: 'Terror',
    grief: 'Grief',
    ecstasy: 'Ecstasy',
  };

  const playerName = actionNames[playerAction];
  const enemyName = actionNames[enemyAction];

  if (judgement === 'win') {
    return `${playerName} が ${enemyName} に勝利！`;
  } else if (judgement === 'lose') {
    return `${enemyName} に敗北…`;
  } else {
    return `${playerName} と ${enemyName} は互角！`;
  }
}
