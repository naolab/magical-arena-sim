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
  CommentConversionEvent,
  ActionVariantDefinition,
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
  applyRagePercentageEffect,
  applyRageSacrificeEffect,
  applyRageBloodPactEffect,
  applyTerrorPoisonEffect,
  applyTerrorCurseEffect,
  applyTerrorFanBlockEffect,
  applyGriefDesperateEffect,
  applyEcstasyConvertEffect,
  applyEcstasyCommentBoostEffect,
  applyGriefRegenEffect,
  updateEffectDurations,
  removeExpiredEffects,
  calculatePoisonDamage,
  calculateCurseDamage,
  calculateRegenHealing,
  type ExtendedEffectTriggerParams,
} from './specialEffects';
import { getVariantDefinition, DEFAULT_VARIANTS } from './actionVariants';

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
  enemyAction: EmotionType,
  options?: { isSuperchatTurn?: boolean }
): BattleState {
  const turnNumber = state.currentTurn + 1;
  const isSuperchatTurn = options?.isSuperchatTurn ?? false;

  const createEmptySkillUses = () => ({
    rage: 0,
    terror: 0,
    grief: 0,
    ecstasy: 0,
  });

  const currentSkillUses = state.skillUses ?? {
    player: createEmptySkillUses(),
    enemy: createEmptySkillUses(),
  };

  const effectiveEnemyAction = isSuperchatTurn ? playerAction : enemyAction;

  // 1. 感情の相性判定
  const judgement = state.config.enableMatchups
    ? judgeEmotion(playerAction, effectiveEnemyAction)
    : 'draw';

  // 2. プレイヤーのコメント消費
  const { remaining: remainingComments, consumed: consumedPlayerComments } =
    consumeComments(state.comments, playerAction);
  const earnedSuperchatTurn = consumedPlayerComments.some((comment) => comment.isSuperchat);

  const playerVariant = state.config.selectedActionVariants[playerAction];
  const playerVariantDef = getVariantDefinition(playerAction, playerVariant);
  const playerHasAttack = playerVariantDef.hasAttack !== false;

  const enemyVariant = DEFAULT_VARIANTS[enemyAction];
  const enemyVariantDef = getVariantDefinition(enemyAction, enemyVariant);
  const enemyHasAttack = !isSuperchatTurn && enemyVariantDef.hasAttack !== false;

  // 3. プレイヤーのダメージ計算と適用
  const playerDamageResult = playerHasAttack
    ? calculateAndApplyDamage({
        attacker: state.player,
        defender: state.enemy,
        action: playerAction,
        judgement,
        consumedComments: consumedPlayerComments,
        config: state.config,
        variant: playerVariantDef,
        attackerState: state.player,
      })
    : {
        damage: 0,
        defender: state.enemy,
      };

  // 4. 敵のダメージ計算と適用
  const enemyDamageResult = enemyHasAttack
    ? calculateAndApplyDamage({
        attacker: state.enemy,
        defender: state.player, // 現在のプレイヤー状態（敵の攻撃対象）
        action: enemyAction,
        judgement: judgement === 'win' ? 'lose' : judgement === 'lose' ? 'win' : 'draw',
        consumedComments: [], // 敵はコメントを消費しない
        config: state.config,
        variant: enemyVariantDef,
        attackerState: state.enemy,
      })
    : {
        damage: 0,
        defender: state.player,
      };

  type ActiveEffectExtended = SpecialEffect & { appliedTurn?: number };

  const playerEffectsBeforeTurn = state.player.activeEffects as ActiveEffectExtended[];
  const enemyEffectsBeforeTurn = state.enemy.activeEffects as ActiveEffectExtended[];

  let updatedPlayer = enemyDamageResult.defender as PlayerState; // 敵の攻撃後のプレイヤー
  let updatedEnemy = playerDamageResult.defender as EnemyState; // プレイヤーの攻撃後の敵

  // 5. プレイヤーの特殊効果を発動
  console.log('[DEBUG] Player Action:', { playerAction, target: 'player' });
  const playerSpecialEffects = triggerSpecialEffects({
    emotion: playerAction,
    target: 'player',
    damage: playerDamageResult.damage,
    attacker: updatedPlayer,
    defender: updatedEnemy,
    comments: remainingComments,
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

  if (playerSpecialEffects.selfDamage && playerSpecialEffects.selfDamage > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.max(0, updatedPlayer.hp - playerSpecialEffects.selfDamage),
    };
  }

  const commentConversions: CommentConversionEvent[] = [];

  // コメント変換があれば適用
  let currentComments = remainingComments;
  if (playerSpecialEffects.convertedComments) {
    currentComments = playerSpecialEffects.convertedComments;
  }
  if (playerSpecialEffects.commentConversion) {
    commentConversions.push({
      target: 'player',
      emotion: playerSpecialEffects.commentConversion.targetEmotion,
      count: playerSpecialEffects.commentConversion.count,
      commentIds: playerSpecialEffects.commentConversion.convertedCommentIds,
    });
  }

  // コメントブーストがあれば永続的に適用
  let updatedPermanentCommentBoost = state.permanentCommentBoost ?? 0;
  if (playerSpecialEffects.commentBoost && playerSpecialEffects.commentBoost > 0) {
    updatedPermanentCommentBoost += playerSpecialEffects.commentBoost;
  }

  // 5. 敵側の特殊効果を発動
  let enemySpecialEffects: SpecialEffectResult;
  if (isSuperchatTurn) {
    enemySpecialEffects = {
      extraDamage: 0,
      healing: 0,
      playerEffects: [],
      enemyEffects: [],
    };
  } else {
    console.log('[DEBUG] Enemy Action:', { enemyAction, target: 'enemy' });
    enemySpecialEffects = triggerSpecialEffects({
      emotion: enemyAction,
      target: 'enemy',
      damage: enemyDamageResult.damage,
      attacker: updatedEnemy,
      defender: updatedPlayer,
      comments: remainingComments,
      config: state.config,
    });
  }

  let enemyExtraDamage = 0;
  let enemyHealing = 0;

  if (!isSuperchatTurn && enemySpecialEffects.extraDamage > 0) {
    enemyExtraDamage = enemySpecialEffects.extraDamage;
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.max(0, updatedPlayer.hp - enemySpecialEffects.extraDamage),
    };
  }

  if (!isSuperchatTurn && enemySpecialEffects.healing > 0) {
    enemyHealing = enemySpecialEffects.healing;
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.min(updatedEnemy.maxHp, updatedEnemy.hp + enemySpecialEffects.healing),
    };
  }

  if (!isSuperchatTurn && enemySpecialEffects.selfDamage && enemySpecialEffects.selfDamage > 0) {
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.max(0, updatedEnemy.hp - enemySpecialEffects.selfDamage),
    };
  }

  // 5.5. 毒ダメージの適用（ターン開始時の効果）
  const playerPoisonDamage = calculatePoisonDamage(updatedPlayer.activeEffects);
  const enemyPoisonDamage = calculatePoisonDamage(updatedEnemy.activeEffects);

  console.log('[DEBUG] Poison Damage:', {
    playerActiveEffects: updatedPlayer.activeEffects,
    enemyActiveEffects: updatedEnemy.activeEffects,
    playerPoisonDamage,
    enemyPoisonDamage
  });

  if (playerPoisonDamage > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.max(0, updatedPlayer.hp - playerPoisonDamage),
    };
  }

  if (enemyPoisonDamage > 0) {
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.max(0, updatedEnemy.hp - enemyPoisonDamage),
    };
  }

  // 5.6. 呪いダメージの適用（ターン開始時の効果）
  const playerCurseDamage = calculateCurseDamage(updatedPlayer.activeEffects, updatedPlayer.maxHp);
  const enemyCurseDamage = calculateCurseDamage(updatedEnemy.activeEffects, updatedEnemy.maxHp);

  if (playerCurseDamage > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.max(0, updatedPlayer.hp - playerCurseDamage),
    };
  }

  if (enemyCurseDamage > 0) {
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.max(0, updatedEnemy.hp - enemyCurseDamage),
    };
  }

  // 5.7. リジェネ回復の適用（ターン開始時の効果）
  const playerRegenHealing = calculateRegenHealing(updatedPlayer.activeEffects);
  const enemyRegenHealing = calculateRegenHealing(updatedEnemy.activeEffects);

  if (playerRegenHealing > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      hp: Math.min(updatedPlayer.maxHp, updatedPlayer.hp + playerRegenHealing),
    };
  }

  if (enemyRegenHealing > 0) {
    updatedEnemy = {
      ...updatedEnemy,
      hp: Math.min(updatedEnemy.maxHp, updatedEnemy.hp + enemyRegenHealing),
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

  const playerCleansed = playerSpecialEffects.cleansed || finalPlayerEffects.some(
    (effect) => effect.type === 'cleanse' && effect.target === 'player'
  );
  const enemyCleansed = finalEnemyEffects.some(
    (effect) => effect.type === 'cleanse' && effect.target === 'enemy'
  );

  const cleanseEffectFilter = (effect: ActiveEffectExtended, target: 'player' | 'enemy') =>
    !(
      (effect.type === 'cleanse' ||
        effect.type === 'debuff' ||
        effect.type === 'poison' ||
        effect.type === 'curse' ||
        effect.type === 'fan_block') &&
      effect.target === target
    );

  const cleanedPlayerEffects = playerCleansed
    ? finalPlayerEffects.filter((effect) => cleanseEffectFilter(effect, 'player'))
    : finalPlayerEffects;

  const cleanedEnemyEffects = enemyCleansed
    ? finalEnemyEffects.filter((effect) => cleanseEffectFilter(effect, 'enemy'))
    : finalEnemyEffects;

  console.log('[DEBUG] Final Effects:', {
    playerSpecialEffects_playerEffects: playerSpecialEffects.playerEffects,
    playerSpecialEffects_enemyEffects: playerSpecialEffects.enemyEffects,
    enemySpecialEffects_playerEffects: enemySpecialEffects.playerEffects,
    enemySpecialEffects_enemyEffects: enemySpecialEffects.enemyEffects,
    finalPlayerEffects,
    finalEnemyEffects
  });

  updatedPlayer = {
    ...updatedPlayer,
    activeEffects: cleanedPlayerEffects,
  };

  updatedEnemy = {
    ...updatedEnemy,
    activeEffects: cleanedEnemyEffects,
  };

  // 7. ファン率の変化量を計算
  const rawFanChanges = calculateFanChanges({
    judgement,
    consumedCommentCount: consumedPlayerComments.length,
    playerFanRate: updatedPlayer.fanRate,
    enemyFanRate: updatedEnemy.fanRate,
  });

  const playerFanBlocked = updatedPlayer.activeEffects.some((effect) => effect.type === 'fan_block');
  const enemyFanBlocked = updatedEnemy.activeEffects.some((effect) => effect.type === 'fan_block');

  const playerFanChange = playerFanBlocked ? 0 : rawFanChanges.playerChange;
  const enemyFanChange = enemyFanBlocked ? 0 : rawFanChanges.enemyChange;

  // 8. 観客構成を更新（中立ファンから獲得）
  const updatedAudience = updateAudienceComposition(
    state.audience,
    playerFanChange,
    enemyFanChange
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

  const updatedSkillUsesPlayer = {
    ...currentSkillUses.player,
    [playerAction]: Math.max(0, (currentSkillUses.player[playerAction] ?? 0) - 1),
  };
  const updatedSkillUsesEnemy = { ...currentSkillUses.enemy };
  if (!isSuperchatTurn) {
    updatedSkillUsesEnemy[enemyAction] = Math.max(
      0,
      (currentSkillUses.enemy[enemyAction] ?? 0) - 1
    );
  }
  const updatedSkillUses = {
    player: updatedSkillUsesPlayer,
    enemy: updatedSkillUsesEnemy,
  };

  const nextComments = currentComments;

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
        poisonDamage: playerPoisonDamage,
        curseDamage: playerCurseDamage,
        regenHealing: playerRegenHealing,
        selfDamage: playerSpecialEffects.selfDamage ?? 0,
      },
      enemy: {
        extraDamage: enemyExtraDamage,
        healing: enemyHealing,
        poisonDamage: enemyPoisonDamage,
        curseDamage: enemyCurseDamage,
        regenHealing: enemyRegenHealing,
        selfDamage: enemySpecialEffects.selfDamage ?? 0,
      },
    },
    fanChange: {
      player: playerFanChange,
      enemy: enemyFanChange,
    },
    playerState: updatedPlayer,
    enemyState: updatedEnemy,
    audienceComposition: updatedAudience,
    commentConversions,
    message: generateTurnMessage(judgement, playerAction, enemyAction, playerPoisonDamage, enemyPoisonDamage),
    superchatAwarded: !isSuperchatTurn && earnedSuperchatTurn,
    commentBoostApplied: playerSpecialEffects.commentBoost,
    currentCommentBoost: updatedPermanentCommentBoost,
    cleansed: playerSpecialEffects.cleansed,
  };

  // 11. 状態を更新して返す
  return {
    ...state,
    currentTurn: turnNumber,
    player: updatedPlayer,
    enemy: updatedEnemy,
    audience: updatedAudience,
    comments: nextComments,
    skillUses: updatedSkillUses,
    turnHistory: [...state.turnHistory, turnResult],
    pendingSuperchatTurn: earnedSuperchatTurn,
    permanentCommentBoost: updatedPermanentCommentBoost,
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
  variant?: ActionVariantDefinition;
  attackerState?: PlayerState | EnemyState;
}

