import { Button } from '../ui/Button';

interface BattleResultProps {
  winner: 'player' | 'enemy';
  onReset: () => void;
}

export function BattleResult({ winner, onReset }: BattleResultProps) {
  const isPlayerWin = winner === 'player';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative w-[min(420px,90vw)] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-10 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="absolute -top-16 right-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative space-y-6 text-center text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-white/40">Battle Result</p>
            <h2
              className={`mt-3 text-4xl font-black tracking-wide ${
                isPlayerWin ? 'text-arena-player' : 'text-arena-enemy'
              }`}
            >
              {isPlayerWin ? 'VICTORY' : 'DEFEAT'}
            </h2>
          </div>

          <p className="leading-relaxed text-white/80">
            {isPlayerWin
              ? '観客を熱狂させ、魔法少女同士のライブバトルに勝利した！'
              : '観客の支持を得られず敗北…。次のステージで巻き返そう。'}
          </p>

          <div className="pt-2">
            <Button
              onClick={onReset}
              variant="primary"
              size="lg"
              className="w-full rounded-full bg-gradient-to-br from-white/20 to-white/10 text-white border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition hover:from-white/30 hover:to-white/20 hover:border-white/40"
            >
              再戦する
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
