import clsx from 'clsx';
import type { TurnResult } from '@/types';

type WinnerSide = 'player' | 'enemy' | 'draw';

const ACTION_META = {
  attack: {
    label: 'ATTACK',
    short: 'ATK',
    gradient: 'from-[#ff4d6d] via-[#ff6b81] to-[#ff8fa3]',
  },
  appeal: {
    label: 'APPEAL',
    short: 'APL',
    gradient: 'from-[#ffe066] via-[#f9c74f] to-[#f8961e]',
  },
  guard: {
    label: 'GUARD',
    short: 'GRD',
    gradient: 'from-[#4cc9f0] via-[#4895ef] to-[#4361ee]',
  },
} as const;

interface ShowdownCardProps {
  role: 'player' | 'enemy';
  result: TurnResult;
  winner: WinnerSide;
}

function ShowdownCard({ role, result, winner }: ShowdownCardProps) {
  const action = role === 'player' ? result.playerAction : result.enemyAction;
  const meta = ACTION_META[action];
  const isWinner = (winner === 'player' && role === 'player') || (winner === 'enemy' && role === 'enemy');
  const isLoser = winner !== 'draw' && !isWinner;
  const damage = role === 'player' ? result.damage.toEnemy : result.damage.toPlayer;
  const fanChange = role === 'player' ? result.fanChange.player : result.fanChange.enemy;

  return (
    <div
      className={clsx(
        'flex w-full max-w-[240px] flex-col items-center text-center transition-all duration-500',
        isWinner ? 'text-white' : 'text-white/70',
        isLoser ? 'scale-95 opacity-60' : 'scale-100'
      )}
    >
      <div
        className={clsx(
          'relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 bg-black/40 shadow-[0_20px_45px_rgba(12,8,40,0.65)]',
          isWinner ? 'border-white/80 scale-110' : 'border-white/25'
        )}
      >
        <span
          className={clsx(
            'absolute inset-0 bg-gradient-to-br opacity-90',
            meta.gradient
          )}
        />
        <span className="relative text-xl font-black tracking-[0.35em]">{meta.short}</span>
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.45em] text-white/50">{role === 'player' ? 'YOU' : 'ENEMY'}</p>
      <p className="mt-1 text-lg font-semibold tracking-[0.2em]">{meta.label}</p>

      <div className="mt-4 space-y-1 text-xs tracking-[0.15em] text-white/60">
        <p>
          HP&nbsp;
          <span className="font-semibold text-white">
            {damage > 0 ? `-${Math.round(damage)}` : '±0'}
          </span>
        </p>
        <p>
          Fans&nbsp;
          <span className="font-semibold text-white">
            {fanChange === 0 ? '±0%' : `${fanChange > 0 ? '+' : ''}${Math.round(fanChange * 100)}%`}
          </span>
        </p>
      </div>

      {isWinner && (
        <p className="mt-3 text-[10px] uppercase tracking-[0.6em] text-white/60">Advantage</p>
      )}
    </div>
  );
}

interface ActionShowdownProps {
  result: TurnResult;
}

export function ActionShowdown({ result }: ActionShowdownProps) {
  const winner: WinnerSide =
    result.judgement === 'win' ? 'player' : result.judgement === 'lose' ? 'enemy' : 'draw';

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex w-[min(720px,90vw)] max-w-4xl items-center justify-between gap-10 px-6 py-10">
        <ShowdownCard role="player" result={result} winner={winner} />

        <div className="flex flex-col items-center gap-3 text-white">
          <span className="text-xs uppercase tracking-[0.65em] text-white/50">Turn {result.turnNumber}</span>
          <span className="text-4xl font-black tracking-[0.6em] text-white/70">VS</span>
          <span className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            {winner === 'draw' ? 'Draw' : winner === 'player' ? 'Player Wins' : 'Enemy Wins'}
          </span>
        </div>

        <ShowdownCard role="enemy" result={result} winner={winner} />
      </div>
    </div>
  );
}
