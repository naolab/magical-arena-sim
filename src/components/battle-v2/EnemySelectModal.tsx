'use client';

import { useState } from 'react';
import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';
import { ENEMY_CHARACTERS, getAllEnemyCharacterIds } from '@/lib/battle-v2/enemyCharacters';
import Image from 'next/image';

interface EnemySelectModalProps {
  onRestart?: () => void;
}

export function EnemySelectModal({ onRestart }: EnemySelectModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const { params, setParams } = useBattleParamsV2();

  const enemyIds = getAllEnemyCharacterIds();

  return (
    <div className="relative">
      {/* 敵選択ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border-2 border-white/20 hover:bg-gray-700/80 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-[min(800px,95vw)] flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
            <div className="relative flex flex-col flex-1 min-h-0">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-black text-white">敵キャラクター</h2>
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
                {enemyIds.map((id) => {
                  const enemy = ENEMY_CHARACTERS[id];
                  const isSelected = params.enemyCharacterId === id;

                  return (
                    <div
                      key={id}
                      className={`relative rounded-xl p-4 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                      onClick={() => setParams({ enemyCharacterId: id })}
                    >
                      <div className="flex gap-4 items-center">
                        {/* キャラクターイラスト */}
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
                          <Image
                            src={enemy.imagePath}
                            alt={enemy.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* キャラクター情報 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-white">{enemy.name}</h3>
                            {isSelected && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400 text-black font-bold">
                                選択中
                              </span>
                            )}
                          </div>
                          {enemy.description && (
                            <p className="text-sm text-white/70 mb-2">{enemy.description}</p>
                          )}
                          <div className="text-xs text-white/50">
                            <span className="font-semibold">AI戦略: </span>
                            {enemy.aiStrategy === 'adaptive' ? '適応型' : '通常'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
