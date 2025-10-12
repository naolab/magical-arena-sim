import { Card } from '../ui/Card';
import type { AudienceComposition } from '@/types';

interface AudienceDisplayProps {
  audience: AudienceComposition;
}

export function AudienceDisplay({ audience }: AudienceDisplayProps) {
  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-bold text-arena-text">観客構成</h3>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-24 text-sm text-arena-enemy">敵ファン</div>
          <div className="flex-1 h-6 bg-arena-subtext/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-arena-enemy transition-all duration-300"
              style={{ width: `${audience.enemyFans * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-sm font-bold text-arena-enemy">
            {(audience.enemyFans * 100).toFixed(0)}%
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 text-sm text-arena-neutral">中立</div>
          <div className="flex-1 h-6 bg-arena-subtext/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-arena-neutral transition-all duration-300"
              style={{ width: `${audience.neutralFans * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-sm font-bold text-arena-neutral">
            {(audience.neutralFans * 100).toFixed(0)}%
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 text-sm text-arena-player">自分ファン</div>
          <div className="flex-1 h-6 bg-arena-subtext/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-arena-player transition-all duration-300"
              style={{ width: `${audience.playerFans * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-sm font-bold text-arena-player">
            {(audience.playerFans * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </Card>
  );
}
