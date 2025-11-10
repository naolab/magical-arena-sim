'use client';

import { useState } from 'react';
import { RulesContent } from './RulesContent';

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* ルールボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border-2 border-white/20 hover:bg-gray-700/80 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
          <path d="M9 7h6" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
        </svg>
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-[min(800px,95vw)] flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
            <div className="relative flex flex-col flex-1 min-h-0">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-black text-white">ルール</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <RulesContent />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full transition-colors"
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
