'use client';

import { useState } from 'react';

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
              className="bg-gray-900/95 border-2 border-white/20 rounded-xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-white mb-6">ルール</h2>

              <div className="space-y-4 text-white">
                <section>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">基本ルール</h3>
                  <p className="text-white/80">
                    魔法少女同士の感情をぶつけ合うバトル。観客のコメントを使って攻撃し、相手のHPを0にすれば勝利。
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">4つの感情</h3>
                  <ul className="space-y-2 text-white/80">
                    <li><span className="font-bold text-red-400">RAGE (怒り)</span> - 追加ダメージ</li>
                    <li><span className="font-bold text-purple-400">TERROR (恐怖)</span> - 敵デバフ</li>
                    <li><span className="font-bold text-blue-400">GRIEF (悲しみ)</span> - HP吸収</li>
                    <li><span className="font-bold text-pink-400">ECSTASY (歓喜)</span> - 自己バフ</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">相性</h3>
                  <p className="text-white/80 mb-2">
                    じゃんけんのように感情同士には相性があります。
                  </p>
                  <div className="text-white/80 space-y-1">
                    <p><span className="font-bold text-red-400">RAGE</span> は <span className="font-bold text-purple-400">TERROR</span> に強い</p>
                    <p><span className="font-bold text-purple-400">TERROR</span> は <span className="font-bold text-blue-400">GRIEF</span> に強い</p>
                    <p><span className="font-bold text-blue-400">GRIEF</span> は <span className="font-bold text-pink-400">ECSTASY</span> に強い</p>
                    <p><span className="font-bold text-pink-400">ECSTASY</span> は <span className="font-bold text-red-400">RAGE</span> に強い</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">コメント</h3>
                  <p className="text-white/80">
                    毎ターン観客からコメントが届きます。感情を選択すると、その感情のコメントを全て消費して攻撃力がアップ。
                  </p>
                </section>
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
