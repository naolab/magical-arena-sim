'use client';

import { Card } from '../ui/Card';
import { Gauge } from '../ui/Gauge';
import { Badge } from '../ui/Badge';
import { getAntiLevel } from '@/lib/battle/antiGauge';
import { useBattleParams } from '@/contexts/BattleParamsContext';

interface AntiGaugeDisplayProps {
  antiGauge: number;
}

export function AntiGaugeDisplay({ antiGauge }: AntiGaugeDisplayProps) {
  const { params } = useBattleParams();
  const level = getAntiLevel(antiGauge, params);

  const getLevelBadge = () => {
    if (level === 0) return <Badge variant="default">通常</Badge>;
    if (level === 1) return <Badge variant="warning">冷淡期</Badge>;
    if (level === 2) return <Badge variant="danger">ブーイング期</Badge>;
    return <Badge variant="danger">炎上期</Badge>;
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-arena-text">アンチゲージ</h3>
        {getLevelBadge()}
      </div>
      <Gauge value={antiGauge} maxValue={100} color="anti-lv3" label="アンチ" />
    </Card>
  );
}