interface DamageResult {
  damage: number;
  defender: PlayerState | EnemyState;
}

/**
 * ダメージを計算して適用
 */
function calculateAndApplyDamage(params: DamageCalculationParams): DamageResult {
  const { attacker, defender, action, judgement, consumedComments, config, variant, attackerState } = params;

  let baseDamage = calculateDamage({
    action,
    basePower: attacker.basePower,
    fanRate: attacker.fanRate,
    consumedCommentCount: consumedComments.length,
    matchupResult: judgement,
    activeEffects: attacker.activeEffects,
  }, config);

  if (variant?.id === 'berserk_lowhp' && attackerState) {
    const hpRatio = Math.max(0, Math.min(1, attackerState.hp / attackerState.maxHp));
    const boost = 1 + (1 - hpRatio);
    baseDamage = Math.round(baseDamage * boost);
  }

  if (variant?.id === 'chaos_strike') {
    const [min = 0.5, max = 1.5] = (variant.metadata?.randomRange as number[]) ?? [0.5, 1.5];
    const rand = min + Math.random() * (max - min);
    baseDamage = Math.round(baseDamage * rand);
  }
  if (variant?.id === 'sacrifice') {
    const multiplier =
      typeof variant.metadata?.damageMultiplier === 'number'
        ? (variant.metadata.damageMultiplier as number)
        : 2;
    baseDamage = Math.round(baseDamage * Math.max(1, multiplier));
  }

  const updatedDefender = {
    ...defender,
    hp: Math.max(0, defender.hp - baseDamage),
  };

  return {
    damage: baseDamage,
    defender: updatedDefender,
  };
}

