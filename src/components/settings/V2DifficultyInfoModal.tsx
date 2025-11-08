'use client';

import { DEFAULT_BATTLE_PARAMS_V2 } from '@/contexts/BattleParamsV2Context';

interface V2DifficultyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function V2DifficultyInfoModal({ isOpen, onClose }: V2DifficultyInfoModalProps) {
  if (!isOpen) {
    return null;
  }

  const defaults = DEFAULT_BATTLE_PARAMS_V2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-[min(600px,90vw)] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)] text-white/90">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-white">難易度について</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2">
          <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-relaxed text-cyan-100">
            <p>
              v2 の詳細な難易度調整はバトル画面のメニューから行えます。ここでは初期設定の概要だけを確認できます。
            </p>
            <p className="mt-2">
              バトルに入ったら左下メニューの
              <span className="font-semibold text-cyan-300"> 難易度調整 </span>
              を開いて数値を変更してください。リトライ時に反映されます。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-cyan-300">初期パラメータ</h3>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">プレイヤーHP</dt>
                <dd className="text-xl font-semibold text-white">{defaults.playerMaxHp}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">敵HP</dt>
                <dd className="text-xl font-semibold text-white">{defaults.enemyMaxHp}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">基本攻撃力</dt>
                <dd className="text-xl font-semibold text-white">{defaults.playerBasePower}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">コメント補正/件</dt>
                <dd className="text-xl font-semibold text-white">
                  {defaults.commentBonusPerCount.toFixed(2)}
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">ファン勝利時変動</dt>
                <dd className="text-xl font-semibold text-white">
                  {Math.round(defaults.fanRateChangeOnWin * 100)}%
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">ファン敗北時変動</dt>
                <dd className="text-xl font-semibold text-white">
                  {Math.round(defaults.fanRateChangeOnLose * 100)}%
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <dt className="text-white/70">初期ファン (味方/敵/中立)</dt>
                <dd className="text-xl font-semibold text-white">
                  {(defaults.initialPlayerFans * 100).toFixed(0)}% /{' '}
                  {(defaults.initialEnemyFans * 100).toFixed(0)}% /{' '}
                  {(defaults.initialNeutralFans * 100).toFixed(0)}%
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
