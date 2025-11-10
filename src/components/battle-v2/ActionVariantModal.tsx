'use client';

import { useState } from 'react';
import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { ActionVariantSelector } from './ActionVariantSelector';
import { EmotionType } from '@/lib/battle-v2/types';

interface ActionVariantModalProps {
  onRestart?: () => void;
}

export function ActionVariantModal({ onRestart }: ActionVariantModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const { params, setParams } = useBattleParamsV2();

  return (
    <div className="relative">
      {/* アクションバリアントボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border-2 border-white/20 hover:bg-gray-700/80 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-[min(800px,95vw)] flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
            <div className="relative flex flex-col flex-1 min-h-0">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-black text-white">アクションバリアント</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* 注意書き */}
              <div className="mb-4 rounded-lg bg-pink-500/10 border border-pink-500/30 p-3">
                <p className="text-sm text-pink-300 text-center">
                  ⓘ 設定は次のバトル（リトライ）から反映されます
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0">
                {(['rage', 'terror', 'grief', 'ecstasy'] as EmotionType[]).map((emotion) => (
                  <ActionVariantSelector
                    key={emotion}
                    emotion={emotion}
                    selectedVariant={params.selectedActionVariants[emotion]}
                    onChange={(variant) =>
                      setParams({
                        selectedActionVariants: {
                          ...params.selectedActionVariants,
                          [emotion]: variant,
                        },
                      })
                    }
                  />
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    onRestart?.();
                    setIsOpen(false);
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors"
                >
                  リトライ
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
