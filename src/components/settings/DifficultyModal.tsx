'use client';

import { useBattleParams } from '@/contexts/BattleParamsContext';
import { Button } from '../ui/Button';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DifficultyModal({ isOpen, onClose }: DifficultyModalProps) {
  const { params, setParams } = useBattleParams();

  if (!isOpen) return null;

  const handlePlayerFansChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayerFans = Number(e.target.value);
    const currentEnemyFans = params.INITIAL_AUDIENCE.ENEMY_FANS;
    const newNeutralFans = 1 - newPlayerFans - currentEnemyFans;

    setParams({
      INITIAL_AUDIENCE: {
        PLAYER_FANS: newPlayerFans,
        ENEMY_FANS: currentEnemyFans,
        NEUTRAL_FANS: newNeutralFans,
      },
    });
  };

  const playerFansSliderMax = 1 - params.INITIAL_AUDIENCE.ENEMY_FANS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-[min(600px,90vw)] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">難易度設定</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="max-h-[calc(85vh-140px)] overflow-y-auto pr-2 space-y-8 text-white/90">
            <section>
              <h3 className="text-lg font-bold mb-3">基本ダメージ量</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={params.BASE_POWER}
                  onChange={(e) => setParams({ BASE_POWER: Number(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-xl w-16 text-center">{params.BASE_POWER}</span>
              </div>
              <p className="text-sm text-white/60 mt-2">アタックの基礎となるダメージ量です。</p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3">初期HP</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="500"
                  max="2000"
                  step="100"
                  value={params.INITIAL_HP}
                  onChange={(e) => setParams({ INITIAL_HP: Number(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-xl w-16 text-center">{params.INITIAL_HP}</span>
              </div>
              <p className="text-sm text-white/60 mt-2">戦闘全体の長さを調整します。</p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3">アピール成功ボーナス</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.01"
                  value={params.FAN_CHANGE.APPEAL_SUCCESS}
                  onChange={(e) =>
                    setParams({
                      FAN_CHANGE: { ...params.FAN_CHANGE, APPEAL_SUCCESS: Number(e.target.value) },
                    })
                  }
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-xl w-16 text-center">
                  +{(params.FAN_CHANGE.APPEAL_SUCCESS * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-white/60 mt-2">アピール成功時に獲得するファン率ボーナスです。</p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3">プレイヤー初期ファン率</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.05"
                  max={playerFansSliderMax}
                  step="0.01"
                  value={params.INITIAL_AUDIENCE.PLAYER_FANS}
                  onChange={handlePlayerFansChange}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-xl w-16 text-center">
                  {(params.INITIAL_AUDIENCE.PLAYER_FANS * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-white/60 mt-2">プレイヤーの初期ファン率。高いほど序盤が有利になります。</p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3">ファン率火力ボーナス倍率</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={params.FAN_POWER_BONUS_RATE}
                  onChange={(e) => setParams({ FAN_POWER_BONUS_RATE: Number(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-xl w-16 text-center">
                  x{params.FAN_POWER_BONUS_RATE.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-white/60 mt-2">ファン率が高い時のダメージボーナス全体に掛ける倍率です。</p>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="primary"
              size="lg"
              className="w-full rounded-full"
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
