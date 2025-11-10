/**
 * AI System
 * Enemy AI decision-making
 */

import { EmotionType, BattleState, Comment } from './types';
import { getAllEmotions, getWinningEmotion, getLosingEmotion } from './emotionSystem';
import { getCommentCountByEmotion } from './commentSystem';
import { getEnemyCharacter, type AIStrategyType } from './enemyCharacters';

// ========================================
// AI Difficulty Levels
// ========================================

export type AIDifficulty = 'easy' | 'normal' | 'hard';

// ========================================
// AI Decision Making
// ========================================

/**
 * 敵のアクションを決定
 * @param state バトル状態
 * @param difficulty AI難易度
 * @returns 選択されたアクション
 */
export function decideEnemyAction(
  state: BattleState,
  difficulty: AIDifficulty = 'normal'
): EmotionType {
  // キャラクター固有のAI戦略をチェック
  const enemyCharacter = getEnemyCharacter(state.config.enemyCharacterId);
  if (enemyCharacter.aiStrategy === 'adaptive') {
    return decideAdaptiveAI(state);
  }
  if (enemyCharacter.aiStrategy === 'mirror') {
    return decideMirrorAI(state);
  }

  // 通常の難易度ベースのAI
  switch (difficulty) {
    case 'easy':
      return decideEasyAI(state);
    case 'normal':
      return decideNormalAI(state);
    case 'hard':
      return decideHardAI(state);
    default:
      return decideNormalAI(state);
  }
}

// ========================================
// Adaptive AI (Top 2 Comment Emotions)
// ========================================

/**
 * 適応型AI: コメントプールで最も多い2つの属性から選択
 * @param state バトル状態
 * @returns 選択されたアクション
 */
function decideAdaptiveAI(state: BattleState): EmotionType {
  const available = getEnemyAvailableEmotions(state);
  if (available.length === 0) {
    return 'rage';
  }

  const commentCounts = getCommentCountByEmotion(state.comments);

  // コメント数でソート（多い順）
  const sortedEmotions = Object.entries(commentCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion]) => emotion as EmotionType);

  // 上位2つの属性を取得
  const top2 = sortedEmotions.slice(0, 2).filter(emotion =>
    available.includes(emotion) && (commentCounts[emotion] ?? 0) > 0
  );

  // 上位2つからランダムに選択
  if (top2.length > 0) {
    return top2[Math.floor(Math.random() * top2.length)];
  }

  // コメントがない場合や使用可能な技がない場合は、利用可能な中からランダム
  return available[Math.floor(Math.random() * available.length)];
}

// ========================================
// Mirror AI (Copy Previous Player Action)
// ========================================

/**
 * ミラーAI: 前のターンにプレイヤーが使用した属性を使用
 * @param state バトル状態
 * @returns 選択されたアクション
 */
