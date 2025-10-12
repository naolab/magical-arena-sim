'use client';

import { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initBattle, executePlayerAction, resetBattle } from '@/lib/battle/battleEngine';
import { generateAudienceCommand } from '@/lib/battle/audienceCommand';
import type {
  AudienceCommand,
  AudienceComposition,
  BattleState,
  ActionType,
  EnemyState,
  PlayerState,
  TurnResult,
} from '@/lib/battle/types';

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

type BattlePhase = 'announcing' | 'selecting' | 'resolving' | 'showdown' | 'ended';
type ShowdownStage = 'intro' | 'result';

export function useBattle() {
  const [state, dispatch] = useReducer(battleReducer, null as unknown as BattleState, initBattle);
  const [phase, setPhase] = useState<BattlePhase>('announcing');
  const [commandBubbles, setCommandBubbles] = useState<CommandBubble[]>([]);
  const [visibleBubbleCount, setVisibleBubbleCount] = useState(0);
  const [showdownResult, setShowdownResult] = useState<TurnResult | null>(null);
  const [showdownStage, setShowdownStage] = useState<ShowdownStage>('intro');
  const phaseTimerRef = useRef<number | null>(null);
  const bubbleRevealTimersRef = useRef<number[]>([]);
  const showdownTimerRef = useRef<number | null>(null);
  const showdownStageTimerRef = useRef<number | null>(null);
  const previousTurnCountRef = useRef(state.turnHistory.length);
  const bubbleCount = commandBubbles.length;
  const [displayPlayer, setDisplayPlayer] = useState<PlayerState>(state.player);
  const [displayEnemy, setDisplayEnemy] = useState<EnemyState>(state.enemy);
  const [displayAudience, setDisplayAudience] = useState<AudienceComposition>(state.audience);
  const pendingStateRef = useRef<{
    player: PlayerState;
    enemy: EnemyState;
    audience: AudienceComposition;
  } | null>(null);

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
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      if (bubbleRevealTimersRef.current.length) {
        bubbleRevealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        bubbleRevealTimersRef.current = [];
      }
      setVisibleBubbleCount(bubbleCount);
      // 現在の表示状態を保持（showdownまで更新しない）
      pendingStateRef.current = {
        player: state.player,
        enemy: state.enemy,
        audience: state.audience,
      };
      setPhase('resolving');
      dispatch({ type: 'EXECUTE_ACTION', payload: action });
    },
    [bubbleCount, phase, state.isActive, state.player, state.enemy, state.audience]
  );

  /**
   * バトルをリセット
   */
  const reset = useCallback(() => {
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    if (bubbleRevealTimersRef.current.length) {
      bubbleRevealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      bubbleRevealTimersRef.current = [];
    }
    if (showdownTimerRef.current) {
      window.clearTimeout(showdownTimerRef.current);
      showdownTimerRef.current = null;
    }
    if (showdownStageTimerRef.current) {
      window.clearTimeout(showdownStageTimerRef.current);
      showdownStageTimerRef.current = null;
    }
    dispatch({ type: 'RESET_BATTLE' });
    previousTurnCountRef.current = 0;
    setCommandBubbles([]);
    setVisibleBubbleCount(0);
    setShowdownResult(null);
    setShowdownStage('intro');
    pendingStateRef.current = null;
    setPhase('announcing');
  }, []);

  /**
   * 新しい観客指示を生成
   */
  const refreshCommand = useCallback(() => {
    // 観客指示は自動生成されるため、特に何もしない
    // 必要に応じて将来拡張可能
  }, []);

  const acknowledgeShowdown = useCallback(() => {
    if (!showdownResult || showdownStage !== 'result') {
      return;
    }

    if (showdownStageTimerRef.current) {
      window.clearTimeout(showdownStageTimerRef.current);
      showdownStageTimerRef.current = null;
    }
    if (showdownTimerRef.current) {
      window.clearTimeout(showdownTimerRef.current);
      showdownTimerRef.current = null;
    }

    pendingStateRef.current = null;
    setShowdownResult(null);
    setShowdownStage('intro');

    if (state.isActive) {
      setPhase('announcing');
    } else {
      setPhase('ended');
    }
  }, [showdownResult, showdownStage, state.isActive]);

  useEffect(() => {
    if (phase !== 'announcing') {
      return;
    }

    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    if (bubbleRevealTimersRef.current.length) {
      bubbleRevealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      bubbleRevealTimersRef.current = [];
    }

    if (!state.isActive) {
      setCommandBubbles([]);
      setVisibleBubbleCount(0);
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

    const bubbleList: CommandBubble[] = [];

    for (let i = 0; i < state.currentCommands.length; i += 1) {
      const pos = randomPosition(bubbleList);
      bubbleList.push({
        id: `cmd-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        command: state.currentCommands[i],
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        isPrimary: i === 0, // 最初の1つをprimaryとする
      });
    }

    setCommandBubbles(bubbleList);
    setVisibleBubbleCount(0);

    const revealInterval = 400;

    bubbleList.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setVisibleBubbleCount(index + 1);
      }, index * revealInterval);
      bubbleRevealTimersRef.current.push(timer);
    });

    const selectingDelay = bubbleList.length * revealInterval + 600;
    phaseTimerRef.current = window.setTimeout(() => {
      if (state.isActive) {
        setPhase('selecting');
      }
    }, selectingDelay);

    return () => {
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      if (bubbleRevealTimersRef.current.length) {
        bubbleRevealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        bubbleRevealTimersRef.current = [];
      }
    };
  }, [phase, state.currentCommands, state.currentTurn, state.isActive]);

  useEffect(() => {
    const previous = previousTurnCountRef.current;
    const current = state.turnHistory.length;

    if (current > previous) {
      const latest = state.turnHistory[current - 1];
      setShowdownResult(latest);
      setShowdownStage('intro');
      setVisibleBubbleCount(0);
      pendingStateRef.current = {
        player: latest.playerState,
        enemy: latest.enemyState,
        audience: latest.audienceComposition,
      };

      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      if (bubbleRevealTimersRef.current.length) {
        bubbleRevealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        bubbleRevealTimersRef.current = [];
      }

      setPhase('showdown');

      if (showdownStageTimerRef.current) {
        window.clearTimeout(showdownStageTimerRef.current);
        showdownStageTimerRef.current = null;
      }
      if (showdownTimerRef.current) {
        window.clearTimeout(showdownTimerRef.current);
        showdownTimerRef.current = null;
      }

      showdownStageTimerRef.current = window.setTimeout(() => {
        setShowdownStage('result');

        if (pendingStateRef.current) {
          setDisplayPlayer(pendingStateRef.current.player);
          setDisplayEnemy(pendingStateRef.current.enemy);
          setDisplayAudience(pendingStateRef.current.audience);
        }

        if (!state.isActive) {
          showdownTimerRef.current = window.setTimeout(() => {
            acknowledgeShowdown();
          }, 1000);
        }
      }, 1200);
    }

    previousTurnCountRef.current = current;
  }, [acknowledgeShowdown, state.isActive, state.turnHistory, state.turnHistory.length]);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
      }
      if (bubbleRevealTimersRef.current.length) {
        bubbleRevealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      }
      if (showdownTimerRef.current) {
        window.clearTimeout(showdownTimerRef.current);
        showdownTimerRef.current = null;
      }
      if (showdownStageTimerRef.current) {
        window.clearTimeout(showdownStageTimerRef.current);
        showdownStageTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase === 'showdown' || phase === 'resolving' || showdownResult || pendingStateRef.current) {
      return;
    }
    setDisplayPlayer(state.player);
    setDisplayEnemy(state.enemy);
    setDisplayAudience(state.audience);
  }, [phase, showdownResult, state.audience, state.enemy, state.player]);

  const canSelectAction = useMemo(() => phase === 'selecting' && state.isActive, [phase, state.isActive]);

  return {
    // 状態
    state,
    isActive: state.isActive,
    currentTurn: state.currentTurn,
    player: displayPlayer,
    enemy: displayEnemy,
    audience: displayAudience,
    currentCommands: state.currentCommands,
    turnHistory: state.turnHistory,
    winner: state.winner,
    phase,
    commandBubbles,
    visibleBubbleCount,
    showdownResult,
    showdownStage,
    canSelectAction,
    acknowledgeShowdown,

    // アクション
    startBattle,
    selectAction,
    reset,
    refreshCommand,
  };
}
