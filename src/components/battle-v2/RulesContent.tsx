'use client';

export function RulesContent() {
  return (
    <div className="space-y-4 text-white">
      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">基本ルール</h3>
        <p className="text-white/80">
          魔法少女同士の感情をぶつけ合うバトル。観客のコメントを使って攻撃し、相手のHPを0にすれば勝利。
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">4つの感情</h3>
        <ul className="space-y-2 text-white/80">
          <li>
            <span className="font-bold text-red-400">RAGE (怒り)</span> - 追加ダメージ
          </li>
          <li>
            <span className="font-bold text-purple-400">TERROR (恐怖)</span> - 敵デバフ
          </li>
          <li>
            <span className="font-bold text-blue-400">GRIEF (悲しみ)</span> - HP吸収
          </li>
          <li>
            <span className="font-bold text-pink-400">ECSTASY (歓喜)</span> - 自己バフ
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">相性</h3>
        <p className="text-white/80 mb-2">じゃんけんのように感情同士には相性があります。</p>
        <div className="text-white/80 space-y-1">
          <p>
            <span className="font-bold text-red-400">RAGE</span> は{' '}
            <span className="font-bold text-purple-400">TERROR</span> に強い
          </p>
          <p>
            <span className="font-bold text-purple-400">TERROR</span> は{' '}
            <span className="font-bold text-blue-400">GRIEF</span> に強い
          </p>
          <p>
            <span className="font-bold text-blue-400">GRIEF</span> は{' '}
            <span className="font-bold text-pink-400">ECSTASY</span> に強い
          </p>
          <p>
            <span className="font-bold text-pink-400">ECSTASY</span> は{' '}
            <span className="font-bold text-red-400">RAGE</span> に強い
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">コメント</h3>
        <p className="text-white/80">
          毎ターン観客からコメントが届きます。感情を選択すると、その感情のコメントを全て消費して攻撃力がアップ。
        </p>
      </section>
    </div>
  );
}