function decideMirrorAI(state: BattleState): EmotionType {
  const available = getEnemyAvailableEmotions(state);
  if (available.length === 0) {
    return 'rage';
  }

  // 初ターン（履歴がない）場合はランダム
  if (state.turnHistory.length === 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // 前のターンのプレイヤーアクションを取得
  const lastTurn = state.turnHistory[state.turnHistory.length - 1];
  const playerLastAction = lastTurn.playerAction;

  // プレイヤーの前のアクションが使用可能かチェック
  if (available.includes(playerLastAction)) {
    return playerLastAction;
  }

  // 使用できない場合は利用可能な中からランダム
  return available[Math.floor(Math.random() * available.length)];
}

// ========================================
// Easy AI (Random)
// ========================================

/**
 * 簡単AI: ランダムに選択
 * @param state バトル状態
 * @returns 選択されたアクション
 */
function decideEasyAI(state: BattleState): EmotionType {
  const available = getEnemyAvailableEmotions(state);
  if (available.length === 0) {
    return 'rage';
  }
  return available[Math.floor(Math.random() * available.length)];
}

// ========================================
// Normal AI (Weighted Random)
// ========================================

/**
 * 通常AI: 戦況に応じた重み付きランダム
 * @param state バトル状態
 * @returns 選択されたアクション
 */
function decideNormalAI(state: BattleState): EmotionType {
  const weights = calculateActionWeights(state);

  // 重み付きランダム選択
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const available = getEnemyAvailableEmotions(state);
  if (totalWeight <= 0) {
    return available[0] ?? 'rage';
  }
  let random = Math.random() * totalWeight;

  for (const emotion of getAllEmotions()) {
    if (weights[emotion] <= 0) continue;
    random -= weights[emotion];
    if (random <= 0) {
      return emotion;
    }
  }

  return 'rage'; // フォールバック
}

/**
 * アクションの重みを計算
 * @param state バトル状態
 * @returns 各アクションの重み
 */
function calculateActionWeights(state: BattleState): Record<EmotionType, number> {
  const weights: Record<EmotionType, number> = {
    rage: 1.0,
    terror: 1.0,
    grief: 1.0,
    ecstasy: 1.0,
  };

  // HP低下時は回復を優先
  const hpRatio = state.enemy.hp / state.enemy.maxHp;
  if (hpRatio < 0.3) {
    weights.grief += 2.0; // Grief（回復）の重みを増加
  }

  // ファン率が低い時はバフを優先
  if (state.enemy.fanRate < 0.3) {
    weights.ecstasy += 1.5; // Ecstasy（バフ）の重みを増加
  }

  // プレイヤーのファン率が高い時はデバフを優先
  if (state.player.fanRate > 0.7) {
    weights.terror += 1.5; // Terror（デバフ）の重みを増加
  }

  // プレイヤーがバフ状態の時はデバフを優先
  const playerHasBuff = state.player.activeEffects.some((e) => e.type === 'buff');
  if (playerHasBuff) {
    weights.terror += 1.0;
  }

  const skillUses = getEnemySkillUses(state);
  if (skillUses) {
    for (const emotion of getAllEmotions()) {
      if ((skillUses[emotion] ?? 0) <= 0) {
        weights[emotion] = 0;
      }
    }
  }

  return weights;
}

// ========================================
// Hard AI (Strategic)
// ========================================

/**
 * 難しいAI: 戦略的な選択
 * @param state バトル状態
 * @returns 選択されたアクション
 */
function decideHardAI(state: BattleState): EmotionType {
  const available = getEnemyAvailableEmotions(state);
  if (available.length === 0) {
    return 'rage';
  }
  const evaluations = evaluateAllActions(state);

  // 最も評価値の高いアクションを選択
  let bestEmotion: EmotionType = 'rage';
  let bestScore = -Infinity;

  for (const [emotion, score] of Object.entries(evaluations)) {
    if (score > bestScore) {
      bestScore = score;
      bestEmotion = emotion as EmotionType;
    }
  }

  // 少しランダム性を加える（20%の確率で次善手を選ぶ）
  if (Math.random() < 0.2) {
    const sortedEmotions = Object.entries(evaluations)
      .sort(([, a], [, b]) => b - a)
      .map(([emotion]) => emotion as EmotionType);

    return sortedEmotions[1] || bestEmotion;
  }

  if (!hasEnemyUses(state, bestEmotion)) {
    return available[0];
  }

  return bestEmotion;
}

/**
 * すべてのアクションを評価
 * @param state バトル状態
 * @returns 各アクションの評価値
 */
function evaluateAllActions(state: BattleState): Record<EmotionType, number> {
  const evaluations: Record<EmotionType, number> = {
    rage: 0,
    terror: 0,
    grief: 0,
    ecstasy: 0,
  };

  for (const emotion of getAllEmotions()) {
    evaluations[emotion] = evaluateAction(state, emotion);
  }

  return evaluations;
}

/**
 * アクションの価値を評価
 * @param state バトル状態
 * @param emotion アクション
 * @returns 評価値
 */
function evaluateAction(state: BattleState, emotion: EmotionType): number {
  if (!hasEnemyUses(state, emotion)) {
    return -Infinity;
  }
  let score = 0;

  // 1. HP状況による評価
  const enemyHpRatio = state.enemy.hp / state.enemy.maxHp;
  const playerHpRatio = state.player.hp / state.player.maxHp;

  if (enemyHpRatio < 0.3 && emotion === 'grief') {
    score += 50; // 低HPで回復は高評価
  }

  if (playerHpRatio < 0.3 && emotion === 'rage') {
    score += 30; // プレイヤーが瀕死なら攻撃を優先
  }

  // 2. ファン率による評価
  if (state.enemy.fanRate < 0.3 && emotion === 'ecstasy') {
    score += 40; // ファン率が低い時はバフ
  }

  if (state.player.fanRate > 0.7 && emotion === 'terror') {
    score += 40; // プレイヤーのファン率が高い時はデバフ
  }

  // 3. コメント数による評価
  const commentCounts = getCommentCountByEmotion(state.comments);
  // コメントが多い感情は避ける（プレイヤーが選びやすい）
  score -= commentCounts[emotion] * 5;

  // 4. 特殊効果の状況による評価
  const playerHasBuff = state.player.activeEffects.some((e) => e.type === 'buff');
  if (playerHasBuff && emotion === 'terror') {
    score += 30; // プレイヤーにバフがある時はデバフ
  }

  const enemyHasDebuff = state.enemy.activeEffects.some((e) => e.type === 'debuff');
  if (enemyHasDebuff && emotion === 'ecstasy') {
    score += 20; // デバフを受けている時はバフで打ち消す
  }

  // 5. 基本的な戦略評価
  switch (emotion) {
    case 'rage':
      score += 20; // 攻撃は基本的に良い選択
      break;
    case 'terror':
      score += 15; // デバフも有用
      break;
    case 'grief':
      score += 10; // 回復は状況次第
      break;
    case 'ecstasy':
      score += 10; // バフも状況次第
      break;
  }

  return score;
}

// ========================================
// AI Helpers
// ========================================

/**
 * プレイヤーの次の手を予測
 * @param state バトル状態
 * @returns 予測されるアクション
 */
export function predictPlayerAction(state: BattleState): EmotionType {
  const commentCounts = getCommentCountByEmotion(state.comments);

  // コメントが最も多い感情を予測
  let maxCount = 0;
  let predictedEmotion: EmotionType = 'rage';

  for (const [emotion, count] of Object.entries(commentCounts)) {
    if (count > maxCount) {
      maxCount = count;
      predictedEmotion = emotion as EmotionType;
    }
  }

  return predictedEmotion;
}

/**
 * プレイヤーの予測に対するカウンター選択
 * @param predictedPlayerAction 予測されるプレイヤーのアクション
 * @returns カウンターとなるアクション
 */
export function getCounterAction(predictedPlayerAction: EmotionType): EmotionType {
  // プレイヤーの選択に勝てる感情を選ぶ
  return getWinningEmotion(predictedPlayerAction);
}
function getEnemySkillUses(state: BattleState) {
  return state.skillUses?.enemy ?? null;
}

function getEnemyAvailableEmotions(state: BattleState): EmotionType[] {
  const skillUses = getEnemySkillUses(state);
  if (!skillUses) {
    return getAllEmotions();
  }
  return getAllEmotions().filter((emotion) => (skillUses[emotion] ?? 0) > 0);
}

function hasEnemyUses(state: BattleState, emotion: EmotionType): boolean {
  const skillUses = getEnemySkillUses(state);
  if (!skillUses) return true;
  return (skillUses[emotion] ?? 0) > 0;
}
