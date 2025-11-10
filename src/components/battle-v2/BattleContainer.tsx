'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { BattleState, EmotionType, TurnResult, SpecialEffect, CommentConversionEvent, SkillUsageMap, Comment } from '@/lib/battle-v2/types';
import { initBattle, executePlayerAction, executeSuperchatTurn, isBattleOver, checkWinner } from '@/lib/battle-v2/battleEngine';
import { decideEnemyAction } from '@/lib/battle-v2/aiSystem';
import { getEmotionName, getEmotionColor } from '@/lib/battle-v2/emotionSystem';
import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { CommentPool } from './CommentPool';
import { EmotionActionButtons } from './EmotionActionButtons';
import { TypewriterText } from './TypewriterText';
import { BattleResult } from './BattleResult';
import { SettingsMenu } from './SettingsMenu';
import { RulesModal } from './RulesModal';
import { ActiveEffectIcons } from './ActiveEffectIcons';
import { getEffectDescription } from '@/lib/battle-v2/specialEffects';
import { BuffDebuffEffect } from './BuffDebuffEffect';
import { HealingEffect } from './HealingEffect';
import { getVariantDefinition, DEFAULT_VARIANTS } from '@/lib/battle-v2/actionVariants';

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
  'そんなの全然効いてないんだから！',
  'まだまだこれからなんだからね！',
  'ちょっと本気出しちゃおうかな！',
  '次はもっと派手にいくよ！',
  'みんなが見てるんだから、負けられないもん！',
];

const EMPTY_SKILL_USES: SkillUsageMap = {
  rage: 0,
  terror: 0,
  grief: 0,
  ecstasy: 0,
};

type BattleMessageSpeaker = 'player' | 'enemy' | 'system';

interface BattleMessage {
  id: string;
  speaker: BattleMessageSpeaker;
  text: string;
  apply?: () => void;
}

