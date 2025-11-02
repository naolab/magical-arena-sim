'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BattleState, EmotionType } from '@/lib/battle-v2/types';
import { initBattle, executePlayerAction, isBattleOver } from '@/lib/battle-v2/battleEngine';
import { decideEnemyAction } from '@/lib/battle-v2/aiSystem';
import { judgeEmotion } from '@/lib/battle-v2/emotionSystem';
import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { CommentPool } from './CommentPool';
import { EmotionActionButtons } from './EmotionActionButtons';
import { TypewriterText } from './TypewriterText';
import { BattleResult } from './BattleResult';
import { ActionShowdown } from './ActionShowdown';
import { SettingsMenu } from './SettingsMenu';
import { RulesModal } from './RulesModal';

const BASE_STAGE_WIDTH = 1600;
const BASE_STAGE_HEIGHT = 900;

// 敵キャラのセリフ
const ENEMY_DIALOGUES = [
  'ちゃんと言うことを聞かないと飼い犬に手を噛まれちゃうよ？',
  'あら、構ってもらえるのがそんなに嬉しかった？',
  'その程度の力で私に勝てると思ってるの？',
  'もっと本気を出してくれないと、つまらないわ',
  'いい調子ね、でもまだまだ甘いわよ',
];

// プレイヤーのセリフ
const PLAYER_DIALOGUES = [
  'その挑発、私には効かないわよ？',
  'あら、もう息切れ？まだまだこれからなのに',
  '少し本気を出してあげようかしら',
  'もっと楽しませてくれると思ったのに、残念ね',
  'あなたの動き、全部読めてるわよ？',
];

