import { Card } from '../ui/Card';
import type { TurnResult } from '@/types';

interface BattleLogProps {
  turnHistory: TurnResult[];
}

export function BattleLog({ turnHistory }: BattleLogProps) {
  const reversedHistory = [...turnHistory].reverse();

  return (
    <Card className="max-h-72 overflow-y-auto bg-black/40 border-white/10 shadow-lg shadow-[0_15px_35px_rgba(20,8,25,0.45)]">
      <h3 className="mb-3 text-lg font-semibold tracking-wide text-white sticky top-0 bg-black/70 backdrop-blur px-2 py-1">
        バトルログ
      </h3>

      {reversedHistory.length === 0 ? (
        <div className="text-center text-arena-subtext py-4">
          まだログがありません
        </div>
      ) : (
        <div className="space-y-2">
          {reversedHistory.map((turn) => (
            <div
              key={turn.turnNumber}
              className="border-l-2 border-arena-player/40 pl-3 py-2 text-sm bg-white/5 rounded-md"
            >
              <div className="flex items-center justify-between text-xs text-white/80">
                <span className="font-semibold tracking-wide">
                  TURN {turn.turnNumber}
                </span>
                <span className="text-[10px] uppercase text-white/60">
                  {turn.judgement === 'win'
                    ? 'ADVANTAGE'
                    : turn.judgement === 'lose'
                      ? 'SETBACK'
                      : 'NEUTRAL'}
                </span>
              </div>
              <div className="mt-1 text-arena-text text-xs leading-relaxed">
                {turn.message}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-white/70">
                <div className="rounded bg-black/40 px-2 py-1">
                  <span className="block text-[10px] uppercase text-white/50">
                    Damage Dealt
                  </span>
                  <span className="font-mono text-sm text-arena-player">
                    {Math.round(turn.damage.toEnemy)}
                  </span>
                </div>
                <div className="rounded bg-black/40 px-2 py-1">
                  <span className="block text-[10px] uppercase text-white/50">
                    Damage Taken
                  </span>
                  <span className="font-mono text-sm text-arena-enemy">
                    {Math.round(turn.damage.toPlayer)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
