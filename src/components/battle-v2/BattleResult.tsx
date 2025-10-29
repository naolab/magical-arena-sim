'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface BattleResultProps {
  winner: 'player' | 'enemy' | 'draw';
  onRestart: () => void;
}

export function BattleResult({ winner, onRestart }: BattleResultProps) {
  const isWin = winner === 'player';
  const isDraw = winner === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`flex flex-col items-center gap-6 rounded-3xl p-12 shadow-2xl ${
          isWin
            ? 'bg-gradient-to-br from-blue-900/90 to-blue-600/90'
            : isDraw
            ? 'bg-gradient-to-br from-gray-900/90 to-gray-600/90'
            : 'bg-gradient-to-br from-red-900/90 to-red-600/90'
        }`}
      >
        {/* 結果表示 */}
        <div className="text-center">
          <div className="text-6xl font-black text-white">
            {isWin ? 'VICTORY!' : isDraw ? 'DRAW' : 'DEFEAT...'}
          </div>
          <div className="mt-4 text-2xl text-white/80">
            {isWin
              ? 'あなたの勝利です！'
              : isDraw
              ? '引き分けです'
              : '敗北しました…'}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-4">
          <Button variant="primary" size="lg" onClick={onRestart}>
            リトライ
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg">
              トップに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
