'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { BattleState, EmotionType, TurnResult } from '@/lib/battle-v2/types';
import { initBattle, executePlayerAction, isBattleOver } from '@/lib/battle-v2/battleEngine';
import { decideEnemyAction } from '@/lib/battle-v2/aiSystem';
import { getEmotionName } from '@/lib/battle-v2/emotionSystem';
import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { CommentPool } from './CommentPool';
import { EmotionActionButtons } from './EmotionActionButtons';
import { TypewriterText } from './TypewriterText';
import { BattleResult } from './BattleResult';
import { SettingsMenu } from './SettingsMenu';
import { RulesModal } from './RulesModal';
import { getEffectDescription } from '@/lib/battle-v2/specialEffects';

const BASE_STAGE_WIDTH = 1600;
const BASE_STAGE_HEIGHT = 900;

const ENEMY_DIALOGUES = [
  'ちゃんと言うことを聞かないと飼い犬に手を噛まれちゃうよ？',
  'あら、構ってもらえるのがそんなに嬉しかった？',
  'その程度の力で私に勝てると思ってるの？',
  'もっと本気を出してくれないと、つまらないわ',
  'いい調子ね、でもまだまだ甘いわよ',
];

const PLAYER_DIALOGUES = [
  'その挑発、私には効かないわよ？',
  'あら、もう息切れ？まだまだこれからなのに',
  '少し本気を出してあげようかしら',
  'もっと楽しませてくれると思ったのに、残念ね',
  'あなたの動き、全部読めてるわよ？',
];

type BattleMessageSpeaker = 'player' | 'enemy' | 'system';

interface BattleMessage {
  id: string;
  speaker: BattleMessageSpeaker;
  text: string;
}

const JUDGEMENT_MESSAGE: Record<'win' | 'draw' | 'lose', string> = {
  win: '有利を取った！',
  draw: '互角のぶつかり合いだ！',
  lose: '不利を取られてしまった…',
};

const WINNER_MESSAGE: Record<'player' | 'enemy' | 'draw', string> = {
  player: '敵を倒した！',
  enemy: '倒れてしまった…',
  draw: '相打ちになった！',
};

function createMessage(speaker: BattleMessageSpeaker, text: string): BattleMessage {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return { id, speaker, text };
}

function formatDamageText(amount: number, target: 'enemy' | 'player'): string {
  if (amount <= 0) {
    return target === 'enemy'
      ? 'しかし敵にダメージは通らなかった！'
      : 'しかしダメージは受けなかった！';
  }

  return target === 'enemy'
    ? `敵に ${amount} のダメージ！`
    : `あなたは ${amount} のダメージを受けた！`;
}

function buildEffectMessages(effects: TurnResult['specialEffects']['player'], target: 'player' | 'enemy'): BattleMessage[] {
  if (effects.length === 0) return [];

  const targetLabel = target === 'player' ? 'あなた' : '敵';

  return effects.map((effect) =>
    createMessage('system', `${targetLabel}に効果「${getEffectDescription(effect)}」が付与された！`)
  );
}

function buildTurnMessages(result: TurnResult): BattleMessage[] {
  const messages: BattleMessage[] = [];

  const playerEmotionName = getEmotionName(result.playerAction);
  const enemyEmotionName = getEmotionName(result.enemyAction);

  messages.push(createMessage('system', JUDGEMENT_MESSAGE[result.judgement]));

  messages.push(
    createMessage(
      'player',
      `あなたは ${playerEmotionName} を繰り出した！${formatDamageText(result.damage.toEnemy, 'enemy')}`
    )
  );

  messages.push(...buildEffectMessages(result.specialEffects.player, 'player'));
  messages.push(...buildEffectMessages(result.specialEffects.enemy, 'enemy'));

  messages.push(
    createMessage(
      'enemy',
      `敵は ${enemyEmotionName} を繰り出した！${formatDamageText(result.damage.toPlayer, 'player')}`
    )
  );

  return messages;
}