export function BattleContainer() {
  const { params } = useBattleParamsV2();

  // バトル状態
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShowdown, setShowShowdown] = useState(false);
  const [recentCommentIds, setRecentCommentIds] = useState<string[]>([]);
  const [playerDialogue, setPlayerDialogue] = useState('');
  const [enemyDialogue, setEnemyDialogue] = useState('');
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [enemyDialogueComplete, setEnemyDialogueComplete] = useState(false);
  const [showdownActions, setShowdownActions] = useState<{ player: EmotionType; enemy: EmotionType } | null>(null);

  // 画面スケーリング
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  // HPゲージの色を計算
  const getHpColor = (hpRatio: number): string => {
    if (hpRatio > 0.7) return '#84cc16'; // 緑
    if (hpRatio > 0.2) return '#eab308'; // 黄色
    return '#ef4444'; // 赤
  };

  // セリフをランダムに選択
  const selectRandomDialogue = () => {
    const randomEnemy = ENEMY_DIALOGUES[Math.floor(Math.random() * ENEMY_DIALOGUES.length)];
    const randomPlayer = PLAYER_DIALOGUES[Math.floor(Math.random() * PLAYER_DIALOGUES.length)];
    setEnemyDialogue(randomEnemy);
    setPlayerDialogue(randomPlayer);
    setEnemyDialogueComplete(false);
  };

  // クライアントサイドでバトルを初期化
  useEffect(() => {
    setBattleState(initBattle(params));
    selectRandomDialogue();
  }, [params]);

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
  const handleEmotionClick = async (emotion: EmotionType) => {
    if (!battleState || isProcessing || isBattleOver(battleState)) return;

    // まだ選択されていない場合は選択のみ
    if (selectedEmotion !== emotion) {
      setSelectedEmotion(emotion);
      return;
    }

    // すでに選択されている感情を再度クリックした場合は攻撃実行
    setIsProcessing(true);
    setShowActionButtons(false);
    setSelectedEmotion(null);

    // 選択した感情のコメントを即座に消費（UI更新）
    const updatedComments = battleState.comments.filter(c => c.emotion !== emotion);
    setBattleState({
      ...battleState,
      comments: updatedComments,
    });

    try {
      // 敵のアクションを決定
      const enemyEmotion = decideEnemyAction(battleState, 'normal');

      // Showdownを表示
      setShowdownActions({ player: emotion, enemy: enemyEmotion });
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

      // 新しいセリフを選択
      selectRandomDialogue();

      // Showdownを隠す
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowShowdown(false);
      setShowdownActions(null);
    } catch (error) {
      console.error('Turn processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // バトルエリアクリックで攻撃選択表示
  const handleBattleAreaClick = () => {
    if (!isProcessing && !isBattleOver(battleState!) && !showActionButtons) {
      setShowActionButtons(true);
    }
  };

  // バトルリスタート
  const handleRestart = () => {
    setBattleState(initBattle(params));
    setShowShowdown(false);
    setRecentCommentIds([]);
    setShowActionButtons(false);
    setSelectedEmotion(null);
    setEnemyDialogueComplete(false);
    setShowdownActions(null);
    selectRandomDialogue();
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
            <div
              className="absolute top-[-4px] left-0 w-[1200px] h-[800px] border-4 border-white cursor-pointer"
              onClick={handleBattleAreaClick}
            >
              {/* 中央：バトル画面 */}
              <div className="absolute top-[120px] left-0 right-0 bottom-[120px] z-0">
                {/* バトル画面 */}

                {/* 中央ファンゲージ */}
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      width: '50px',
                      height: '130%',
                      transform: 'rotate(-15deg)',
                      background: `linear-gradient(to bottom,
                        #ec4899 0%,
                        #ec4899 ${battleState.audience.enemyFans * 100}%,
                        #9ca3af ${battleState.audience.enemyFans * 100}%,
                        #9ca3af ${(battleState.audience.enemyFans + battleState.audience.neutralFans) * 100}%,
                        #22d3ee ${(battleState.audience.enemyFans + battleState.audience.neutralFans) * 100}%,
                        #22d3ee 100%)`,
                      border: '2px solid white',
                      borderRadius: '4px',
                      transition: 'background 0.5s ease',
                    }}
                  />
                </div>

                {/* 左上：プレイヤーHPゲージ */}
                <div className="absolute top-0 left-12 w-[300px]">
                  <div className="relative h-7 bg-gray-800 border-2 border-white rounded">
                    <div
                      className="absolute top-0 left-0 h-full rounded transition-all duration-300"
                      style={{
                        width: `${(battleState.player.hp / battleState.player.maxHp) * 100}%`,
                        backgroundColor: getHpColor(battleState.player.hp / battleState.player.maxHp)
                      }}
                    />
                  </div>
                </div>

                {/* 右下：敵HPゲージ */}
                <div className="absolute bottom-0 right-12 w-[300px]">
                  <div className="relative h-7 bg-gray-800 border-2 border-white rounded">
                    <div
                      className="absolute top-0 left-0 h-full rounded transition-all duration-300"
                      style={{
                        width: `${(battleState.enemy.hp / battleState.enemy.maxHp) * 100}%`,
                        backgroundColor: getHpColor(battleState.enemy.hp / battleState.enemy.maxHp)
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 上部：テキストボックス（敵） */}
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
                  <div className="absolute top-0 left-0 w-full h-full pt-6 px-6 flex items-start justify-center">
                    <TypewriterText
                      text={enemyDialogue}
                      className="text-white text-2xl text-center"
                      onComplete={() => setEnemyDialogueComplete(true)}
                    />
                  </div>
                </div>
              </div>

              {/* 下部：テキストボックス（プレイヤー） */}
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
                  <div className="absolute top-0 left-0 w-full h-full pb-6 px-6 flex items-end justify-center">
                    <TypewriterText
                      text={enemyDialogueComplete ? playerDialogue : ''}
                      className="text-white text-2xl text-center"
                    />
                  </div>
                  {/* 次へ進むアイコン */}
                  {!showActionButtons && (
                    <div className="absolute bottom-4 right-8 animate-bounce">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 10L12 15L17 10" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* 攻撃選択ボタン */}
              {showActionButtons && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                  <EmotionActionButtons
                    onAction={handleEmotionClick}
                    disabled={isProcessing}
                    comments={battleState.comments}
                    selectedEmotion={selectedEmotion}
                  />
                </div>
              )}

              {/* アクションショーダウン */}
              {showShowdown && showdownActions && (
                <ActionShowdown
                  playerAction={showdownActions.player}
                  enemyAction={showdownActions.enemy}
                  result={judgeEmotion(showdownActions.player, showdownActions.enemy)}
                />
              )}
            </div>

            {/* 右上：コメントエリア */}
            <div className="absolute top-8 left-[1220px] right-8 h-[720px] bg-black border-4 border-white overflow-hidden">
              <div className="p-4 h-full">
                <CommentPool
                  comments={battleState.comments}
                  recentCommentIds={recentCommentIds}
                  highlightEmotion={selectedEmotion}
                />
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

            {/* 左下：設定メニューとルール */}
            <div className="absolute bottom-6 left-8 flex gap-4">
              <SettingsMenu onRestart={handleRestart} />
              <RulesModal />
            </div>

            {/* リザルト画面 */}
            {isBattleOver(battleState) && battleState.winner && (
              <BattleResult
                winner={battleState.winner}
                onRestart={handleRestart}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
