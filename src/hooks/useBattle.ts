'use client';

import { useReducer, useCallback } from 'react';
import { initBattle, executePlayerAction, resetBattle } from '@/lib/battle/battleEngine';
import { generateAudienceCommand } from '@/lib/battle/audienceCommand';
import type { BattleState, ActionType } from '@/lib/battle/types';

type BattleAction =
  | { type: 'START_BATTLE' }
  | { type: 'EXECUTE_ACTION'; payload: ActionType }
  | { type: 'RESET_BATTLE' };

/**
 * バトル状態を管理するReducer
 */
function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'START_BATTLE':
      return initBattle();

    case 'EXECUTE_ACTION':
      return executePlayerAction(state, action.payload);

    case 'RESET_BATTLE':
      return resetBattle();

    default:
      return state;
  }
}

/**
 * バトル状態管理カスタムフック
 */
export function useBattle() {
  const [state, dispatch] = useReducer(battleReducer, null as unknown as BattleState, initBattle);

  /**
   * バトル開始
   */
  const startBattle = useCallback(() => {
    dispatch({ type: 'START_BATTLE' });
  }, []);

  /**
   * プレイヤーの行動を実行
   */
  const selectAction = useCallback(
    (action: ActionType) => {
      if (!state.isActive) {
        return;
      }
      dispatch({ type: 'EXECUTE_ACTION', payload: action });
    },
    [state.isActive]
  );

  /**
   * バトルをリセット
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET_BATTLE' });
  }, []);

  /**
   * 新しい観客指示を生成
   */
  const refreshCommand = useCallback(() => {
    // 観客指示は自動生成されるため、特に何もしない
    // 必要に応じて将来拡張可能
  }, []);

  return {
    // 状態
    state,
    isActive: state.isActive,
    currentTurn: state.currentTurn,
    player: state.player,
    enemy: state.enemy,
    audience: state.audience,
    currentCommand: state.currentCommand,
    turnHistory: state.turnHistory,
    winner: state.winner,

    // アクション
    startBattle,
    selectAction,
    reset,
    refreshCommand,
  };
}
