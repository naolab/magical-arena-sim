'use client';

import { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initBattle, executePlayerAction, resetBattle } from '@/lib/battle/battleEngine';
import { generateAudienceCommand } from '@/lib/battle/audienceCommand';
import type { AudienceCommand, BattleState, ActionType } from '@/lib/battle/types';

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
type CommandBubble = {
  id: string;
  command: AudienceCommand;
  top: string;
  left: string;
  isPrimary: boolean;
};

type BattlePhase = 'announcing' | 'selecting' | 'resolving' | 'ended';

export function useBattle() {
  const [state, dispatch] = useReducer(battleReducer, null as unknown as BattleState, initBattle);
  const [phase, setPhase] = useState<BattlePhase>('announcing');
  const [commandBubbles, setCommandBubbles] = useState<CommandBubble[]>([]);
  const phaseTimerRef = useRef<number | null>(null);

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
      if (!state.isActive || phase !== 'selecting') {
        return;
      }
      setPhase('resolving');
      dispatch({ type: 'EXECUTE_ACTION', payload: action });
    },
    [phase, state.isActive]
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

  useEffect(() => {
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }

    if (!state.isActive) {
      setPhase('ended');
      setCommandBubbles([]);
      return;
    }

    const randomPosition = (existing: CommandBubble[]) => {
      let attempt = 0;
      while (attempt < 20) {
        const top = 30 + Math.random() * 25; // 30% - 55%
        const left = 26 + Math.random() * 48; // 26% - 74%

        const isTooClose = existing.some((bubble) => {
          const dx = parseFloat(bubble.left) - left;
          const dy = parseFloat(bubble.top) - top;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 14; // minimum distance in percentage points
        });

        if (!isTooClose) {
          return { top, left };
        }

        attempt += 1;
      }

      // fallback
      const fallbackTop = 30 + Math.random() * 25;
      const fallbackLeft = 26 + Math.random() * 48;
      return { top: fallbackTop, left: fallbackLeft };
    };

    const primaryBubble: CommandBubble = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      command: state.currentCommand,
      ...(() => {
        const pos = randomPosition([]);
        return { top: `${pos.top}%`, left: `${pos.left}%` };
      })(),
      isPrimary: true,
    };

    const bubbleList: CommandBubble[] = [primaryBubble];

    for (let i = 0; i < 2; i += 1) {
      const pos = randomPosition(bubbleList);
      bubbleList.push({
        id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        command: generateAudienceCommand(),
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        isPrimary: false,
      });
    }

    setCommandBubbles(bubbleList);
    setPhase('announcing');

    phaseTimerRef.current = window.setTimeout(() => {
      setPhase('selecting');
    }, 1500);

    return () => {
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [state.currentTurn, state.currentCommand, state.isActive]);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
      }
    };
  }, []);

  const canSelectAction = useMemo(() => phase === 'selecting' && state.isActive, [phase, state.isActive]);

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
    phase,
    commandBubbles,
    canSelectAction,

    // アクション
    startBattle,
    selectAction,
    reset,
    refreshCommand,
  };
}
