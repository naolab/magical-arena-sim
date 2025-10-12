import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';
import type { EnemyState } from '@/types';

interface EnemyStatusProps {
  enemy: EnemyState;
}

export function EnemyStatus({ enemy }: EnemyStatusProps) {
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-bold text-arena-enemy">敵</h2>

      <div className="space-y-3">
        <Gauge value={enemy.hp} maxValue={enemy.maxHp} color="enemy" label="HP" />

        <div>
          <div className="mb-1 text-sm text-arena-subtext">ファン率</div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Gauge
                value={Math.round(enemy.fanRate * 100)}
                maxValue={100}
                color="enemy"
                showText={false}
              />
            </div>
            <div className="text-lg font-bold text-arena-enemy">
              {(enemy.fanRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