export function BattleContainer() {
  const { params } = useBattleParamsV2();

  // バトル状態
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCommentIds, setRecentCommentIds] = useState<string[]>([]);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [playerDialogue, setPlayerDialogue] = useState(() => PLAYER_DIALOGUES[0]);
  const [enemyDialogue, setEnemyDialogue] = useState(() => ENEMY_DIALOGUES[0]);
  const [messageQueue, setMessageQueue] = useState<BattleMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<BattleMessage | null>(null);
  const [isMessageAnimating, setIsMessageAnimating] = useState(false);
  const [pendingAutoAdvance, setPendingAutoAdvance] = useState(false);

  // 画面スケーリング
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  const initialMessageShownRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectRandomDialogue = useCallback(() => {
    const nextEnemy = ENEMY_DIALOGUES[Math.floor(Math.random() * ENEMY_DIALOGUES.length)];
    const nextPlayer = PLAYER_DIALOGUES[Math.floor(Math.random() * PLAYER_DIALOGUES.length)];
    setEnemyDialogue(nextEnemy);
    setPlayerDialogue(nextPlayer);
  }, []);

  const enqueueMessages = useCallback((messages: BattleMessage[]) => {
    if (messages.length === 0) {
      return;
    }
    setMessageQueue((prev) => [...prev, ...messages]);
  }, []);

  const handleMessageComplete = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }

    advanceTimerRef.current = setTimeout(() => {
      setIsMessageAnimating(false);
      setCurrentMessage(null);
      setPendingAutoAdvance(true);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  // HPゲージの色を計算
  const getHpColor = (hpRatio: number): string => {
    if (hpRatio > 0.7) return '#84cc16'; // 緑
    if (hpRatio > 0.2) return '#eab308'; // 黄色
    return '#ef4444'; // 赤
  };

  // クライアントサイドでバトルを初期化（最初の1回のみ）
  useEffect(() => {
    setBattleState(initBattle(params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    if (battleState && !initialMessageShownRef.current) {
      enqueueMessages([createMessage('system', 'バトルスタート！')]);
      initialMessageShownRef.current = true;
      selectRandomDialogue();
    }
  }, [battleState, enqueueMessages, selectRandomDialogue]);

  useEffect(() => {
    if (!isMessageAnimating && currentMessage === null) {
      if (messageQueue.length > 0) {
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = null;
        }
        const [next, ...rest] = messageQueue;
        setCurrentMessage(next);
        setMessageQueue(rest);
        setIsMessageAnimating(true);
        setPendingAutoAdvance(false);
      } else if (pendingAutoAdvance) {
        setPendingAutoAdvance(false);
        if (isProcessing) {
          setIsProcessing(false);
        }
        if (messageQueue.length === 0) {
          selectRandomDialogue();
        }
      }
    }
  }, [
    messageQueue,
    isMessageAnimating,
    currentMessage,
    pendingAutoAdvance,
    isProcessing,
    selectRandomDialogue,
  ]);

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

      // ターン処理を実行
      const newState = executePlayerAction(battleState, emotion, enemyEmotion);

      // 新しいコメントIDを記録
      const oldCommentIds = battleState.comments.map(c => c.id);
      const newCommentIds = newState.comments
        .filter(c => !oldCommentIds.includes(c.id))
        .map(c => c.id);
      setRecentCommentIds(newCommentIds);

      setBattleState(newState);

      const turnResult = newState.turnHistory[newState.turnHistory.length - 1];
      const turnMessages = buildTurnMessages(turnResult);
      const winnerMessage =
        newState.winner && WINNER_MESSAGE[newState.winner]
          ? [createMessage('system', WINNER_MESSAGE[newState.winner])]
          : [];

      enqueueMessages([...turnMessages, ...winnerMessage]);

      if (isBattleOver(newState)) {
        setShowActionButtons(false);
      }
    } catch (error) {
      console.error('Turn processing error:', error);
      setIsProcessing(false);
    }
  };

  // バトルエリアクリックで攻撃選択表示
  const handleBattleAreaClick = () => {
    if (
      !battleState ||
      isProcessing ||
      currentMessage !== null ||
      messageQueue.length > 0 ||
      showActionButtons ||
      isBattleOver(battleState)
    ) {
      return;
    }

    setShowActionButtons(true);
  };

  // バトルリスタート
  const handleRestart = () => {
    setBattleState(initBattle(params));
    setRecentCommentIds([]);
    setShowActionButtons(false);
    setSelectedEmotion(null);
    setMessageQueue([]);
    setCurrentMessage(null);
    setIsMessageAnimating(false);
    setPendingAutoAdvance(false);
    setIsProcessing(false);
    initialMessageShownRef.current = false;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    selectRandomDialogue();
  };

  const isTurnIdle =
    currentMessage === null && messageQueue.length === 0 && !isProcessing;

  const currentEnemyText =
    currentMessage?.speaker === 'enemy'
      ? currentMessage.text
      : isTurnIdle
      ? enemyDialogue
      : '';

  const currentPlayerText =
    currentMessage && currentMessage.speaker !== 'enemy'
      ? currentMessage.text
      : isTurnIdle
      ? playerDialogue
      : '';
  const isAwaitingNextAction =
    !!battleState &&
    !isProcessing &&
    !showActionButtons &&
    currentMessage === null &&
    messageQueue.length === 0 &&
    !isBattleOver(battleState);

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
                      key={
                        currentMessage?.speaker === 'enemy'
                          ? `enemy-${currentMessage.id}`
                          : `enemy-idle-${enemyDialogue}`
                      }
                      text={currentEnemyText}
                      className="text-white text-2xl text-center"
                      onComplete={currentMessage?.speaker === 'enemy' ? handleMessageComplete : undefined}
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
                      key={
                        currentMessage && currentMessage.speaker !== 'enemy'
                          ? `player-${currentMessage.id}`
                          : `player-idle-${playerDialogue}`
                      }
                      text={currentPlayerText}
                      className="text-white text-2xl text-center"
                      onComplete={
                        currentMessage && currentMessage.speaker !== 'enemy'
                          ? handleMessageComplete
                          : undefined
                      }
                    />
                  </div>
                  {/* 次へ進むアイコン */}
                  {isAwaitingNextAction && (
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