interface CommentConversionSummary {
  targetEmotion: EmotionType;
  convertedCommentIds: string[];
  count: number;
}

interface SpecialEffectResult {
  extraDamage: number;
  healing: number;
  playerEffects: SpecialEffect[];
  enemyEffects: SpecialEffect[];
  convertedComments?: Comment[]; // コメント変換後の配列
  commentConversion?: CommentConversionSummary;
  extraDamageMultiplier?: number;
  commentBoost?: number; // コメント追加量の増加値
  cleansed?: boolean; // デバフが全て解除されたか
  selfDamage?: number; // 自傷ダメージ
}

/**
 * 特殊効果を発動（バリアント対応版）
 */
function triggerSpecialEffects(params: {
  emotion: EmotionType;
  target: 'player' | 'enemy';
  damage: number;
  attacker: PlayerState | EnemyState;
  defender: PlayerState | EnemyState;
  comments: Comment[];
  config: BattleParamsV2;
}): SpecialEffectResult {
  const { emotion, target, damage, attacker, defender, comments, config } = params;

  const result: SpecialEffectResult = {
    extraDamage: 0,
    healing: 0,
    playerEffects: [],
    enemyEffects: [],
  };

  // 選択されたバリアントを取得
  // 敵の場合は常にデフォルトバリアント、プレイヤーの場合は選択されたバリアント
  const selectedVariant = target === 'enemy'
    ? DEFAULT_VARIANTS[emotion]
    : config.selectedActionVariants[emotion];
  const variantDef = getVariantDefinition(emotion, selectedVariant);

  // 拡張パラメータを準備
  const extendedParams: ExtendedEffectTriggerParams = {
    emotion,
    target,
    damage,
    enemyMaxHp: defender.maxHp,
    playerHp: target === 'player' ? attacker.hp : defender.hp,
    playerMaxHp: target === 'player' ? attacker.maxHp : defender.maxHp,
    comments,
  };

  // バリアントに応じた処理
  switch (emotion) {
    case 'rage':
      if (selectedVariant === 'explosive') {
        result.extraDamage = applyRageEffect({ emotion, target, damage }, config);
      } else if (selectedVariant === 'percentage') {
        result.extraDamage = applyRagePercentageEffect(extendedParams, variantDef);
      } else if (selectedVariant === 'debuff_scaling') {
        const debuffCount = defender.activeEffects.filter(
          (effect) =>
            effect.type === 'debuff' ||
            effect.type === 'poison' ||
            effect.type === 'curse' ||
            effect.type === 'fan_block'
        ).length;
        const multiplier = 1 + debuffCount * 0.4;
        result.extraDamage = Math.max(0, Math.round(damage * (multiplier - 1)));
      } else if (selectedVariant === 'sacrifice') {
        const { selfDamage } = applyRageSacrificeEffect(variantDef, attacker.maxHp);
        result.selfDamage = selfDamage;
      } else if (selectedVariant === 'blood_pact') {
        const { extraDamage, selfDamage } = applyRageBloodPactEffect(
          extendedParams,
          variantDef,
          attacker.maxHp
        );
        result.extraDamage = extraDamage;
        result.selfDamage = selfDamage;
      }
      break;

    case 'terror':
      if (selectedVariant === 'weaken') {
        const debuff = applyTerrorEffect({ emotion, target, damage }, config);
        if (debuff.target === 'player') {
          result.playerEffects.push(debuff);
        } else {
          result.enemyEffects.push(debuff);
        }
      } else if (selectedVariant === 'poison') {
        const poison = applyTerrorPoisonEffect({ emotion, target, damage }, variantDef);
        console.log('[DEBUG] Terror Poison:', {
          attackerTarget: target,
          poisonTarget: poison.target,
          willPushTo: poison.target === 'player' ? 'playerEffects' : 'enemyEffects'
        });
        if (poison.target === 'player') {
          result.playerEffects.push(poison);
        } else {
          result.enemyEffects.push(poison);
        }
      } else if (selectedVariant === 'curse') {
        const curse = applyTerrorCurseEffect({ emotion, target, damage }, variantDef);
        if (curse.target === 'player') {
          result.playerEffects.push(curse);
        } else {
          result.enemyEffects.push(curse);
        }
      } else if (selectedVariant === 'fan_block') {
        const fanBlock = applyTerrorFanBlockEffect({ emotion, target, damage }, variantDef);
        if (fanBlock.target === 'player') {
          result.playerEffects.push(fanBlock);
        } else {
          result.enemyEffects.push(fanBlock);
        }
      }
      break;

    case 'grief':
      if (selectedVariant === 'drain') {
        result.healing = applyGriefEffect({ emotion, target, damage }, config);
      } else if (selectedVariant === 'desperate') {
        result.healing = applyGriefDesperateEffect(extendedParams, variantDef);
      } else if (selectedVariant === 'cleanse_heal') {
        result.healing = variantDef.magnitude;
        result.cleansed = true; // デバフ解除フラグを立てる（アイコン表示しない）
      } else if (selectedVariant === 'regen') {
        const regen = applyGriefRegenEffect({ emotion, target, damage }, variantDef);
        if (regen.target === 'player') {
          result.playerEffects.push(regen);
        } else {
          result.enemyEffects.push(regen);
        }
      }
      break;

    case 'ecstasy':
      if (selectedVariant === 'inspire') {
        const buff = applyEcstasyEffect({ emotion, target, damage }, config);
        if (buff.target === 'player') {
          result.playerEffects.push(buff);
        } else {
          result.enemyEffects.push(buff);
        }
      } else if (selectedVariant === 'convert') {
        const conversion = applyEcstasyConvertEffect(extendedParams, variantDef);
        if (conversion) {
          result.convertedComments = conversion.comments;
          result.commentConversion = {
            targetEmotion: conversion.targetEmotion,
            convertedCommentIds: conversion.convertedCommentIds,
            count: conversion.convertedCommentIds.length,
          };
        }
      } else if (selectedVariant === 'comment_boost') {
        result.commentBoost = applyEcstasyCommentBoostEffect(variantDef);
      }
      break;
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
  enemyAction: EmotionType,
  playerPoisonDamage: number = 0,
  enemyPoisonDamage: number = 0
): string {
  const actionNames: Record<EmotionType, string> = {
    rage: 'Rage',
    terror: 'Terror',
    grief: 'Grief',
    ecstasy: 'Ecstasy',
  };

  const playerName = actionNames[playerAction];
  const enemyName = actionNames[enemyAction];

  let baseMessage = '';
  if (judgement === 'win') {
    baseMessage = `${playerName} が ${enemyName} に勝利！`;
  } else if (judgement === 'lose') {
    baseMessage = `${enemyName} に敗北…`;
  } else {
    baseMessage = `${playerName} と ${enemyName} は互角！`;
  }

  // 毒ダメージのメッセージを追加
  const poisonMessages: string[] = [];
  if (playerPoisonDamage > 0) {
    poisonMessages.push(`プレイヤーは毒で${playerPoisonDamage}ダメージ！`);
  }
  if (enemyPoisonDamage > 0) {
    poisonMessages.push(`敵は毒で${enemyPoisonDamage}ダメージ！`);
  }

  if (poisonMessages.length > 0) {
    return `${baseMessage} ${poisonMessages.join(' ')}`;
  }

  return baseMessage;
}
