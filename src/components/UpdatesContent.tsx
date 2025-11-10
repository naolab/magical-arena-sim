'use client';

interface UpdateItem {
  text: string;
  tag?: 'new' | 'update' | 'fix' | 'balance';
}

interface UpdateCard {
  date: string;
  title: string;
  items: UpdateItem[];
}

const TAG_CONFIG = {
  new: { label: 'NEW', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' },
  update: { label: 'UPDATE', color: 'bg-purple-500/20 text-purple-300 border-purple-400/40' },
  fix: { label: 'FIX', color: 'bg-green-500/20 text-green-300 border-green-400/40' },
  balance: { label: 'BALANCE', color: 'bg-orange-500/20 text-orange-300 border-orange-400/40' },
} as const;

const UPDATES: UpdateCard[] = [
  {
    date: '2025.11.10',
    title: '新技追加 & UI改善',
    items: [
      { text: '各属性に新技バリアントを追加', tag: 'new' },
      { text: 'HPゲージタップで詳細HP表示機能', tag: 'new' },
      { text: 'アクションバリアント設定ボタンを分離', tag: 'update' },
      { text: 'スパチャ出現率を下方修正（7%→5%）', tag: 'balance' },
      { text: 'HP0後に回復効果で復活してしまうバグを修正', tag: 'fix' },
    ],
  },
  {
    date: '2025.11.10',
    title: '技選択システム & スパチャ実装',
    items: [
      { text: '技選択システムの実装', tag: 'new' },
      { text: 'スパチャシステムの実装', tag: 'new' },
      { text: '属性相性のON/OFF切り替え機能', tag: 'new' },
      { text: '技に使用制限を追加', tag: 'update' },
      { text: '敵キャラクターの能力値上方修正（HP 1500→2000、攻撃力 100→150）', tag: 'balance' },
    ],
  },
];

export function UpdatesContent() {
  return (
    <div className="space-y-5">
      {UPDATES.map((update, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent p-6 shadow-xl transition-all hover:border-white/20"
        >
          {/* 装飾的な背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative">
            {/* ヘッダー */}
            <div className="mb-5 flex items-baseline gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                <time className="text-sm font-mono text-cyan-400/90">{update.date}</time>
              </div>
              <h3 className="text-lg font-bold text-white">{update.title}</h3>
            </div>

            {/* 更新項目リスト */}
            <ul className="space-y-3">
              {update.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3">
                  {item.tag && (
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${TAG_CONFIG[item.tag].color}`}
                    >
                      {TAG_CONFIG[item.tag].label}
                    </span>
                  )}
                  <span className="leading-relaxed text-white/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* 今後の更新予定セクション（オプション） */}
      <div className="mt-8 rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-white/50">今後のアップデートをお楽しみに...</p>
      </div>
    </div>
  );
}
