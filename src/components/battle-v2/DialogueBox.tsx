'use client';

import { Dialogue } from '@/lib/battle-v2/types';
import { getSpeakerName } from '@/lib/battle-v2/characterDialogue';

interface DialogueBoxProps {
  dialogue: Dialogue | null;
  onNext?: () => void; // 次の会話へ進むコールバック
}

export function DialogueBox({ dialogue, onNext }: DialogueBoxProps) {
  if (!dialogue) {
    return null;
  }

  const speakerName = getSpeakerName(dialogue.speaker);
  const isPlayer = dialogue.speaker === 'player';

  return (
    <div className="fixed bottom-8 left-1/2 z-50 w-[min(800px,90vw)] -translate-x-1/2">
      <div
        className={`flex flex-col gap-2 rounded-2xl p-6 backdrop-blur-md shadow-2xl border-2 transition-all ${
          isPlayer
            ? 'bg-blue-900/80 border-blue-400/50'
            : 'bg-red-900/80 border-red-400/50'
        }`}
      >
        {/* 話者名 */}
        <div
          className={`inline-flex self-start rounded-full px-4 py-1 text-sm font-bold ${
            isPlayer
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {speakerName}
        </div>

        {/* 会話テキスト */}
        <div className="text-lg text-white leading-relaxed">
          {dialogue.text}
        </div>

        {/* 次へボタン */}
        {onNext && (
          <button
            onClick={onNext}
            className="mt-2 self-end rounded-lg bg-white/20 px-4 py-2 text-sm text-white transition-all hover:bg-white/30 active:scale-95"
          >
            次へ ▶
          </button>
        )}
      </div>
    </div>
  );
}
