import { Gauge } from '../ui/Gauge';
import type { EnemyState } from '@/types';

interface EnemyStatusProps {
  enemy: EnemyState;
}

export function EnemyStatus({ enemy }: EnemyStatusProps) {
  return (
    <div className="space-y-4 rounded-3xl bg-gradient-to-bl from-black/70 via-black/40 to-transparent/0 px-6 py-5 shadow-[0_12px_35px_rgba(30,8,20,0.45)] backdrop-blur">
      <h2 className="text-xl font-bold text-arena-enemy">敵</h2>
      <Gauge value={enemy.hp} maxValue={enemy.maxHp} color="enemy" label="HP" />
    </div>
  );
}
