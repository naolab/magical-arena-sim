'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { EnemyStatus } from '@/components/battle/EnemyStatus';
import { PlayerStatus } from '@/components/battle/PlayerStatus';
import { useBattle } from '@/hooks/useBattle';
import { AudienceDisplay } from '@/components/battle/AudienceDisplay';
import { CommandBubbles } from '@/components/battle/CommandBubbles';
import { ActionButtons } from '@/components/battle/ActionButtons';
import { BattleResult } from '@/components/battle/BattleResult';
import { ActionShowdown } from '@/components/battle/ActionShowdown';
import { RulesModal } from '@/components/RulesModal';
import { BookIcon } from '@/components/ui/BookIcon';
import { SettingsMenu } from '@/components/SettingsMenu';

const BASE_STAGE_WIDTH = 1600;
const BASE_STAGE_HEIGHT = 900;

export default function BattlePage() {
  const {
    player,
    enemy,
    audience,
    currentTurn,
    isActive,
    phase,
    commandBubbles,
    visibleBubbleCount,
    showdownResult,
    showdownStage,
    canSelectAction,
    selectAction,
    acknowledgeShowdown,
    winner,
    reset,
  } = useBattle();

  const [viewportSize, setViewportSize] = useState({ width: BASE_STAGE_WIDTH, height: BASE_STAGE_HEIGHT });
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = useMemo(() => {
    const { width, height } = viewportSize;
    const ratio = Math.min(width / BASE_STAGE_WIDTH, height / BASE_STAGE_HEIGHT);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  }, [viewportSize]);

  const stageWrapperStyle = useMemo<CSSProperties>(
    () => ({
      width: BASE_STAGE_WIDTH * scale,
      height: BASE_STAGE_HEIGHT * scale,
    }),
    [scale]
  );

  const stageStyle = useMemo<CSSProperties>(
    () => ({
      width: BASE_STAGE_WIDTH,
      height: BASE_STAGE_HEIGHT,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    }),
    [scale]
  );

  const displayTurn = Math.max(1, isActive ? currentTurn + 1 : currentTurn);

  return (
    <main className="w-screen h-screen bg-black flex items-center justify-center">
      <div style={stageWrapperStyle} className="pointer-events-none">
        {/* 16:9固定のゲーム画面 */}
        <div
          style={stageStyle}
          className="relative bg-arena-bg pointer-events-auto overflow-hidden rounded-3xl shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
        >
          <CommandBubbles bubbles={commandBubbles} phase={phase} visibleCount={visibleBubbleCount} />

          {phase === 'showdown' && showdownResult && (
            <ActionShowdown
              result={showdownResult}
              stage={showdownStage}
              onContinue={acknowledgeShowdown}
            />
          )}

          {/* 左上：設定、ルール、ターン表示 */}
          <div className="absolute left-8 top-8 z-10 flex gap-4">
            <SettingsMenu onRestart={reset} />
            <button
              onClick={() => setIsRulesOpen(true)}
              className="flex h-24 w-24 items-center justify-center text-white/80 transition-colors hover:text-white"
              aria-label="ルールを表示"
            >
              <BookIcon className="h-8 w-8" />
            </button>
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

          <div className="absolute bottom-[9%] left-1/2 w-[36%] max-w-2xl -translate-x-1/2">
            <div className="flex justify-center">
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
      </div>

      {phase === 'ended' && winner && <BattleResult winner={winner} onReset={reset} />}

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} version="v1" />
    </main>
  );
}
