'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BattleState, EmotionType } from '@/lib/battle-v2/types';
import { initBattle, executePlayerAction, isBattleOver } from '@/lib/battle-v2/battleEngine';
import { decideEnemyAction } from '@/lib/battle-v2/aiSystem';
import { EmotionActionButtons } from './EmotionActionButtons';
import { CommentPool } from './CommentPool';
import { CommentIndicator } from './CommentIndicator';
import { PlayerStatus } from './PlayerStatus';
import { EnemyStatus } from './EnemyStatus';
import { SpecialEffectDisplay } from './SpecialEffectDisplay';
import { AudienceDisplay } from './AudienceDisplay';
import { DialogueBox } from './DialogueBox';
import { ActionShowdown } from './ActionShowdown';
import { BattleResult } from './BattleResult';

const BASE_STAGE_WIDTH = 1600;
const BASE_STAGE_HEIGHT = 900;

export function BattleContainer() {
  // バトル状態
  const [battleState, setBattleState] = useState<BattleState>(() => initBattle());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShowdown, setShowShowdown] = useState(false);
  const [recentCommentIds, setRecentCommentIds] = useState<string[]>([]);

  // 画面スケーリング
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = useMemo(() => {
    const ratio = Math.min(
      viewportSize.width / BASE_STAGE_WIDTH,
      viewportSize.height / BASE_STAGE_HEIGHT
    );
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  }, [viewportSize]);

  const stageWrapperStyle = useMemo<CSSProperties>(
    () => ({
      width: BASE_STAGE_WIDTH * scale,
      height: BASE_STAGE_HEIGHT * scale,
    }),
    [scale]
  );

  const stageStyle = useMemo<CSSProperties>(
    () => ({
      width: BASE_STAGE_WIDTH,
      height: BASE_STAGE_HEIGHT,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    }),
    [scale]
  );

  // プレイヤーアクション処理
  const handlePlayerAction = async (emotion: EmotionType) => {
    if (isProcessing || isBattleOver(battleState)) return;

    setIsProcessing(true);

    try {
      // 敵のアクションを決定
      const enemyEmotion = decideEnemyAction(battleState, 'normal');

      // Showdownを表示
      setShowShowdown(true);

      // 少し待ってからターン処理
      await new Promise(resolve => setTimeout(resolve, 1500));

      // ターン処理を実行
      const newState = executePlayerAction(battleState, emotion, enemyEmotion);

      // 新しいコメントIDを記録
      const oldCommentIds = battleState.comments.map(c => c.id);
      const newCommentIds = newState.comments
        .filter(c => !oldCommentIds.includes(c.id))
        .map(c => c.id);
      setRecentCommentIds(newCommentIds);

      setBattleState(newState);

      // Showdownを隠す
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowShowdown(false);
    } catch (error) {
      console.error('Turn processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // バトルリスタート
  const handleRestart = () => {
    setBattleState(initBattle());
    setShowShowdown(false);
    setRecentCommentIds([]);
  };

  // 最新のターン結果
  const latestTurnResult = battleState.turnHistory[battleState.turnHistory.length - 1];

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-black">
      <div style={stageWrapperStyle} className="pointer-events-none">
        <div
          style={stageStyle}
          className="pointer-events-auto overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 to-black shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
        >
          {/* メインコンテンツ */}
          <div className="flex h-full w-full gap-4 p-6">
            {/* 左側: ステータス */}
            <div className="flex w-1/4 flex-col gap-4">
              <PlayerStatus player={battleState.player} />
              <EnemyStatus enemy={battleState.enemy} />
              <AudienceDisplay audience={battleState.audience} />

              {battleState.player.activeEffects.length > 0 && (
                <SpecialEffectDisplay
                  effects={battleState.player.activeEffects}
                  target="player"
                />
              )}

              {battleState.enemy.activeEffects.length > 0 && (
                <SpecialEffectDisplay
                  effects={battleState.enemy.activeEffects}
                  target="enemy"
                />
              )}
            </div>

            {/* 中央: メインエリア */}
            <div className="flex flex-1 flex-col gap-4">
              {/* ターン数 */}
              <div className="text-center">
                <div className="inline-block rounded-full bg-white/10 px-6 py-2 text-xl font-bold text-white backdrop-blur-sm">
                  Turn {battleState.currentTurn}
                </div>
              </div>

              {/* Showdown表示 */}
              {showShowdown && latestTurnResult && (
                <ActionShowdown
                  playerAction={latestTurnResult.playerAction}
                  enemyAction={latestTurnResult.enemyAction}
                  result={latestTurnResult.judgement}
                />
              )}

              {/* アクションボタン */}
              {!showShowdown && (
                <div className="flex-1 flex items-center justify-center">
                  <EmotionActionButtons
                    onAction={handlePlayerAction}
                    disabled={isProcessing || isBattleOver(battleState)}
                    comments={battleState.comments}
                  />
                </div>
              )}
            </div>

            {/* 右側: コメント */}
            <div className="flex w-1/4 flex-col gap-4">
              <CommentIndicator comments={battleState.comments} />
              <CommentPool
                comments={battleState.comments}
                recentCommentIds={recentCommentIds}
              />
            </div>
          </div>

          {/* 会話システム（TODO: 実装） */}
          {/* <DialogueBox dialogue={currentDialogue} onNext={handleNextDialogue} /> */}

          {/* バトル結果 */}
          {battleState.winner && (
            <BattleResult winner={battleState.winner} onRestart={handleRestart} />
          )}
        </div>
      </div>
    </main>
  );
}
