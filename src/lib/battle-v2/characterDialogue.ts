/**
 * Character Dialogue System
 * Manages battle dialogues and conversations
 */

import {
  Dialogue,
  DialogueTrigger,
  DialogueState,
  BattleState,
  EmotionType,
} from './types';

// ========================================
// Sample Dialogues
// ========================================

/** サンプル会話データ */
const SAMPLE_DIALOGUES: Dialogue[] = [
  // バトル開始
  {
    trigger: 'battle_start',
    speaker: 'player',
    text: '勝負だ！私の感情を見せてやる！',
  },
  {
    trigger: 'battle_start',
    speaker: 'enemy',
    text: 'かかってきなさい…全力で相手をしてあげる。',
  },

  // ターン開始
  {
    trigger: 'turn_start',
    speaker: 'player',
    text: 'さあ、次はどう攻めるか…',
  },

  // 特殊効果発動
  {
    trigger: 'special_effect',
    speaker: 'player',
    text: '特殊効果が発動した！',
    emotion: 'rage',
  },
  {
    trigger: 'special_effect',
    speaker: 'player',
    text: '恐怖を与えてやる…',
    emotion: 'terror',
  },
  {
    trigger: 'special_effect',
    speaker: 'player',
    text: 'この悲しみが力に…',
    emotion: 'grief',
  },
  {
    trigger: 'special_effect',
    speaker: 'player',
    text: '至福の瞬間だ！',
    emotion: 'ecstasy',
  },

  // HP低下
  {
    trigger: 'low_hp',
    speaker: 'player',
    text: 'くっ…まだやれる！',
  },
  {
    trigger: 'low_hp',
    speaker: 'enemy',
    text: 'フフ…追い詰められているわね。',
  },

  // ファン率上昇
  {
    trigger: 'high_fan_rate',
    speaker: 'player',
    text: '観客が私を応援してくれている！',
  },

  // バトル終了
  {
    trigger: 'battle_end',
    speaker: 'player',
    text: 'やった！勝利だ！',
  },
  {
    trigger: 'battle_end',
    speaker: 'enemy',
    text: '負けた…でも、いい戦いだったわ。',
  },
];

// ========================================
// Dialogue State Management
// ========================================

/**
 * 会話状態を初期化
 * @returns 初期会話状態
 */
export function initDialogueState(): DialogueState {
  return {
    queue: [],
    current: null,
  };
}

/**
 * 会話をキューに追加
 * @param state 現在の会話状態
 * @param dialogue 追加する会話
 * @returns 更新された会話状態
 */
export function enqueueDialogue(
  state: DialogueState,
  dialogue: Dialogue
): DialogueState {
  return {
    ...state,
    queue: [...state.queue, dialogue],
  };
}

/**
 * キューから次の会話を取得して表示
 * @param state 現在の会話状態
 * @returns 更新された会話状態
 */
export function dequeueDialogue(state: DialogueState): DialogueState {
  if (state.queue.length === 0) {
    return {
      ...state,
      current: null,
    };
  }

  const [next, ...remaining] = state.queue;
  return {
    queue: remaining,
    current: next,
  };
}

/**
 * 現在の会話をクリア
 * @param state 現在の会話状態
 * @returns 更新された会話状態
 */
export function clearCurrentDialogue(state: DialogueState): DialogueState {
  return {
    ...state,
    current: null,
  };
}

// ========================================
// Dialogue Triggering
// ========================================

/**
 * トリガーに基づいて会話を取得
 * @param trigger トリガータイプ
 * @param speaker 話者
 * @param emotion 感情（オプション）
 * @returns マッチする会話の配列
 */
export function getDialoguesByTrigger(
  trigger: DialogueTrigger,
  speaker?: 'player' | 'enemy',
  emotion?: EmotionType
): Dialogue[] {
  return SAMPLE_DIALOGUES.filter((dialogue) => {
    // トリガーが一致
    if (dialogue.trigger !== trigger) return false;

    // 話者が指定されている場合はチェック
    if (speaker && dialogue.speaker !== speaker) return false;

    // 感情が指定されている場合はチェック
    if (emotion && dialogue.emotion && dialogue.emotion !== emotion) return false;

    return true;
  });
}

/**
 * バトル状態に基づいて会話をトリガー
 * @param battleState バトル状態
 * @param trigger トリガータイプ
 * @param emotion 感情（オプション）
 * @returns トリガーされた会話
 */
export function triggerDialogue(
  battleState: BattleState,
  trigger: DialogueTrigger,
  emotion?: EmotionType
): Dialogue | null {
  let dialogues: Dialogue[] = [];

  switch (trigger) {
    case 'battle_start':
      dialogues = getDialoguesByTrigger('battle_start');
      break;

    case 'turn_start':
      dialogues = getDialoguesByTrigger('turn_start');
      break;

    case 'special_effect':
      if (emotion) {
        dialogues = getDialoguesByTrigger('special_effect', 'player', emotion);
      }
      break;

    case 'low_hp':
      // プレイヤーのHPが30%以下
      if (battleState.player.hp / battleState.player.maxHp <= 0.3) {
        dialogues = getDialoguesByTrigger('low_hp', 'player');
      }
      // 敵のHPが30%以下
      if (battleState.enemy.hp / battleState.enemy.maxHp <= 0.3) {
        dialogues = [...dialogues, ...getDialoguesByTrigger('low_hp', 'enemy')];
      }
      break;

    case 'high_fan_rate':
      // ファン率が80%以上
      if (battleState.player.fanRate >= 0.8) {
        dialogues = getDialoguesByTrigger('high_fan_rate', 'player');
      }
      break;

    case 'battle_end':
      if (battleState.winner === 'player') {
        dialogues = getDialoguesByTrigger('battle_end', 'player');
      } else if (battleState.winner === 'enemy') {
        dialogues = getDialoguesByTrigger('battle_end', 'enemy');
      }
      break;
  }

  // ランダムに1つ選択
  if (dialogues.length > 0) {
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }

  return null;
}

// ========================================
// Dialogue Helpers
// ========================================

/**
 * 会話があるかチェック
 * @param state 会話状態
 * @returns 会話がある場合true
 */
export function hasDialogue(state: DialogueState): boolean {
  return state.current !== null || state.queue.length > 0;
}

/**
 * キューに残っている会話の数を取得
 * @param state 会話状態
 * @returns キューの長さ
 */
export function getQueueLength(state: DialogueState): number {
  return state.queue.length;
}

/**
 * 会話の表示名を取得
 * @param speaker 話者
 * @returns 表示名
 */
export function getSpeakerName(speaker: 'player' | 'enemy'): string {
  return speaker === 'player' ? 'プレイヤー' : '敵';
}
