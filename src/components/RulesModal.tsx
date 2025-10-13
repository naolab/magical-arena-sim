'use client';

import { Button } from './ui/Button';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-[min(800px,90vw)] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
        </div>

        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">バトルルール</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="max-h-[calc(85vh-140px)] overflow-y-auto pr-2 space-y-6 text-white/90">
            <section>
              <h3 className="text-xl font-bold text-arena-player mb-3">基本ルール</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• ターン制バトルで、3つの行動から選択します</li>
                <li>• <strong>アタック</strong> ＞ アピール、<strong>アピール</strong> ＞ ガード、<strong>ガード</strong> ＞ アタック</li>
                <li>• 相手のHPを0にすれば勝利！</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-arena-player mb-3">行動の特徴</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="font-bold mb-1">アタック（攻撃）</h4>
                  <p className="text-white/70">高火力の攻撃。勝利時に1.2倍ダメージ。連発するとアンチ+5</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="font-bold mb-1">アピール（魅せ技）</h4>
                  <p className="text-white/70">ダメージなし。成功時にファン+10%、アンチ-15で人気回復</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="font-bold mb-1">ガード（防御）</h4>
                  <p className="text-white/70">ダメージ80%カット。成功時にファン+3%、アンチ-5</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-arena-player mb-3">観客指示システム</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• 毎ターン<strong>3つの観客指示</strong>が表示されます</li>
                <li>• 各指示に従うと<strong>ファン+5%</strong>、破ると<strong>ファン-5%</strong></li>
                <li>• すべて従えば<strong>+15%</strong>、すべて破れば<strong>-15%</strong></li>
                <li>• 指示を破るとアンチゲージも上昇（+10〜+15）</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-arena-player mb-3">ファン率システム</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• ファン率が高いほど<strong>火力が上昇</strong>（最大2倍）</li>
                <li>• 勝利すると中立ファンと<strong>敵ファンを半分ずつ奪える</strong></li>
                <li>• 中立が0の場合は敵ファンから全額奪う</li>
                <li>• 敗北すると自分のファンが中立に戻る</li>
              </ul>
              <div className="mt-2 text-sm bg-white/5 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>ファン率 0-20%: <strong>×1.0</strong></div>
                  <div>ファン率 21-50%: <strong>×1.2</strong></div>
                  <div>ファン率 51-80%: <strong>×1.5</strong></div>
                  <div>ファン率 81-100%: <strong>×2.0</strong></div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-arena-enemy mb-3">アンチゲージ</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• 観客の期待を裏切るとアンチゲージが上昇</li>
                <li>• アンチレベルが上がると<strong>ファン獲得と火力にペナルティ</strong></li>
                <li>• Lv3（炎上期）: ファン獲得-60%、火力-60%</li>
                <li>• アピールやガード成功でアンチを減らせる</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-arena-player mb-3">勝利のコツ</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• 観客指示に従ってファンを増やす</li>
                <li>• アピールでファンを獲得し、火力を上げる</li>
                <li>• アンチゲージが溜まったらアピール/ガードで回復</li>
                <li>• 敵のファンを奪って火力差をつける</li>
              </ul>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="primary"
              size="lg"
              className="w-full rounded-full bg-gradient-to-br from-white/20 to-white/10 text-white border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition hover:from-white/30 hover:to-white/20 hover:border-white/40"
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
