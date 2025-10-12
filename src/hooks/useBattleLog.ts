'use client';

import { useMemo } from 'react';
import type { TurnResult, ActionType } from '@/lib/battle/types';

/**
 * バトルログ管理カスタムフック
 */
export function useBattleLog(turnHistory: TurnResult[]) {
  /**
   * 最新のログを取得
   */
  const latestLog = useMemo(() => {
    return turnHistory.length > 0 ? turnHistory[turnHistory.length - 1] : null;
  }, [turnHistory]);

  /**
   * 特定の行動のログをフィルタ
   */
  const filterByAction = useMemo(() => {
    return (action: ActionType) => {
      return turnHistory.filter((turn) => turn.playerAction === action);
    };
  }, [turnHistory]);

  /**
   * 勝利したターンのみ取得
   */
  const winTurns = useMemo(() => {
    return turnHistory.filter((turn) => turn.judgement === 'win');
  }, [turnHistory]);

  /**
   * 敗北したターンのみ取得
   */
  const loseTurns = useMemo(() => {
    return turnHistory.filter((turn) => turn.judgement === 'lose');
  }, [turnHistory]);

  /**
   * 統計情報を計算
   */
  const stats = useMemo(() => {
    const total = turnHistory.length;
    const wins = winTurns.length;
    const losses = loseTurns.length;
    const draws = total - wins - losses;

    const totalDamageDealt = turnHistory.reduce((sum, turn) => sum + turn.damage.toEnemy, 0);
    const totalDamageTaken = turnHistory.reduce((sum, turn) => sum + turn.damage.toPlayer, 0);

    const commandFollowCount = turnHistory.filter((turn) => turn.commandFollowed).length;
    const commandFollowRate = total > 0 ? (commandFollowCount / total) * 100 : 0;

    return {
      totalTurns: total,
      wins,
      losses,
      draws,
      winRate: total > 0 ? (wins / total) * 100 : 0,
      totalDamageDealt,
      totalDamageTaken,
      commandFollowRate,
    };
  }, [turnHistory, winTurns.length, loseTurns.length]);

  /**
   * ログをリバース（最新が先頭）
   */
  const reversedHistory = useMemo(() => {
    return [...turnHistory].reverse();
  }, [turnHistory]);

  return {
    // ログデータ
    turnHistory,
    reversedHistory,
    latestLog,

    // フィルタ済みデータ
    winTurns,
    loseTurns,

    // 統計
    stats,

    // ユーティリティ
    filterByAction,
  };
}
