'use client';

import { EnemyStatus } from '@/components/battle/EnemyStatus';
import { PlayerStatus } from '@/components/battle/PlayerStatus';
import { useBattle } from '@/hooks/useBattle';
import { AudienceDisplay } from '@/components/battle/AudienceDisplay';
import { CommandBubbles } from '@/components/battle/CommandBubbles';
import { ActionButtons } from '@/components/battle/ActionButtons';
import { BattleResult } from '@/components/battle/BattleResult';

export default function BattlePage() {
  const {
    player,
    enemy,
    audience,
    currentTurn,
    isActive,
    phase,
    commandBubbles,
    canSelectAction,
    selectAction,
    winner,
    reset,
  } = useBattle();
  const displayTurn = Math.max(1, isActive ? currentTurn + 1 : currentTurn);

  return (
    <main className="w-screen h-screen bg-black flex items-center justify-center">
      {/* 16:9固定のゲーム画面 */}
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] bg-arena-bg">
        <CommandBubbles bubbles={commandBubbles} phase={phase} />

        <div className="absolute left-8 top-8">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 via-black/40 to-black/70 shadow-[0_18px_32px_rgba(8,6,20,0.55)] backdrop-blur">
            <div className="absolute inset-2.5 rounded-full border border-white/10" />
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.45em] text-white/60">Turn</p>
              <p className="text-2xl font-black text-white leading-tight">
                {String(displayTurn).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute left-6 bottom-6 w-[22%] max-w-sm">
          <PlayerStatus player={player} />
        </div>

        <div className="absolute left-1/2 top-6 w-[36%] max-w-2xl -translate-x-1/2">
          <AudienceDisplay audience={audience} />
        </div>

        <div className="absolute right-6 top-6 w-[22%] max-w-sm">
          <EnemyStatus enemy={enemy} />
        </div>

        <div className="absolute bottom-10 left-[28%] right-10">
          <div className="flex justify-end">
            <div
              className={`transform transition-all duration-500 ${
                phase === 'selecting'
                  ? 'opacity-100 translate-y-0'
                  : 'pointer-events-none opacity-0 translate-y-4'
              }`}
            >
              <ActionButtons onAction={selectAction} disabled={!canSelectAction} />
            </div>
          </div>
        </div>
      </div>

      {winner && <BattleResult winner={winner} onReset={reset} />}
    </main>
  );
}
