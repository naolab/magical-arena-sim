'use client';

import Link from 'next/link';
import { useBattle } from '@/hooks/useBattle';
import { PlayerStatus } from '@/components/battle/PlayerStatus';
import { EnemyStatus } from '@/components/battle/EnemyStatus';
import { ActionButtons } from '@/components/battle/ActionButtons';
import { CommandIndicator } from '@/components/battle/CommandIndicator';
import { AudienceDisplay } from '@/components/battle/AudienceDisplay';
import { BattleLog } from '@/components/battle/BattleLog';
import { BattleResult } from '@/components/battle/BattleResult';
import { Button } from '@/components/ui/Button';

export default function BattlePage() {
  const {
    state,
    isActive,
    currentTurn,
    player,
    enemy,
    audience,
    currentCommand,
    turnHistory,
    winner,
    selectAction,
    reset,
  } = useBattle();

  return (
    <main className="min-h-screen bg-arena-bg p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-arena-text">Magical Arena</h1>
            <p className="text-arena-subtext">ターン {currentTurn}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} variant="secondary" size="sm">
              リセット
            </Button>
            <Link href="/">
              <Button variant="secondary" size="sm">
                戻る
              </Button>
            </Link>
          </div>
        </div>

        {/* メインバトルエリア */}
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          {/* 左: プレイヤー */}
          <div>
            <PlayerStatus player={player} />
          </div>

          {/* 中央: 観客指示と行動ボタン */}
          <div className="space-y-4">
            <CommandIndicator command={currentCommand} />
            <ActionButtons
              onAction={selectAction}
              disabled={!isActive || winner !== null}
            />
            <AudienceDisplay audience={audience} />
          </div>

          {/* 右: 敵 */}
          <div>
            <EnemyStatus enemy={enemy} />
          </div>
        </div>

        {/* バトルログ */}
        <BattleLog turnHistory={turnHistory} />

        {/* 勝敗結果モーダル */}
        {winner && <BattleResult winner={winner} onReset={reset} />}
      </div>
    </main>
  );
}
