/**
 * Comment System
 * Manages comment generation, consumption, and pool management
 */

import { Comment, EmotionType, CommentGenerationParams } from './types';
import { getAllEmotions } from './emotionSystem';

// ========================================
// Constants
// ========================================

/** コメントプールの最大サイズ */
export const MAX_COMMENT_POOL_SIZE = 10;

/** 1ターンごとに追加されるコメント数 */
export const COMMENTS_PER_TURN = 3;

/** サンプルコメントテキスト（実装時に拡張可能） */
const SAMPLE_COMMENT_TEXTS: Record<EmotionType, string[]> = {
  rage: [
    '全力で行け！',
    '怒りを見せろ！',
    '容赦するな！',
    '燃やし尽くせ！',
    '圧倒しろ！',
  ],
  terror: [
    '恐怖を与えろ！',
    '怯ませろ！',
    '震えさせろ！',
    '不安にさせろ！',
    'プレッシャーをかけろ！',
  ],
  grief: [
    '悲しみを伝えろ…',
    '心を揺さぶれ…',
    '涙を誘え…',
    '哀しみを見せろ…',
    '諦めるな…',
  ],
  ecstasy: [
    '最高だ！',
    '陶酔しろ！',
    '喜びを見せろ！',
    '幸せを感じろ！',
    '至福の時だ！',
  ],
};

// ========================================
// Comment Generation
// ========================================

/**
 * ランダムにコメントを生成
 * @param params 生成パラメータ
 * @param currentTurn 現在のターン数
 * @returns 生成されたコメントの配列
 */
export function generateComments(
  params: CommentGenerationParams,
  currentTurn: number
): Comment[] {
  const { count, emotionWeights } = params;
  const comments: Comment[] = [];

  for (let i = 0; i < count; i++) {
    const emotion = selectRandomEmotion(emotionWeights);
    const text = selectRandomCommentText(emotion);

    comments.push({
      id: generateCommentId(currentTurn, i),
      emotion,
      text,
      createdAt: currentTurn,
    });
  }

  return comments;
}

/**
 * 感情をランダムに選択
 * @param weights 感情の重み（省略時は均等）
 * @returns 選択された感情
 */
function selectRandomEmotion(
  weights?: Record<EmotionType, number>
): EmotionType {
  const emotions = getAllEmotions();

  if (!weights) {
    // 重みなし: 均等に選択
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  // 重み付き選択
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (const emotion of emotions) {
    random -= weights[emotion] || 0;
    if (random <= 0) {
      return emotion;
    }
  }

  return emotions[0]; // フォールバック
}

/**
 * 感情に応じたコメントテキストをランダムに選択
 * @param emotion 感情
 * @returns コメントテキスト
 */
function selectRandomCommentText(emotion: EmotionType): string {
  const texts = SAMPLE_COMMENT_TEXTS[emotion];
  return texts[Math.floor(Math.random() * texts.length)];
}

/**
 * コメントIDを生成
 * @param turn ターン数
 * @param index インデックス
 * @returns ユニークなID
 */
function generateCommentId(turn: number, index: number): string {
  return `comment_t${turn}_${index}_${Date.now()}`;
}

// ========================================
// Comment Pool Management
// ========================================

/**
 * コメントプールにコメントを追加
 * 最大サイズを超える場合は古いものから削除
 * @param pool 現在のコメントプール
 * @param newComments 追加するコメント
 * @returns 更新されたコメントプール
 */
export function addCommentsToPool(
  pool: Comment[],
  newComments: Comment[]
): Comment[] {
  const updated = [...pool, ...newComments];

  // 最大サイズを超えたら古いものから削除
  if (updated.length > MAX_COMMENT_POOL_SIZE) {
    return updated.slice(updated.length - MAX_COMMENT_POOL_SIZE);
  }

  return updated;
}

/**
 * 指定した感情のコメントを全て消費
 * @param pool コメントプール
 * @param emotion 消費する感情
 * @returns { remaining: 残りのコメント, consumed: 消費されたコメント }
 */
export function consumeComments(
  pool: Comment[],
  emotion: EmotionType
): { remaining: Comment[]; consumed: Comment[] } {
  const consumed = pool.filter((c) => c.emotion === emotion);
  const remaining = pool.filter((c) => c.emotion !== emotion);

  return { remaining, consumed };
}

/**
 * 感情ごとのコメント数をカウント
 * @param pool コメントプール
 * @returns 感情ごとのコメント数
 */
export function getCommentCountByEmotion(
  pool: Comment[]
): Record<EmotionType, number> {
  const counts: Record<EmotionType, number> = {
    rage: 0,
    terror: 0,
    grief: 0,
    ecstasy: 0,
  };

  for (const comment of pool) {
    counts[comment.emotion]++;
  }

  return counts;
}

/**
 * 指定したターン数より古いコメントを削除
 * @param pool コメントプール
 * @param currentTurn 現在のターン
 * @param maxAge 最大保持ターン数
 * @returns 更新されたコメントプール
 */
export function pruneOldComments(
  pool: Comment[],
  currentTurn: number,
  maxAge: number = 10
): Comment[] {
  return pool.filter((comment) => currentTurn - comment.createdAt < maxAge);
}

/**
 * コメントプールの総数を取得
 * @param pool コメントプール
 * @returns コメント数
 */
export function getCommentPoolSize(pool: Comment[]): number {
  return pool.length;
}
