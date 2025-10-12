import type { AudienceComposition } from '@/types';

interface AudienceDisplayProps {
  audience: AudienceComposition;
}

export function AudienceDisplay({ audience }: AudienceDisplayProps) {
  return (
    <div className="space-y-3 bg-gradient-to-b from-white/10 to-transparent/0 px-6 py-4 rounded-3xl shadow-[0_18px_35px_rgba(12,8,25,0.45)] backdrop-blur-sm">
      <h3 className="text-lg font-bold tracking-[0.35em] uppercase text-white/80">Audience</h3>

      <div className="flex h-8 w-full overflow-hidden rounded-full">
        {/* 自分ファン（左） */}
        <div
          className="bg-arena-player transition-all duration-300 flex items-center justify-center text-xs font-bold text-white"
          style={{ width: `${audience.playerFans * 100}%` }}
        >
          {audience.playerFans > 0.1 && `${(audience.playerFans * 100).toFixed(0)}%`}
        </div>

        {/* 中立（中央） */}
        <div
          className="bg-arena-neutral transition-all duration-300 flex items-center justify-center text-xs font-bold text-arena-bg"
          style={{ width: `${audience.neutralFans * 100}%` }}
        >
          {audience.neutralFans > 0.1 && `${(audience.neutralFans * 100).toFixed(0)}%`}
        </div>

        {/* 敵ファン（右） */}
        <div
          className="bg-arena-enemy transition-all duration-300 flex items-center justify-center text-xs font-bold text-white"
          style={{ width: `${audience.enemyFans * 100}%` }}
        >
          {audience.enemyFans > 0.1 && `${(audience.enemyFans * 100).toFixed(0)}%`}
        </div>
      </div>
    </div>
  );
}
