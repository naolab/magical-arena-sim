import { Card } from '../ui/Card';
import type { TurnResult } from '@/types';

interface BattleLogProps {
  turnHistory: TurnResult[];
}

export function BattleLog({ turnHistory }: BattleLogProps) {
  const reversedHistory = [...turnHistory].reverse();

  return (
    <Card className="max-h-64 overflow-y-auto">
      <h3 className="mb-3 text-lg font-bold text-arena-text sticky top-0 bg-arena-bg/95 pb-2">
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
              className="border-l-2 border-arena-player/30 pl-3 py-2 text-sm"
            >
              <div className="font-bold text-arena-text mb-1">
                ターン {turn.turnNumber}
              </div>
              <div className="text-arena-subtext text-xs leading-relaxed">
                {turn.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