interface EffectAnimation {
  id: string;
  type: 'buff' | 'debuff' | 'regen';
  target: 'player' | 'enemy';
  timestamp: number;
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

const formatDamageText = (amount: number, target: 'enemy' | 'player'): string => {
  if (amount <= 0) return '';
  return target === 'enemy'
    ? `敵に ${amount} のダメージ！`
    : `あなたは ${amount} のダメージを受けた！`;
};

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
    onPlayerPoison?: (amount: number) => void;
    onPlayerCurse?: (amount: number) => void;
    onPlayerRegen?: (amount: number) => void;
    onPlayerSelfDamage?: (amount: number) => void;
    onEnemyBase: (amount: number) => void;
    onEnemyExtra: (amount: number) => void;
    onEnemyHeal: (amount: number) => void;
    onEnemyPoison?: (amount: number) => void;
    onEnemyCurse?: (amount: number) => void;
    onEnemyRegen?: (amount: number) => void;
    onEnemySelfDamage?: (amount: number) => void;
    onPlayerEffect: (effect: SpecialEffect) => void;
    onEnemyEffect: (effect: SpecialEffect) => void;
    onCommentConversion?: (conversion: CommentConversionEvent) => void;
    onCommentRefresh?: (nextComments: Comment[]) => void;
  },
  options: {
    playerSkillName: string;
    enemySkillName: string;
    playerEmotion: EmotionType;
    enemyEmotion: EmotionType;
    isSuperchatTurn?: boolean;
  }
): BattleMessage[] {
  const messages: BattleMessage[] = [];

  const playerEmotionName = getEmotionName(result.playerAction);
  const enemyEmotionName = getEmotionName(result.enemyAction);
  const { playerSkillName, enemySkillName, playerEmotion, enemyEmotion, isSuperchatTurn = false } = options;
  const playerColor = getEmotionColor(playerEmotion);
  const enemyColor = getEmotionColor(enemyEmotion);
  const { damage, secondaryEffects, specialEffects } = result;
  const baseDamageToEnemy = Math.max(0, damage.toEnemy - damage.extraToEnemy);
  const baseDamageToPlayer = Math.max(0, damage.toPlayer - damage.extraToPlayer);

  messages.push(createMessage('system', JUDGEMENT_MESSAGE[result.judgement]));
  if (isSuperchatTurn) {
    messages.push(createMessage('system', 'スパチャ追撃ターン！'));
  }

  const playerDamageText = formatDamageText(baseDamageToEnemy, 'enemy');
  const playerOpening =
    playerSkillName.length > 0
      ? `あなたは <span style="color: ${playerColor}; font-weight: bold;">${playerSkillName}</span> を発動！`
      : `あなたは ${playerEmotionName} を繰り出した！`;
  const playerMessageText = playerDamageText
    ? `${playerOpening} ${playerDamageText}`
    : playerOpening;

  messages.push(
    createMessage('player', playerMessageText, () => {
      if (baseDamageToEnemy > 0) {
        handlers.onPlayerBase(baseDamageToEnemy);
      }
    })
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

  if (result.cleansed) {
    messages.push(createMessage('system', 'デバフが全て解除された！'));
  }

  if (secondaryEffects.player.selfDamage > 0) {
    messages.push(
      createMessage(
        'system',
        `代償で ${secondaryEffects.player.selfDamage} のダメージを受けた！`,
        () => handlers.onPlayerSelfDamage?.(secondaryEffects.player.selfDamage)
      )
    );
  }

  const enemyDamageText = formatDamageText(baseDamageToPlayer, 'player');
  const enemyOpening =
    enemySkillName.length > 0
      ? `敵は <span style="color: ${enemyColor}; font-weight: bold;">${enemySkillName}</span> を発動！`
      : `敵は ${enemyEmotionName} を繰り出した！`;
  const enemyMessageText = enemyDamageText
    ? `${enemyOpening} ${enemyDamageText}`
    : enemyOpening;

  if (!isSuperchatTurn) {
    messages.push(
      createMessage('enemy', enemyMessageText, () => {
        if (baseDamageToPlayer > 0) {
          handlers.onEnemyBase(baseDamageToPlayer);
        }
      })
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
  }

  // 毒ダメージのメッセージ
  if (secondaryEffects.player.poisonDamage > 0) {
    messages.push(
      createMessage(
        'system',
        `あなたは毒で ${secondaryEffects.player.poisonDamage} のダメージを受けた！`,
        () => handlers.onPlayerPoison?.(secondaryEffects.player.poisonDamage)
      )
    );
  }

  if (!isSuperchatTurn && secondaryEffects.enemy.poisonDamage > 0) {
    messages.push(
      createMessage(
        'system',
        `敵は毒で ${secondaryEffects.enemy.poisonDamage} のダメージを受けた！`,
        () => handlers.onEnemyPoison?.(secondaryEffects.enemy.poisonDamage)
      )
    );
  }

  // 呪いダメージのメッセージ
  if (secondaryEffects.player.curseDamage > 0) {
    messages.push(
      createMessage(
        'system',
        `あなたは呪いで ${secondaryEffects.player.curseDamage} のダメージを受けた！`,
        () => handlers.onPlayerCurse?.(secondaryEffects.player.curseDamage)
      )
    );
  }

  if (!isSuperchatTurn && secondaryEffects.enemy.curseDamage > 0) {
    messages.push(
      createMessage(
        'system',
        `敵は呪いで ${secondaryEffects.enemy.curseDamage} のダメージを受けた！`,
        () => handlers.onEnemyCurse?.(secondaryEffects.enemy.curseDamage)
      )
    );
  }

  // リジェネ回復のメッセージ
  if (secondaryEffects.player.regenHealing > 0) {
    messages.push(
      createMessage(
        'system',
        `あなたはリジェネで ${secondaryEffects.player.regenHealing} 回復した！`,
        () => handlers.onPlayerRegen?.(secondaryEffects.player.regenHealing)
      )
    );
  }

  if (!isSuperchatTurn && secondaryEffects.enemy.regenHealing > 0) {
    messages.push(
      createMessage(
        'system',
        `敵はリジェネで ${secondaryEffects.enemy.regenHealing} 回復した！`,
        () => handlers.onEnemyRegen?.(secondaryEffects.enemy.regenHealing)
      )
    );
  }

  if (result.superchatAwarded) {
    messages.push(createMessage('system', 'スパチャの力で追撃ターンを獲得した！'));
  }

  if (result.commentConversions && result.commentConversions.length > 0) {
    result.commentConversions.forEach((conversion) => {
      const targetLabel = conversion.target === 'player' ? 'あなた' : '敵';
      const emotionName = getEmotionName(conversion.emotion);
      messages.push(
        createMessage(
          'system',
          `${targetLabel}のコメントが先に真っ赤（${emotionName}）に${conversion.count}件変換される！`,
          () => handlers.onCommentConversion?.(conversion)
        )
      );
    });
  }

  messages.push(
    ...buildEffectMessages(specialEffects.player, 'player', handlers.onPlayerEffect)
  );

  if (result.commentBoostApplied && result.commentBoostApplied > 0) {
    messages.push(
      createMessage(
        'system',
        `コメント追加量が+${result.commentBoostApplied}増加した！（現在+${result.currentCommentBoost}）`
      )
    );
  }

  if (result.commentRefresh && result.commentRefresh.count > 0) {
    const limited =
      result.commentRefresh &&
      'limitedEmotions' in result.commentRefresh &&
      result.commentRefresh.limitedEmotions &&
      result.commentRefresh.limitedEmotions.length > 0
        ? `（${result.commentRefresh.limitedEmotions.map((emotion) => getEmotionName(emotion)).join(' / ')}のみ）`
        : '';
    messages.push(
      createMessage(
        'system',
        `コメントがシャッフルされ、${result.commentRefresh.count}件が再配置された！${limited}`,
        () => handlers.onCommentRefresh?.(result.commentRefresh!.comments)
      )
    );
  }

  if (result.commentVictory) {
    const text =
      result.commentVictory === 'both'
        ? 'コメントが枯れ、双方が倒れた！'
        : result.commentVictory === 'player'
          ? 'コメントが枯れ、敵が倒れた！'
          : 'コメントが枯れ、あなたが倒れた！';
    const applyVictoryDamage = () => {
      const fatal = 9999;
      if (result.commentVictory === 'player' || result.commentVictory === 'both') {
        handlers.onPlayerBase(fatal);
      }
      if (result.commentVictory === 'enemy' || result.commentVictory === 'both') {
        handlers.onEnemyBase(fatal);
      }
    };
    messages.push(createMessage('system', text, applyVictoryDamage));
  }

  messages.push(
    ...buildEffectMessages(specialEffects.enemy, 'enemy', handlers.onEnemyEffect)
  );

  if (secondaryEffects.enemy.selfDamage > 0) {
    messages.push(
      createMessage(
        'system',
        `敵は代償で ${secondaryEffects.enemy.selfDamage} のダメージを受けた！`,
        () => handlers.onEnemySelfDamage?.(secondaryEffects.enemy.selfDamage)
      )
    );
  }

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
  const [effectAnimations, setEffectAnimations] = useState<EffectAnimation[]>([]);
  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerBounce, setPlayerBounce] = useState(false);
  const [enemyBounce, setEnemyBounce] = useState(false);
  const [playerVanishing, setPlayerVanishing] = useState(false);
  const [enemyVanishing, setEnemyVanishing] = useState(false);
  const [playerInvisible, setPlayerInvisible] = useState(false);
  const [enemyInvisible, setEnemyInvisible] = useState(false);

  // HP追跡用ref（setStateの非同期性に影響されない正確なHP）
  const accurateHpRef = useRef({ player: 100, enemy: 100 });
  const playerHpRef = useRef<number | null>(null);
  const enemyHpRef = useRef<number | null>(null);

  // 画面スケーリング
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  const initialMessageShownRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<BattleState | null>(null);
  const pendingWinnerRef = useRef<'player' | 'enemy' | 'draw' | null>(null);
  const playerShakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyShakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerBounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyBounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerVanishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyVanishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEffectComplete = useCallback((id: string) => {
    setEffectAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

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
      if (playerShakeTimerRef.current) {
        clearTimeout(playerShakeTimerRef.current);
      }
      if (enemyShakeTimerRef.current) {
        clearTimeout(enemyShakeTimerRef.current);
      }
      if (playerBounceTimerRef.current) {
        clearTimeout(playerBounceTimerRef.current);
      }
      if (enemyBounceTimerRef.current) {
        clearTimeout(enemyBounceTimerRef.current);
      }
      if (playerVanishTimerRef.current) {
        clearTimeout(playerVanishTimerRef.current);
      }
      if (enemyVanishTimerRef.current) {
        clearTimeout(enemyVanishTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (battleState?.pendingSuperchatTurn && !isProcessing && !showActionButtons) {
      setShowActionButtons(true);
      setSelectedEmotion(null);
    }
  }, [battleState?.pendingSuperchatTurn, isProcessing, showActionButtons]);

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
    playerHpRef.current = initialState.player.hp;
    enemyHpRef.current = initialState.enemy.hp;
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
    if (!battleState) return;
    const currentPlayerHp = battleState.player.hp;
    if (playerHpRef.current !== null && currentPlayerHp < playerHpRef.current) {
      if (playerShakeTimerRef.current) {
        clearTimeout(playerShakeTimerRef.current);
      }
      setPlayerShake(true);
      playerShakeTimerRef.current = setTimeout(() => {
        setPlayerShake(false);
      }, 400);
    }
    playerHpRef.current = currentPlayerHp;
  }, [battleState?.player.hp, battleState]);

  useEffect(() => {
    if (!battleState) return;
    const currentEnemyHp = battleState.enemy.hp;
    if (enemyHpRef.current !== null && currentEnemyHp < enemyHpRef.current) {
      if (enemyShakeTimerRef.current) {
        clearTimeout(enemyShakeTimerRef.current);
      }
      setEnemyShake(true);
      enemyShakeTimerRef.current = setTimeout(() => {
        setEnemyShake(false);
      }, 400);
    }
    enemyHpRef.current = currentEnemyHp;
  }, [battleState?.enemy.hp, battleState]);

  useEffect(() => {
    if (!battleState) return;
    const defeated = battleState.player.hp <= 0;
    if (defeated) {
      if (!playerVanishing) {
        setPlayerVanishing(true);
        setPlayerInvisible(false);
        if (playerVanishTimerRef.current) {
          clearTimeout(playerVanishTimerRef.current);
        }
        playerVanishTimerRef.current = setTimeout(() => {
          setPlayerInvisible(true);
        }, 900);
      }
    } else {
      setPlayerVanishing(false);
      setPlayerInvisible(false);
      if (playerVanishTimerRef.current) {
        clearTimeout(playerVanishTimerRef.current);
        playerVanishTimerRef.current = null;
      }
    }
  }, [battleState?.player.hp, playerVanishing, battleState]);

  useEffect(() => {
    if (!battleState) return;
    const defeated = battleState.enemy.hp <= 0;
    if (defeated) {
      if (!enemyVanishing) {
        setEnemyVanishing(true);
        setEnemyInvisible(false);
        if (enemyVanishTimerRef.current) {
          clearTimeout(enemyVanishTimerRef.current);
        }
        enemyVanishTimerRef.current = setTimeout(() => {
          setEnemyInvisible(true);
        }, 900);
      }
    } else {
      setEnemyVanishing(false);
      setEnemyInvisible(false);
      if (enemyVanishTimerRef.current) {
        clearTimeout(enemyVanishTimerRef.current);
        enemyVanishTimerRef.current = null;
      }
    }
  }, [battleState?.enemy.hp, enemyVanishing, battleState]);

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

  const triggerPlayerBounce = useCallback(() => {
    if (playerBounceTimerRef.current) {
      clearTimeout(playerBounceTimerRef.current);
    }
    setPlayerBounce(true);
    playerBounceTimerRef.current = setTimeout(() => {
      setPlayerBounce(false);
    }, 450);
  }, []);

  const triggerEnemyBounce = useCallback(() => {
    if (enemyBounceTimerRef.current) {
      clearTimeout(enemyBounceTimerRef.current);
    }
    setEnemyBounce(true);
    enemyBounceTimerRef.current = setTimeout(() => {
      setEnemyBounce(false);
    }, 450);
  }, []);

  // プレイヤーアクション処理
  const handleEmotionClick = async (emotion: EmotionType) => {
    if (!battleState || isProcessing || isBattleOver(battleState)) return;
    const remainingUses = battleState.skillUses.player[emotion] ?? 0;
    if (remainingUses <= 0) return;
    const isSuperchatMode = battleState.pendingSuperchatTurn;
    if (battleState.skillUses.player[emotion] <= 0) return;

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
        comments: prev.comments.filter((c) => !(c.isSuperchat || c.emotion === emotion)),
      };
    });

    try {
      const enemyEmotion = isSuperchatMode ? null : decideEnemyAction(battleState, 'normal');

      // ターン処理を実行
      const newState = isSuperchatMode
        ? executeSuperchatTurn(battleState, emotion)
        : executePlayerAction(battleState, emotion, enemyEmotion!);

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
        triggerPlayerBounce();
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
        triggerEnemyBounce();
      };

      const applyPlayerPoisonDamage = (amount: number) => {
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

      const applyEnemyPoisonDamage = (amount: number) => {
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

      const applyPlayerCurseDamage = (amount: number) => {
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

      const applyEnemyCurseDamage = (amount: number) => {
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

      const applyPlayerSelfDamage = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.max(0, prev.player.hp - amount);
          accurateHpRef.current.player = nextHp;
          return {
            ...prev,
            player: { ...prev.player, hp: nextHp },
          };
        });
      };

      const applyEnemySelfDamage = (amount: number) => {
        if (amount <= 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          const nextHp = Math.max(0, prev.enemy.hp - amount);
          accurateHpRef.current.enemy = nextHp;
          return {
            ...prev,
            enemy: { ...prev.enemy, hp: nextHp },
          };
        });
      };

      const applyPlayerRegenHealing = (amount: number) => {
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
        triggerPlayerBounce();
      };

      const applyEnemyRegenHealing = (amount: number) => {
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
        triggerEnemyBounce();
      };

      const applyPlayerEffect = (effect: SpecialEffect) => {
        // エフェクトアニメーションをトリガー
        const effectType = resolveEffectAnimationType(effect);
        const newAnimation: EffectAnimation = {
          id: `player-${effectType}-${Date.now()}`,
          type: effectType,
          target: 'player',
          timestamp: Date.now(),
        };
        setEffectAnimations(prev => [...prev, newAnimation]);

        setBattleState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            player: {
              ...prev.player,
              activeEffects: [...prev.player.activeEffects, effect],
            },
          };
        });
      };

      const applyEnemyEffect = (effect: SpecialEffect) => {
        // エフェクトアニメーションをトリガー
        const effectType = resolveEffectAnimationType(effect);
        const newAnimation: EffectAnimation = {
          id: `enemy-${effectType}-${Date.now()}`,
          type: effectType,
          target: 'enemy',
          timestamp: Date.now(),
        };
        setEffectAnimations(prev => [...prev, newAnimation]);

        setBattleState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            enemy: {
              ...prev.enemy,
              activeEffects: [...prev.enemy.activeEffects, effect],
            },
          };
        });
      };

      const applyCommentConversion = (conversion: CommentConversionEvent) => {
        if (!conversion || conversion.count === 0) return;
        const targetIds = new Set(conversion.commentIds);
        setBattleState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments.map((comment) =>
              targetIds.has(comment.id) && !comment.isSuperchat
                ? { ...comment, emotion: conversion.emotion }
                : comment
            ),
          };
        });
      };

      const applyCommentRefresh = (nextComments: Comment[]) => {
        if (!nextComments || nextComments.length === 0) return;
        setBattleState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: nextComments.map((comment) => ({ ...comment })),
          };
        });
      };

      const playerVariantId = battleState.config.selectedActionVariants[emotion];
      const playerSkillName = getVariantDefinition(emotion, playerVariantId)?.nameJa ?? getEmotionName(emotion);
      const actualEnemyEmotion = enemyEmotion ?? turnResult.enemyAction;
      const enemyVariantId = DEFAULT_VARIANTS[actualEnemyEmotion];
      const enemySkillName =
        getVariantDefinition(actualEnemyEmotion, enemyVariantId)?.nameJa ?? getEmotionName(actualEnemyEmotion);

      const turnMessages = buildTurnMessages(
        turnResult,
        {
          onPlayerBase: applyPlayerBaseDamage,
          onPlayerExtra: applyPlayerExtraDamage,
          onPlayerHeal: applyPlayerHealing,
          onPlayerPoison: applyPlayerPoisonDamage,
          onPlayerCurse: applyPlayerCurseDamage,
          onPlayerRegen: applyPlayerRegenHealing,
          onPlayerSelfDamage: applyPlayerSelfDamage,
          onEnemyBase: applyEnemyBaseDamage,
          onEnemyExtra: applyEnemyExtraDamage,
          onEnemyHeal: applyEnemyHealing,
          onEnemyPoison: applyEnemyPoisonDamage,
          onEnemyCurse: applyEnemyCurseDamage,
          onEnemyRegen: applyEnemyRegenHealing,
          onEnemySelfDamage: applyEnemySelfDamage,
          onPlayerEffect: applyPlayerEffect,
          onEnemyEffect: applyEnemyEffect,
          onCommentConversion: applyCommentConversion,
          onCommentRefresh: applyCommentRefresh,
        },
        {
          playerSkillName,
          enemySkillName,
          playerEmotion: emotion,
          enemyEmotion: actualEnemyEmotion,
          isSuperchatTurn: isSuperchatMode,
        }
      );
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
    if (playerVanishTimerRef.current) {
      clearTimeout(playerVanishTimerRef.current);
      playerVanishTimerRef.current = null;
    }
    if (enemyVanishTimerRef.current) {
      clearTimeout(enemyVanishTimerRef.current);
      enemyVanishTimerRef.current = null;
    }
    setPlayerVanishing(false);
    setEnemyVanishing(false);
    setPlayerInvisible(false);
    setEnemyInvisible(false);
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

  const fanGaugeSegments = battleState
    ? [
        {
          key: 'enemy',
          color: '#22d3ee',
          height: battleState.audience.enemyFans * 100,
        },
        {
          key: 'neutral',
          color: '#9ca3af',
          height: battleState.audience.neutralFans * 100,
        },
        {
          key: 'player',
          color: '#ec4899',
          height: battleState.audience.playerFans * 100,
        },
      ]
    : [];

  // 初期化中はローディング表示
  if (!battleState) {
    return (
      <main className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </main>
    );
  }

  const isSuperchatMode = battleState.pendingSuperchatTurn;

  return (
    <main className="h-screen w-screen bg-black flex items-center justify-center">
      {/* スケーリングコンテナ */}
      <div style={stageWrapperStyle}>
        <div style={stageStyle}>
          {/* 16:9固定レイアウト */}
          <div className="relative w-full h-full bg-black">
            {/* バトルエリア */}
            <div
              className={`absolute top-[-4px] left-0 w-[1200px] h-[800px] border-4 cursor-pointer bg-[url(/images/battle-background.jpg)] bg-cover bg-center transition-all duration-500 ${
                isSuperchatMode ? 'border-emerald-100 shadow-[0_0_80px_rgba(16,185,129,0.95)]' : 'border-white shadow-none'
              }`}
              onClick={handleBattleAreaClick}
            >
              <div
                className={`absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-200/70 via-transparent to-cyan-300/70 mix-blend-screen transition-all duration-500 ${
                  isSuperchatMode ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-95'
                }`}
              />
              <div
                className={`absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.55),_transparent_55%)] transition-all duration-500 ${
                  isSuperchatMode ? 'opacity-90 animate-pulse' : 'opacity-0'
                }`}
              />
              <div
                className={`absolute inset-0 pointer-events-none mix-blend-screen bg-gradient-to-tr from-pink-400/25 via-transparent to-blue-400/25 transition-all duration-500 ${
                  isSuperchatMode ? 'opacity-100 animate-pulse-slow' : 'opacity-0'
                }`}
              />
              {/* キャラクター配置エリア */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-[-250px] w-[1020px] h-[1020px] -translate-y-[31%]">
                  <img
                    src="/images/player-placeholder.png"
                    alt="Player stand-in"
                    className={`h-full w-full rounded-3xl object-cover ${playerShake ? 'hit-shake' : ''} ${playerBounce ? 'heal-bounce' : ''} ${playerVanishing ? 'vanish-out' : ''} ${playerInvisible ? 'opacity-0 pointer-events-none' : ''}`}
                  />
                </div>
                <div className="absolute top-1/2 right-[-240px] w-[1020px] h-[1020px] -translate-y-[27%]">
                  <img
                    src="/images/enemy-placeholder.png"
                    alt="Enemy stand-in"
                    className={`h-full w-full rounded-3xl object-cover ${enemyShake ? 'hit-shake' : ''} ${enemyBounce ? 'heal-bounce' : ''} ${enemyVanishing ? 'vanish-out' : ''} ${enemyInvisible ? 'opacity-0 pointer-events-none' : ''}`}
                  />
                </div>
              </div>

              {/* エフェクトレイヤー */}
              <div className="absolute inset-0 z-5 pointer-events-none overflow-visible">
                {effectAnimations.map((anim) => {
                  // キャラクターの位置に合わせて配置
                  const isPlayer = anim.target === 'player';
                  const left = isPlayer ? '30%' : '70%';

                  return (
                    <div
                      key={anim.id}
                      className="absolute overflow-visible"
                      style={{
                        left: left,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        height: '400px',
                      }}
                    >
                      {anim.type === 'regen' ? (
                        <HealingEffect target={anim.target} onComplete={() => handleEffectComplete(anim.id)} />
                      ) : (
                        <BuffDebuffEffect
                          type={anim.type}
                          target={anim.target}
                          onComplete={() => handleEffectComplete(anim.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 中央：バトル画面 */}
              <div className="absolute top-[120px] left-0 right-0 bottom-[120px] z-10">
                {/* バトル画面 */}

                {/* 中央ファンゲージ */}
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                  <div className="relative w-[56px] h-[140%]">
                    <div className="absolute inset-0 rotate-[-15deg] rounded-lg border-2 border-white bg-black/50 shadow-[0_0_30px_rgba(0,0,0,0.45)] overflow-hidden">
                      <div className="absolute inset-0 flex flex-col">
                        {fanGaugeSegments.map((segment) => (
                          <div
                            key={segment.key}
                            className="w-full"
                            style={{
                              height: `${segment.height}%`,
                              backgroundColor: segment.color,
                              transition: 'height 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/5 mix-blend-screen" />
                    </div>
                    <div className="absolute inset-0 rotate-[-15deg] pointer-events-none">
                      <div className="absolute inset-[2px] border border-white/40 rounded-lg" />
                    </div>
                  </div>
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
                      stroke="#22d3ee"
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
                      stroke="#ec4899"
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
                        <path d="M7 10L12 15L17 10" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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
                    selectedEmotion={selectedEmotion}
                    selectedVariants={battleState.config.selectedActionVariants}
                    remainingUses={battleState ? battleState.skillUses.player : EMPTY_SKILL_USES}
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
const resolveEffectAnimationType = (effect: SpecialEffect): EffectAnimation['type'] => {
  if (effect.type === 'buff') return 'buff';
  if (effect.type === 'regen') return 'regen';
  return 'debuff';
};
