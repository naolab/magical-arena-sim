'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BattleState, EmotionType } from '@/lib/battle-v2/types';
import { initBattle, executePlayerAction, isBattleOver } from '@/lib/battle-v2/battleEngine';
import { decideEnemyAction } from '@/lib/battle-v2/aiSystem';
import { CommentPool } from './CommentPool';

const BASE_STAGE_WIDTH = 1600;
const BASE_STAGE_HEIGHT = 900;

export function BattleContainer() {
  // バトル状態
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShowdown, setShowShowdown] = useState(false);
  const [recentCommentIds, setRecentCommentIds] = useState<string[]>([]);

  // 画面スケーリング
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  // クライアントサイドでバトルを初期化
  useEffect(() => {
    setBattleState(initBattle());
  }, []);

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
    if (!battleState || isProcessing || isBattleOver(battleState)) return;

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

  // 初期化中はローディング表示
  if (!battleState) {
    return (
      <main className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen bg-black flex items-center justify-center">
      {/* スケーリングコンテナ */}
      <div style={stageWrapperStyle}>
        <div style={stageStyle}>
          {/* 16:9固定レイアウト */}
          <div className="relative w-full h-full bg-gray-900">
            {/* バトルエリア */}
            <div className="absolute top-[-4px] left-0 w-[1200px] h-[800px] border-4 border-white">
              {/* 中央：バトル画面 */}
              <div className="absolute top-[120px] left-0 right-0 bottom-[120px] z-0">
                {/* バトル画面 */}

                {/* 中央ファンゲージ（仮） */}
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      width: '50px',
                      height: '130%',
                      transform: 'rotate(-15deg)',
                      background: 'linear-gradient(to bottom, #ec4899 0%, #ec4899 50%, #22d3ee 50%, #22d3ee 100%)',
                      border: '2px solid white',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                {/* 左上：プレイヤーHPゲージ */}
                <div className="absolute top-0 left-12 w-[300px]">
                  <div className="relative h-7 bg-gray-800 border-2 border-white rounded">
                    <div
                      className="absolute top-0 left-0 h-full bg-lime-500 rounded"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* 右下：敵HPゲージ */}
                <div className="absolute bottom-0 right-12 w-[300px]">
                  <div className="relative h-7 bg-gray-800 border-2 border-white rounded">
                    <div
                      className="absolute top-0 left-0 h-full bg-lime-500 rounded"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* 上部：テキストボックス */}
              <div className="absolute top-0 left-0 right-0 h-[120px] z-10">
                <div className="relative w-full h-full">
                  <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path
                      d="M 0 0 L 1200 0 L 1200 80 L 1050 80 L 1020 120 L 990 80 L 0 80 Z"
                      fill="black"
                      stroke="#ec4899"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full p-3">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent text-white px-3 text-lg"
                      placeholder="上部テキスト"
                    />
                  </div>
                </div>
              </div>

              {/* 下部：テキストボックス */}
              <div className="absolute bottom-0 left-0 right-0 h-[120px] z-10">
                <div className="relative w-full h-full">
                  <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path
                      d="M 0 40 L 150 40 L 180 0 L 210 40 L 1200 40 L 1200 120 L 0 120 Z"
                      fill="black"
                      stroke="#22d3ee"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full p-3">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent text-white px-3 text-lg"
                      placeholder="下部テキスト"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右上：コメントエリア */}
            <div className="absolute top-8 left-[1220px] right-8 h-[720px] bg-black border-4 border-white overflow-hidden">
              <div className="p-4 h-full">
                <CommentPool comments={battleState.comments} recentCommentIds={recentCommentIds} />
              </div>
            </div>

            {/* 右下：ターン表示 */}
            <div className="absolute bottom-6 right-8">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 via-black/40 to-black/70 shadow-[0_18px_32px_rgba(8,6,20,0.55)] backdrop-blur">
                <div className="absolute inset-2.5 rounded-full border border-white/10" />
                <div className="text-center">
                  <p className="text-[9px] uppercase tracking-[0.45em] text-white/60">Turn</p>
                  <p className="text-2xl font-black text-white leading-tight">
                    {String(battleState.turnHistory.length).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
