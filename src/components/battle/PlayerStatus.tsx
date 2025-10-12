import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';
import { Badge } from '../ui/Badge';
import { getAntiLevelName } from '@/lib/battle/antiGauge';
import type { PlayerState } from '@/types';

interface PlayerStatusProps {
  player: PlayerState;
}

export function PlayerStatus({ player }: PlayerStatusProps) {
  const antiColor =
    player.antiLevel === 3
      ? 'anti-lv3'
      : player.antiLevel === 2
        ? 'anti-lv2'
        : player.antiLevel === 1
          ? 'anti-lv1'
          : 'neutral';

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-arena-player">プレイヤー</h2>
        <Badge variant={player.antiLevel >= 2 ? 'danger' : player.antiLevel >= 1 ? 'warning' : 'default'}>
          {getAntiLevelName(player.antiLevel)}
        </Badge>
      </div>

      <div className="space-y-3">
        <Gauge value={player.hp} maxValue={player.maxHp} color="player" label="HP" />

        <div>
          <div className="mb-1 text-sm text-arena-subtext">ファン率</div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Gauge
                value={Math.round(player.fanRate * 100)}
                maxValue={100}
                color="player"
                showText={false}
              />
            </div>
            <div className="text-lg font-bold text-arena-player">
              {(player.fanRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm text-arena-subtext">アンチゲージ</div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Gauge
                value={player.antiGauge}
                maxValue={100}
                color={antiColor}
                showText={false}
              />
            </div>
            <div className={`text-lg font-bold ${
              player.antiLevel === 3 ? 'text-arena-anti-lv3' :
              player.antiLevel === 2 ? 'text-arena-anti-lv2' :
              player.antiLevel === 1 ? 'text-arena-anti-lv1' :
              'text-arena-neutral'
            }`}>
              {player.antiGauge}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
