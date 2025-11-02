'use client';

import { useBattleParamsV2 } from '@/contexts/BattleParamsV2Context';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DifficultyModal({ isOpen, onClose }: DifficultyModalProps) {
  const { params, setParams, resetParams } = useBattleParamsV2();

  if (!isOpen) return null;

  const handlePlayerFansChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayerFans = Number(e.target.value);
    const currentEnemyFans = params.initialEnemyFans;
    const newNeutralFans = 1 - newPlayerFans - currentEnemyFans;

    setParams({
      initialPlayerFans: newPlayerFans,
      initialNeutralFans: newNeutralFans,
    });
  };

  const playerFansSliderMax = 1 - params.initialEnemyFans;

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

          {/* 注意書き */}
          <div className="mb-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 p-3">
            <p className="text-sm text-cyan-300 text-center">
              ⓘ 設定は次のバトル（リトライ）から反映されます
            </p>
          </div>

          <div className="max-h-[calc(85vh-200px)] overflow-y-auto pr-2 space-y-6 text-white/90">
            {/* 基本設定 */}
            <section>
              <h3 className="text-lg font-bold mb-3 text-cyan-400">基本設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block">プレイヤーHP</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="500" max="2000" step="100"
                      value={params.playerMaxHp}
                      onChange={(e) => setParams({ playerMaxHp: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">{params.playerMaxHp}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">敵HP</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="500" max="2000" step="100"
                      value={params.enemyMaxHp}
                      onChange={(e) => setParams({ enemyMaxHp: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">{params.enemyMaxHp}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">基本攻撃力</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="50" max="200" step="10"
                      value={params.playerBasePower}
                      onChange={(e) => setParams({ playerBasePower: Number(e.target.value), enemyBasePower: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">{params.playerBasePower}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ダメージ設定 */}
            <section>
              <h3 className="text-lg font-bold mb-3 text-cyan-400">ダメージ設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block">コメント1個あたりのボーナス</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0.0" max="0.5" step="0.05"
                      value={params.commentBonusPerCount}
                      onChange={(e) => setParams({ commentBonusPerCount: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">+{(params.commentBonusPerCount * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">有利時のダメージ倍率</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="1.0" max="2.0" step="0.1"
                      value={params.matchupBonusWin}
                      onChange={(e) => setParams({ matchupBonusWin: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">×{params.matchupBonusWin.toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">不利時のダメージ倍率</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0.3" max="1.0" step="0.05"
                      value={params.matchupBonusLose}
                      onChange={(e) => setParams({ matchupBonusLose: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">×{params.matchupBonusLose.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 特殊効果設定 */}
            <section>
              <h3 className="text-lg font-bold mb-3 text-cyan-400">特殊効果設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block">Rage 追加ダメージ割合</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0.0" max="1.0" step="0.1"
                      value={params.rageExtraDamageRatio}
                      onChange={(e) => setParams({ rageExtraDamageRatio: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">+{(params.rageExtraDamageRatio * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Terror デバフ強度</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0" max="50" step="5"
                      value={params.terrorDebuffMagnitude}
                      onChange={(e) => setParams({ terrorDebuffMagnitude: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">-{params.terrorDebuffMagnitude}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Grief HP吸収割合</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0.0" max="0.8" step="0.1"
                      value={params.griefDrainRatio}
                      onChange={(e) => setParams({ griefDrainRatio: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">{(params.griefDrainRatio * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Ecstasy バフ強度</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0" max="50" step="5"
                      value={params.ecstasyBuffMagnitude}
                      onChange={(e) => setParams({ ecstasyBuffMagnitude: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">+{params.ecstasyBuffMagnitude}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ファンシステム設定 */}
            <section>
              <h3 className="text-lg font-bold mb-3 text-cyan-400">ファンシステム設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-2 block">プレイヤー初期ファン率</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="0.05" max={playerFansSliderMax} step="0.05"
                      value={params.initialPlayerFans}
                      onChange={handlePlayerFansChange}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">{(params.initialPlayerFans * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">ターン毎のコメント数</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="1" max="5" step="1"
                      value={params.commentsPerTurn}
                      onChange={(e) => setParams({ commentsPerTurn: Number(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-xl w-24 text-center">{params.commentsPerTurn}個</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex gap-4">
            <button
              onClick={resetParams}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors"
            >
              リセット
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
