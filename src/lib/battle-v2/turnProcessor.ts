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
  });

  // 4. 敵のダメージ計算と適用
  const enemyDamageResult = calculateAndApplyDamage({
    attacker: state.enemy,
    defender: playerDamageResult.defender, // プレイヤーのダメージ適用後の敵
    action: enemyAction,
    judgement: judgement === 'win' ? 'lose' : judgement === 'lose' ? 'win' : 'draw',
    consumedComments: [], // 敵はコメントを消費しない
  });

  let updatedPlayer = enemyDamageResult.defender as PlayerState; // 敵の攻撃後のプレイヤー
  let updatedEnemy = playerDamageResult.defender as EnemyState; // プレイヤーの攻撃後の敵

  // 5. プレイヤーの特殊効果を発動
  const playerSpecialEffects = triggerSpecialEffects({
    emotion: playerAction,
    target: 'player',
    damage: playerDamageResult.damage,
    defender: updatedEnemy,
  });

  // Rage: 追加ダメージを適用
  if (playerAction === 'rage' && playerSpecialEffects.extraDamage > 0) {
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.max(0, updatedEnemy.hp - playerSpecialEffects.extraDamage),
    };
  }

  // Grief: HP回復を適用
  if (playerAction === 'grief' && playerSpecialEffects.healing > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.min(updatedPlayer.maxHp, updatedPlayer.hp + playerSpecialEffects.healing),
    };
  }

  // Terror/Ecstasy: 効果を追加
  updatedPlayer = {
    ...updatedPlayer,
    activeEffects: [...updatedPlayer.activeEffects, ...playerSpecialEffects.playerEffects],
  };
  updatedEnemy = {
    ...updatedEnemy,
    activeEffects: [...updatedEnemy.activeEffects, ...playerSpecialEffects.enemyEffects],
  };

  // 6. ファン率を更新
  const fanChanges = calculateFanChanges({
    judgement,
    consumedCommentCount: consumedPlayerComments.length,
    playerFanRate: updatedPlayer.fanRate,
    enemyFanRate: updatedEnemy.fanRate,
  });

  updatedPlayer = {
    ...updatedPlayer,
    fanRate: Math.max(0, Math.min(1, updatedPlayer.fanRate + fanChanges.playerChange)),
  };

  updatedEnemy = {
    ...updatedEnemy,
    fanRate: Math.max(0, Math.min(1, updatedEnemy.fanRate + fanChanges.enemyChange)),
  };

  // 7. 観客構成を更新
  const updatedAudience = updateAudienceComposition(
    state.audience,
    judgement,
    updatedPlayer.fanRate,
    updatedEnemy.fanRate
  );

  // 8. 特殊効果の持続ターンを更新
  updatedPlayer = {
    ...updatedPlayer,
    activeEffects: removeExpiredEffects(updateEffectDurations(updatedPlayer.activeEffects)),
  };

  updatedEnemy = {
    ...updatedEnemy,
    activeEffects: removeExpiredEffects(updateEffectDurations(updatedEnemy.activeEffects)),
  };

  // 9. ターン結果を作成
  const turnResult: TurnResult = {
    turnNumber,
    playerAction,
    enemyAction,
    judgement,
    consumedComments: consumedPlayerComments,
    damage: {
      toEnemy: playerDamageResult.damage + (playerSpecialEffects.extraDamage || 0),
      toPlayer: enemyDamageResult.damage,
    },
    specialEffects: {
      player: playerSpecialEffects.playerEffects,
      enemy: playerSpecialEffects.enemyEffects,
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

  // 10. 状態を更新して返す
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
}

interface DamageResult {
  damage: number;
  defender: PlayerState | EnemyState;
}

/**
 * ダメージを計算して適用
 */
function calculateAndApplyDamage(params: DamageCalculationParams): DamageResult {
  const { attacker, defender, action, judgement, consumedComments } = params;

  const damage = calculateDamage({
    action,
    basePower: attacker.basePower,
    fanRate: attacker.fanRate,
    consumedCommentCount: consumedComments.length,
    matchupResult: judgement,
    activeEffects: attacker.activeEffects,
  });

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
}): SpecialEffectResult {
  const { emotion, target, damage } = params;

  const result: SpecialEffectResult = {
    extraDamage: 0,
    healing: 0,
    playerEffects: [],
    enemyEffects: [],
  };

  switch (emotion) {
    case 'rage':
      result.extraDamage = applyRageEffect({ emotion, target, damage });
      break;

    case 'terror': {
      const debuff = applyTerrorEffect({ emotion, target, damage });
      if (debuff.target === 'player') {
        result.playerEffects.push(debuff);
      } else {
        result.enemyEffects.push(debuff);
      }
      break;
    }

    case 'grief':
      result.healing = applyGriefEffect({ emotion, target, damage });
      break;

    case 'ecstasy': {
      const buff = applyEcstasyEffect({ emotion, target, damage });
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
 */
function calculateFanChanges(params: {
  judgement: 'win' | 'draw' | 'lose';
  consumedCommentCount: number;
  playerFanRate: number;
  enemyFanRate: number;
}): { playerChange: number; enemyChange: number } {
  const { judgement, consumedCommentCount } = params;

  let playerChange = 0;
  let enemyChange = 0;

  // 基本変動: 勝利で+10%, 敗北で-10%
  if (judgement === 'win') {
    playerChange = 0.1;
    enemyChange = -0.05;
  } else if (judgement === 'lose') {
    playerChange = -0.05;
    enemyChange = 0.1;
  }

  // コメントボーナス: 1コメントにつき+2%
  playerChange += consumedCommentCount * 0.02;

  return { playerChange, enemyChange };
}

/**
 * 観客構成を更新
 */
function updateAudienceComposition(
  current: { playerFans: number; enemyFans: number; neutralFans: number },
  judgement: 'win' | 'draw' | 'lose',
  playerFanRate: number,
  enemyFanRate: number
): { playerFans: number; enemyFans: number; neutralFans: number } {
  // 簡易実装: ファン率に基づいて観客構成を更新
  const totalFans = 1.0;
  const playerFans = playerFanRate * 0.5;
  const enemyFans = enemyFanRate * 0.5;
  const neutralFans = Math.max(0, totalFans - playerFans - enemyFans);

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
