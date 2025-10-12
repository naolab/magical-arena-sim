import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface BattleResultProps {
  winner: 'player' | 'enemy';
  onReset: () => void;
}

export function BattleResult({ winner, onReset }: BattleResultProps) {
  const isPlayerWin = winner === 'player';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <h2 className={`text-4xl font-bold ${
            isPlayerWin ? 'text-arena-player' : 'text-arena-enemy'
          }`}>
            {isPlayerWin ? '勝利！' : '敗北...'}
          </h2>

          <p className="text-arena-text">
            {isPlayerWin
              ? 'おめでとうございます！見事勝利しました！'
              : '残念...次は勝てるようがんばりましょう！'
            }
          </p>

          <Button onClick={onReset} variant="primary" size="lg" className="w-full">
            もう一度プレイ
          </Button>
        </div>
      </Card>
    </div>
  );
}
