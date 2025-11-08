'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { BattleState, EmotionType, TurnResult, SpecialEffect } from '@/lib/battle-v2/types';
import { initBattle, executePlayerAction, isBattleOver, checkWinner } from '@/lib/battle-v2/battleEngine';
import { decideEnemyAction } from '@/lib/battle-v2/aiSystem';
import { getEmotionName } from '@/lib/battle-v2/emotionSystem';
import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { CommentPool } from './CommentPool';
import { EmotionActionButtons } from './EmotionActionButtons';
import { TypewriterText } from './TypewriterText';
import { BattleResult } from './BattleResult';
import { SettingsMenu } from './SettingsMenu';
import { RulesModal } from './RulesModal';
import { ActiveEffectIcons } from './ActiveEffectIcons';
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
  apply?: () => void;
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

const RESULT_NARRATION: Record<'player' | 'enemy' | 'draw', string> = {
  player: '歓声がこだまする。勝利の光が視界を包んだ！',
  enemy: '視界が真っ暗になった…。力尽きて膝をつく。',
  draw: '互いに倒れ伏し、静寂だけが残った…。',
};

function createMessage(speaker: BattleMessageSpeaker, text: string, apply?: () => void): BattleMessage {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return { id, speaker, text, apply };
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

function buildEffectMessages(
  effects: TurnResult['specialEffects']['player'],
  target: 'player' | 'enemy',
  applyEffect?: (effect: SpecialEffect) => void
): BattleMessage[] {
  if (effects.length === 0) return [];

  const targetLabel = target === 'player' ? 'あなた' : '敵';

  return effects.map((effect) =>
    createMessage('system', `${targetLabel}に効果「${getEffectDescription(effect)}」が付与された！`, () => {
      applyEffect?.(effect);
    })
  );
}

function buildTurnMessages(
  result: TurnResult,
  handlers: {
    onPlayerBase: (amount: number) => void;
    onPlayerExtra: (amount: number) => void;
    onPlayerHeal: (amount: number) => void;
    onEnemyBase: (amount: number) => void;
    onEnemyExtra: (amount: number) => void;
    onEnemyHeal: (amount: number) => void;
    onPlayerEffect: (effect: SpecialEffect) => void;
    onEnemyEffect: (effect: SpecialEffect) => void;
  }
): BattleMessage[] {
  const messages: BattleMessage[] = [];

  const playerEmotionName = getEmotionName(result.playerAction);
  const enemyEmotionName = getEmotionName(result.enemyAction);
  const { damage, secondaryEffects, specialEffects } = result;
  const baseDamageToEnemy = Math.max(0, damage.toEnemy - damage.extraToEnemy);
  const baseDamageToPlayer = Math.max(0, damage.toPlayer - damage.extraToPlayer);

  messages.push(createMessage('system', JUDGEMENT_MESSAGE[result.judgement]));

  messages.push(
    createMessage(
      'player',
      `あなたは ${playerEmotionName} を繰り出した！${formatDamageText(baseDamageToEnemy, 'enemy')}`,
      () => handlers.onPlayerBase(baseDamageToEnemy)
    )
  );

  if (damage.extraToEnemy > 0) {
    messages.push(
      createMessage(
        'player',
        `追加攻撃が発動！${formatDamageText(damage.extraToEnemy, 'enemy')}`,
        () => handlers.onPlayerExtra(damage.extraToEnemy)
      )
    );
  }

  if (secondaryEffects.player.healing > 0) {
    messages.push(
      createMessage(
        'player',
        `あなたは ${secondaryEffects.player.healing} 回復した！`,
        () => handlers.onPlayerHeal(secondaryEffects.player.healing)
      )
    );
  }

  messages.push(
    createMessage(
      'enemy',
      `敵は ${enemyEmotionName} を繰り出した！${formatDamageText(baseDamageToPlayer, 'player')}`,
      () => handlers.onEnemyBase(baseDamageToPlayer)
    )
  );

  if (damage.extraToPlayer > 0) {
    messages.push(
      createMessage(
        'enemy',
        `敵の追撃！${formatDamageText(damage.extraToPlayer, 'player')}`,
        () => handlers.onEnemyExtra(damage.extraToPlayer)
      )
    );
  }

  if (secondaryEffects.enemy.healing > 0) {
    messages.push(
      createMessage(
        'enemy',
        `敵は ${secondaryEffects.enemy.healing} 回復した！`,
        () => handlers.onEnemyHeal(secondaryEffects.enemy.healing)
      )
    );
  }

  messages.push(
    ...buildEffectMessages(specialEffects.player, 'player', handlers.onPlayerEffect)
  );
  messages.push(
    ...buildEffectMessages(specialEffects.enemy, 'enemy', handlers.onEnemyEffect)
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
  const [showResult, setShowResult] = useState(false);

  // HP追跡用ref（setStateの非同期性に影響されない正確なHP）
  const accurateHpRef = useRef({ player: 100, enemy: 100 });

  // 画面スケーリング
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  const initialMessageShownRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<BattleState | null>(null);
  const pendingWinnerRef = useRef<'player' | 'enemy' | 'draw' | null>(null);

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
    if (currentMessage?.apply) {
      currentMessage.apply();
    }
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }

    advanceTimerRef.current = setTimeout(() => {
      setIsMessageAnimating(false);
      setCurrentMessage(null);
      setPendingAutoAdvance(true);
    }, 400);
  }, [currentMessage]);

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
    const initialState = initBattle(params);
    setBattleState(initialState);
    // HP追跡refも初期化
    accurateHpRef.current = {
      player: initialState.player.hp,
      enemy: initialState.enemy.hp,
    };
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

        if (pendingStateRef.current) {
          const finalState = pendingStateRef.current;

          // UI側のHP（apply関数で更新済み）をrefから取得
          const updatedState = {
            ...finalState,
            player: {
              ...finalState.player,
              hp: accurateHpRef.current.player,  // refの値を使用
            },
            enemy: {
              ...finalState.enemy,
              hp: accurateHpRef.current.enemy,  // refの値を使用
            },
          };

          // メッセージキュー完了後、refの正確なHPで勝敗判定
          const winner = checkWinner(updatedState);

          // 勝敗メッセージを追加（setBattleStateの外で実行）
          if (winner) {
            const resultMessages = [
              createMessage('system', WINNER_MESSAGE[winner]),
              createMessage('system', RESULT_NARRATION[winner]),
            ];
            setMessageQueue((prevQueue) => [...prevQueue, ...resultMessages]);
            pendingWinnerRef.current = winner;

            // 勝敗確定した状態を保存
            setBattleState({
              ...updatedState,
              isActive: false,
              winner,
            });
          } else {
            // 通常のstate更新
            setBattleState(updatedState);
          }

          pendingStateRef.current = null;

          // 勝敗メッセージがある場合、まだメッセージキューに残っているので処理は継続
          // 勝敗メッセージが完了したら、次回のpendingAutoAdvanceでshowResultを表示
          if (!pendingWinnerRef.current) {
            setIsProcessing(false);
            selectRandomDialogue();
          }
        } else if (pendingWinnerRef.current) {
          // 勝敗メッセージも全て完了したので、結果画面を表示
          setIsProcessing(false);
          setShowResult(true);
          pendingWinnerRef.current = null;
        } else {
          setIsProcessing(false);
          if (!showResult) {
            selectRandomDialogue();
          }
        }
      }
    }
  }, [
    messageQueue,
    isMessageAnimating,
    currentMessage,
    pendingAutoAdvance,
    selectRandomDialogue,
    showResult,
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
    setBattleState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: prev.comments.filter((c) => c.emotion !== emotion),
      };
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

      pendingStateRef.current = newState;

      const turnResult = newState.turnHistory[newState.turnHistory.length - 1];

      const applyPlayerBaseDamage = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.max(0, prev.enemy.hp - amount);
          accurateHpRef.current.enemy = nextHp;  // refも更新
          return {
            ...prev,
            enemy: { ...prev.enemy, hp: nextHp },
          };
        });
      };

      const applyPlayerExtraDamage = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.max(0, prev.enemy.hp - amount);
          accurateHpRef.current.enemy = nextHp;  // refも更新
          return {
            ...prev,
            enemy: { ...prev.enemy, hp: nextHp },
          };
        });
      };

      const applyPlayerHealing = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.min(prev.player.maxHp, prev.player.hp + amount);
          accurateHpRef.current.player = nextHp;  // refも更新
          return {
            ...prev,
            player: { ...prev.player, hp: nextHp },
          };
        });
      };

      const applyEnemyBaseDamage = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.max(0, prev.player.hp - amount);
          accurateHpRef.current.player = nextHp;  // refも更新
          return {
            ...prev,
            player: { ...prev.player, hp: nextHp },
          };
        });
      };

      const applyEnemyExtraDamage = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.max(0, prev.player.hp - amount);
          accurateHpRef.current.player = nextHp;  // refも更新
          return {
            ...prev,
            player: { ...prev.player, hp: nextHp },
          };
        });
      };

      const applyEnemyHealing = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.min(prev.enemy.maxHp, prev.enemy.hp + amount);
          accurateHpRef.current.enemy = nextHp;  // refも更新
          return {
            ...prev,
            enemy: { ...prev.enemy, hp: nextHp },
          };
        });
      };

      const applyEffect = (effect: SpecialEffect) => {
        setBattleState((prev) => {
          if (!prev) return prev;
          if (effect.target === 'player') {
            return {
              ...prev,
              player: {
                ...prev.player,
                activeEffects: [...prev.player.activeEffects, effect],
              },
            };
          }
          return {
            ...prev,
            enemy: {
              ...prev.enemy,
              activeEffects: [...prev.enemy.activeEffects, effect],
            },
          };
        });
      };

      const turnMessages = buildTurnMessages(turnResult, {
        onPlayerBase: applyPlayerBaseDamage,
        onPlayerExtra: applyPlayerExtraDamage,
        onPlayerHeal: applyPlayerHealing,
        onEnemyBase: applyEnemyBaseDamage,
        onEnemyExtra: applyEnemyExtraDamage,
        onEnemyHeal: applyEnemyHealing,
        onPlayerEffect: applyEffect,
        onEnemyEffect: applyEffect,
      });
      // ロジック側の勝敗判定は無視し、UI側のHP（apply関数で更新）で判定する
      // 勝敗判定はメッセージキュー完了後に実行
      pendingWinnerRef.current = null;

      enqueueMessages([...turnMessages]);
    } catch (error) {
      console.error('Turn processing error:', error);
      setIsProcessing(false);
      pendingStateRef.current = null;
      pendingWinnerRef.current = null;
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
    const initialState = initBattle(params);
    setBattleState(initialState);
    // HP追跡refも初期化
    accurateHpRef.current = {
      player: initialState.player.hp,
      enemy: initialState.enemy.hp,
    };
    setRecentCommentIds([]);
    setShowActionButtons(false);
    setSelectedEmotion(null);
    setMessageQueue([]);
    setCurrentMessage(null);
    setIsMessageAnimating(false);
    setPendingAutoAdvance(false);
    setIsProcessing(false);
    pendingWinnerRef.current = null;
    pendingStateRef.current = null;
    setShowResult(false);
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
              className="absolute top-[-4px] left-0 w-[1200px] h-[800px] border-4 border-white cursor-pointer bg-black"
              onClick={handleBattleAreaClick}
            >
              {/* キャラクター配置エリア */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-[-80px] w-[760px] h-[760px] -translate-y-[35%]">
                  <img
                    src="/images/player-placeholder.jpg"
                    alt="Player stand-in"
                    className="h-full w-full rounded-3xl object-cover"
                  />
                </div>
                <div className="absolute top-1/2 right-[-120px] w-[760px] h-[760px] -translate-y-[35%]">
                  <img
                    src="/images/enemy-placeholder.jpg"
                    alt="Enemy stand-in"
                    className="h-full w-full rounded-3xl object-cover"
                  />
                </div>
              </div>

              {/* 中央：バトル画面 */}
              <div className="absolute top-[120px] left-0 right-0 bottom-[120px] z-10">
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

                {/* 右上：敵HPゲージ */}
                <div className="absolute top-3 right-12 w-[300px]">
                  <div className="relative h-7 bg-gray-800 border-2 border-white rounded">
                    <div
                      className="absolute top-0 left-0 h-full rounded transition-all duration-300"
                      style={{
                        width: `${(battleState.enemy.hp / battleState.enemy.maxHp) * 100}%`,
                        backgroundColor: getHpColor(battleState.enemy.hp / battleState.enemy.maxHp)
                      }}
                    />
                  </div>
                  <div className="mt-1">
                    <ActiveEffectIcons effects={battleState.enemy.activeEffects} />
                  </div>
                </div>

                {/* 左下：プレイヤーHPゲージ */}
                <div className="absolute bottom-3 left-12 w-[300px]">
                  <ActiveEffectIcons effects={battleState.player.activeEffects} />
                  <div className="relative mt-1 h-7 bg-gray-800 border-2 border-white rounded">
                    <div
                      className="absolute top-0 left-0 h-full rounded transition-all duration-300"
                      style={{
                        width: `${(battleState.player.hp / battleState.player.maxHp) * 100}%`,
                        backgroundColor: getHpColor(battleState.player.hp / battleState.player.maxHp)
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
                      enableColors={!!currentMessage}
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
                      enableColors={!!currentMessage}
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
            {showResult && battleState.winner && (
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
