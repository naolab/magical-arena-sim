/**
 * 三すくみ判定ロジック
 * アタック > アピール > ガード > アタック
 */

import type { ActionType, BattleResult } from './types';

/**
 * プレイヤーと敵の行動から勝敗を判定
 * @param playerAction プレイヤーの行動
 * @param enemyAction 敵の行動
 * @returns プレイヤー視点での勝敗結果
 */
export function judgeAction(playerAction: ActionType, enemyAction: ActionType): BattleResult {
  // 同じ行動なら引き分け
  if (playerAction === enemyAction) {
    return 'draw';
  }

  // 三すくみの勝利条件マップ
  const winConditions: Record<ActionType, ActionType> = {
    attack: 'appeal', // アタックはアピールに勝つ
    appeal: 'guard', // アピールはガードに勝つ
    guard: 'attack', // ガードはアタックに勝つ
  };

  // プレイヤーの行動が相手の行動に勝つかチェック
  return winConditions[playerAction] === enemyAction ? 'win' : 'lose';
}

/**
 * 行動名を日本語に変換
 */
export function getActionName(action: ActionType): string {
  const names: Record<ActionType, string> = {
    attack: 'アタック',
    appeal: 'アピール',
    guard: 'ガード',
  };
  return names[action];
}

/**
 * 勝敗結果を日本語に変換
 */
export function getResultName(result: BattleResult): string {
  const names: Record<BattleResult, string> = {
    win: '勝利',
    draw: '引き分け',
    lose: '敗北',
  };
  return names[result];
}
