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
    <main className="h-screen w-screen bg-black flex items-center justify-center">
      {/* スケーリングコンテナ */}
      <div style={stageWrapperStyle}>
        <div style={stageStyle}>
          {/* 16:9固定レイアウト */}
          <div className="relative w-full h-full bg-gray-900">
            {/* バトルエリア */}
            <div className="absolute top-[-4px] left-0 w-[1200px] h-[800px] border-4 border-white">
              {/* 上部：テキストボックス */}
              <div className="absolute top-0 left-0 right-0 h-[80px] bg-black border-b-4 border-pink-500">
                <div className="p-3">
                  <input
                    type="text"
                    className="w-full h-full bg-gray-800 text-white px-3 text-lg"
                    placeholder="上部テキスト"
                  />
                </div>
              </div>

              {/* 中央：バトル画面 */}
              <div className="absolute top-[80px] left-0 right-0 bottom-[80px]">
                {/* バトル画面 */}
              </div>

              {/* 下部：テキストボックス */}
              <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-black border-t-4 border-cyan-400">
                <div className="p-3">
                  <input
                    type="text"
                    className="w-full h-full bg-gray-800 text-white px-3 text-lg"
                    placeholder="下部テキスト"
                  />
                </div>
              </div>
            </div>

            {/* 右上：コメントエリア */}
            <div className="absolute top-8 left-[1220px] right-8 h-[720px] bg-black border-4 border-white">
              <div className="p-4">
                <h3 className="text-blue-400 text-xl font-bold">コメント</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
