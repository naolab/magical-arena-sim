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
              <p className="text-sm text-white/60 mt-2">アタックの基礎となるダメージ量です。値が大きいほど戦闘が早く終わります。</p>
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
              <p className="text-sm text-white/60 mt-2">プレイヤーと敵の初期HPです。高いほど戦闘が長引きます。</p>
            </section>

            {/* ここに他の設定項目を追加していく */}

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
