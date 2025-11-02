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
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </button>

      {/* モーダル */}
      {isOpen && (
        <>
          {/* 背景 */}
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            {/* モーダル内容 */}
            <div
              className="bg-gray-900/95 border-2 border-white/20 rounded-xl p-8 max-w-2xl max-h-[80vh] w-[min(90vw,32rem)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6">ルール</h2>

              <div className="flex-1 overflow-y-auto pr-1 pb-1">
                <RulesContent />
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
