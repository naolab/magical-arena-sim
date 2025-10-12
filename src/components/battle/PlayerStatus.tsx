import { Gauge } from '../ui/Gauge';
import { Badge } from '../ui/Badge';
import { getAntiLevel } from '@/lib/battle/antiGauge';
import type { PlayerState } from '@/types';

interface PlayerStatusProps {
  player: PlayerState;
}

const antiLevelLabel: Record<number, string> = {
  0: '通常',
  1: '冷淡期',
  2: 'ブーイング期',
  3: '炎上期',
};

const antiLevelBadgeVariant: Record<number, 'default' | 'warning' | 'danger'> = {
  0: 'default',
  1: 'warning',
  2: 'danger',
  3: 'danger',
};

const antiLevelGaugeColor: Record<number, 'neutral' | 'anti-lv1' | 'anti-lv2' | 'anti-lv3'> = {
  0: 'neutral',
  1: 'anti-lv1',
  2: 'anti-lv2',
  3: 'anti-lv3',
};

export function PlayerStatus({ player }: PlayerStatusProps) {
  const level = getAntiLevel(player.antiGauge);

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-black/70 via-black/40 to-transparent/0 px-6 py-5 shadow-[0_15px_45px_rgba(10,6,30,0.55)] backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-arena-player">プレイヤー</h2>
        <Badge variant={antiLevelBadgeVariant[level]}>{antiLevelLabel[level]}</Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
            <span>アンチゲージ</span>
            <span>{player.antiGauge}</span>
          </div>
          <Gauge
            value={player.antiGauge}
            maxValue={100}
            color={antiLevelGaugeColor[level]}
            showText={false}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
            <span>HP</span>
            <span>
              {player.hp} / {player.maxHp}
            </span>
          </div>
          <Gauge value={player.hp} maxValue={player.maxHp} color="player" showText={false} />
        </div>
      </div>
    </div>
  );
}
