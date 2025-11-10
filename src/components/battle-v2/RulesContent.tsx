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
        <h3 className="text-xl font-bold text-cyan-400 mb-2">4つの感情と技選択</h3>
        <p className="text-white/80 mb-3">
          各感情には複数の技があり、難易度設定画面で使用する技を選択できます。
        </p>
        <ul className="space-y-2 text-white/80">
          <li>
            <span className="font-bold text-red-400">RAGE (怒り)</span> - 追加ダメージや高火力攻撃
          </li>
          <li>
            <span className="font-bold text-purple-400">TERROR (恐怖)</span> - デバフ・毒・呪いで敵を弱体化
          </li>
          <li>
            <span className="font-bold text-blue-400">GRIEF (悲しみ)</span> - HP回復・吸収・リジェネ
          </li>
          <li>
            <span className="font-bold text-pink-400">ECSTASY (歓喜)</span> - 自己バフ・コメント操作
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">相性システム</h3>
        <p className="text-white/80 mb-2">じゃんけんのように感情同士には相性があります。相性勝ちするとダメージ増加。</p>
        <div className="text-white/80 space-y-1 text-sm">
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
        <h3 className="text-xl font-bold text-cyan-400 mb-2">コメントシステム</h3>
        <p className="text-white/80 mb-2">
          毎ターン観客からコメントが届きます。感情を選択すると、その感情のコメントを全て消費して攻撃力がアップ。
        </p>
        <p className="text-white/80 text-sm">
          <span className="font-bold">1コメントごとに攻撃力+20%</span>。コメント数が多いほど強力な攻撃になります。戦略的にコメントを溜めるか、すぐに使うかを判断しましょう。
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">スパチャコメント</h3>
        <p className="text-white/80 mb-2">
          観客からのコメントの中に、稀にスーパーチャット（スパチャ）が混ざることがあります。
        </p>
        <p className="text-white/80 text-sm">
          スパチャコメントはどの感情でも使える万能コメント。スパチャを消費すると、次に追加ターンが発動し、連続で行動できます！
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">その他の機能</h3>
        <ul className="space-y-2 text-white/80 text-sm">
          <li>
            <span className="font-bold">• HPゲージクリック:</span> HPゲージをクリックすると詳細な数値（現在HP/最大HP）が表示されます
          </li>
          <li>
            <span className="font-bold">• 効果アイコン:</span> バフ・デバフ・毒・呪い・リジェネなどの効果はアイコンで表示され、残りターン数も確認できます
          </li>
          <li>
            <span className="font-bold">• 技の使用回数:</span> 各技には使用回数制限があります（ほとんどの技は20回、コメントブーストは5回）
          </li>
        </ul>
      </section>
    </div>
  );
}
