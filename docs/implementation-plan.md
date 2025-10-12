# 実装計画書（Implementation Plan）

**プロジェクト**: magical-arena-sim
**バージョン**: v0.1
**最終更新**: 2025-10-12
**デプロイ先**: Vercel

---

## 📋 目次

1. [実装フェーズ概要](#実装フェーズ概要)
2. [ディレクトリ構成](#ディレクトリ構成)
3. [技術スタック詳細](#技術スタック詳細)
4. [フェーズ別実装計画](#フェーズ別実装計画)
5. [データ構造設計](#データ構造設計)
6. [実装優先度](#実装優先度)

---

## 実装フェーズ概要

### Phase 1: プロジェクトセットアップ（1-2時間）
- Next.js プロジェクト初期化
- 開発環境構築（TypeScript、Tailwind CSS、ESLint、Prettier）
- 基本ディレクトリ構造作成
- Vercel デプロイ設定

### Phase 2: 型定義とコアロジック（3-4時間）
- TypeScript型定義の実装
- バトルロジックの純粋関数実装
- 単体テストの作成

### Phase 3: 状態管理とバトルフロー（2-3時間）
- React Hooks による状態管理
- ターン進行システム
- ログ管理

### Phase 4: UI実装（5-6時間）
- 共通コンポーネント
- トップ画面
- バトル画面
- リザルト画面

### Phase 5: 演出とブラッシュアップ（2-3時間）
- アニメーション追加
- レスポンシブ対応
- デバッグとテスト

### Phase 6: デプロイと調整（1時間）
- Vercel へのデプロイ
- 本番環境での動作確認

**総見積もり時間**: 14-19時間

---

## ディレクトリ構成

```
magical-arena-sim/
├── .github/
│   └── workflows/          # GitHub Actions（オプション）
├── docs/                   # ドキュメント
│   ├── requirements.md
│   ├── development-guidelines.md
│   ├── battle-system-spec.md
│   ├── ui-design.md
│   └── implementation-plan.md  # 本ファイル
├── public/                 # 静的アセット
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # ルートレイアウト
│   │   ├── page.tsx       # トップ画面
│   │   ├── battle/
│   │   │   └── page.tsx   # バトル画面
│   │   └── result/
│   │       └── page.tsx   # リザルト画面
│   ├── components/        # Reactコンポーネント
│   │   ├── ui/           # 共通UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Gauge.tsx
│   │   │   └── Badge.tsx
│   │   ├── battle/       # バトル関連コンポーネント
│   │   │   ├── PlayerStatus.tsx
│   │   │   ├── EnemyStatus.tsx
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── AudienceDisplay.tsx
│   │   │   ├── AntiGauge.tsx
│   │   │   ├── CommandIndicator.tsx
│   │   │   └── BattleLog.tsx
│   │   └── layout/       # レイアウトコンポーネント
│   │       └── Container.tsx
│   ├── lib/              # ビジネスロジック（純粋関数）
│   │   └── battle/
│   │       ├── types.ts          # バトル型定義
│   │       ├── constants.ts      # 定数定義
│   │       ├── judgement.ts      # 三すくみ判定
│   │       ├── damage.ts         # ダメージ計算
│   │       ├── fanSystem.ts      # ファン率計算
│   │       ├── antiGauge.ts      # アンチゲージ管理
│   │       ├── audienceCommand.ts # 観客指示生成
│   │       ├── turnProcessor.ts  # ターン処理
│   │       └── battleEngine.ts   # バトル全体制御
│   ├── hooks/            # カスタムフック
│   │   ├── useBattle.ts         # バトル状態管理
│   │   └── useBattleLog.ts      # ログ管理
│   ├── config/           # 設定ファイル
│   │   └── battleParams.ts      # バトルパラメータ
│   ├── types/            # グローバル型定義
│   │   └── index.ts
│   └── styles/           # グローバルスタイル
│       └── globals.css
├── tests/                # テストファイル
│   └── lib/
│       └── battle/
│           ├── judgement.test.ts
│           ├── damage.test.ts
│           └── fanSystem.test.ts
├── .eslintrc.json
├── .prettierrc
├── next.config.js        # Next.js設定（静的エクスポート不要）
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json           # Vercel設定（オプション）
└── README.md
```

---

## 技術スタック詳細

### フレームワーク・ライブラリ
- **Next.js 14+** (App Router)
  - Vercelとの完全な統合
  - 自動的な最適化とデプロイ
  - 静的エクスポート不要（Vercelが自動処理）
- **React 18+**
- **TypeScript 5+**

### スタイリング
- **Tailwind CSS 3+**
- **clsx / cn ユーティリティ** (条件付きクラス名)

### 状態管理
- **React Hooks** (`useState`, `useReducer`, `useContext`)
- 初期実装では外部ライブラリ不使用
- 拡張時に Zustand を検討

### テスト
- **Vitest** (高速なユニットテスト)
- **@testing-library/react**
- コアロジックのカバレッジ80%以上を目標

### リント・フォーマット
- **ESLint** (Next.js推奨設定)
- **Prettier**
- **TypeScript** strict モード

### デプロイ
- **Vercel**
  - GitHubリポジトリ連携
  - `main` ブランチへのpushで自動デプロイ
  - プレビュー環境の自動生成（PR単位）

---

## フェーズ別実装計画

### Phase 1: プロジェクトセットアップ

#### 1.1 Next.js プロジェクト初期化
```bash
npx create-next-app@latest magical-arena-sim \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --no-src-dir
```

その後、`src/` ディレクトリに移行

#### 1.2 追加パッケージインストール
```bash
npm install clsx
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D prettier eslint-config-prettier
```

#### 1.3 設定ファイル作成
- `next.config.js`: 基本設定（Vercel用に静的エクスポート設定は不要）
- `.prettierrc`: フォーマット設定
- `vitest.config.ts`: テスト設定
- `tailwind.config.ts`: カスタムカラー・テーマ設定

#### 1.4 ディレクトリ構造作成
空のディレクトリとプレースホルダーファイルを作成

#### 1.5 Vercel プロジェクト設定
- Vercel CLIのインストール: `npm i -g vercel`
- プロジェクトのリンク: `vercel link`
- 環境変数設定（必要な場合）

---

### Phase 2: 型定義とコアロジック

#### 2.1 型定義 (`src/lib/battle/types.ts`)
```typescript
// 行動タイプ
export type ActionType = 'attack' | 'appeal' | 'guard';

// 勝敗結果
export type BattleResult = 'win' | 'draw' | 'lose';

// 観客指示
export type AudienceCommand =
  | { type: 'attack'; message: '攻撃しろ！' }
  | { type: 'appeal'; message: 'アピールして！' }
  | { type: 'guard_forbid'; message: 'ガードするな！' };

// アンチレベル
export type AntiLevel = 0 | 1 | 2 | 3;

// 戦闘者の状態
export interface Combatant {
  hp: number;
  maxHp: number;
  basePower: number;
}

// プレイヤー固有の状態
export interface PlayerState extends Combatant {
  fanRate: number;        // 0.0 ~ 1.0
  antiGauge: number;      // 0 ~ 100
  antiLevel: AntiLevel;
}

// 敵の状態
export interface EnemyState extends Combatant {
  fanRate: number;
}

// 観客構成
export interface AudienceComposition {
  enemyFans: number;    // 0.0 ~ 1.0
  neutralFans: number;  // 0.0 ~ 1.0
  playerFans: number;   // 0.0 ~ 1.0
}

// ターン結果
export interface TurnResult {
  turnNumber: number;
  playerAction: ActionType;
  enemyAction: ActionType;
  judgement: BattleResult;
  audienceCommand: AudienceCommand;
  commandFollowed: boolean;
  damage: {
    toEnemy: number;
    toPlayer: number;
  };
  fanChange: {
    player: number;
    enemy: number;
  };
  antiChange: number;
  playerState: PlayerState;
  enemyState: EnemyState;
  audienceComposition: AudienceComposition;
  message: string;
}

// バトル全体の状態
export interface BattleState {
  isActive: boolean;
  currentTurn: number;
  player: PlayerState;
  enemy: EnemyState;
  audience: AudienceComposition;
  currentCommand: AudienceCommand;
  turnHistory: TurnResult[];
  winner: 'player' | 'enemy' | null;
}
```

#### 2.2 定数定義 (`src/config/battleParams.ts`)
```typescript
export const BATTLE_PARAMS = {
  // 基本パラメータ
  INITIAL_HP: 1000,
  BASE_POWER: 100,

  // 技倍率
  ATTACK_MULTIPLIER: 1.2,
  APPEAL_MULTIPLIER: 0.0,
  GUARD_MULTIPLIER: 0.0,
  GUARD_DAMAGE_REDUCTION: 0.2, // 80%カット = 20%のダメージ

  // ファン率変動
  FAN_CHANGE: {
    WIN: 0.10,
    DRAW_WIN: 0.05,
    LOSE: -0.05,
    COMMAND_FOLLOW: 0.05,
    COMMAND_BREAK: -0.05,
    APPEAL_SUCCESS: 0.10,
    GUARD_SUCCESS: 0.03,
  },

  // アンチゲージ変動
  ANTI_CHANGE: {
    ATTACK: 5,
    APPEAL_SUCCESS: -15,
    GUARD_SUCCESS: -5,
    COMMAND_BREAK_ATTACK: 10,
    COMMAND_BREAK_APPEAL: 10,
    COMMAND_BREAK_GUARD: 15,
  },

  // アンチレベル閾値
  ANTI_THRESHOLDS: {
    LV1: 30,
    LV2: 60,
    LV3: 90,
  },

  // アンチレベル効果
  ANTI_EFFECTS: {
    LV0: { fanPenalty: 0, powerPenalty: 1.0 },
    LV1: { fanPenalty: 0.20, powerPenalty: 0.9 },
    LV2: { fanPenalty: 0.40, powerPenalty: 0.8 },
    LV3: { fanPenalty: 1.0, powerPenalty: 0.5 },
  },

  // ブーイングLv3効果
  BOOING_LV3: {
    FAN_LOSS: -0.10,
    ANTI_REDUCTION: -30,
  },

  // 観客指示出現確率
  COMMAND_PROBABILITY: {
    ATTACK: 0.4,
    APPEAL: 0.3,
    GUARD_FORBID: 0.3,
  },

  // 初期観客構成
  INITIAL_AUDIENCE: {
    ENEMY_FANS: 0.20,
    NEUTRAL_FANS: 0.70,
    PLAYER_FANS: 0.10,
  },

  // ファン率による火力補正
  FAN_POWER_BONUS: [
    { threshold: 0.0, multiplier: 1.0 },
    { threshold: 0.21, multiplier: 1.2 },
    { threshold: 0.51, multiplier: 1.5 },
    { threshold: 0.81, multiplier: 2.0 },
  ],
} as const;
```

#### 2.3 コアロジック実装

**2.3.1 三すくみ判定** (`src/lib/battle/judgement.ts`)
```typescript
import type { ActionType, BattleResult } from './types';

export function judgeAction(
  playerAction: ActionType,
  enemyAction: ActionType
): BattleResult {
  if (playerAction === enemyAction) return 'draw';

  const winConditions: Record<ActionType, ActionType> = {
    attack: 'appeal',
    appeal: 'guard',
    guard: 'attack',
  };

  return winConditions[playerAction] === enemyAction ? 'win' : 'lose';
}
```

**2.3.2 ダメージ計算** (`src/lib/battle/damage.ts`)
```typescript
import { BATTLE_PARAMS } from '@/config/battleParams';
import type { ActionType, BattleResult } from './types';

export function calculateDamage(params: {
  action: ActionType;
  basePower: number;
  fanRate: number;
  antiLevel: 0 | 1 | 2 | 3;
  result: BattleResult;
  isDefending: boolean;
}): number {
  const { action, basePower, fanRate, antiLevel, result, isDefending } = params;

  // 敗北時はダメージなし
  if (result === 'lose') return 0;

  // 技倍率
  let multiplier = 1.0;
  if (action === 'attack') multiplier = BATTLE_PARAMS.ATTACK_MULTIPLIER;
  if (action === 'appeal') multiplier = BATTLE_PARAMS.APPEAL_MULTIPLIER;
  if (action === 'guard') multiplier = BATTLE_PARAMS.GUARD_MULTIPLIER;

  // ファン補正
  const fanBonus = getFanPowerBonus(fanRate);

  // アンチ補正
  const antiPenalty = BATTLE_PARAMS.ANTI_EFFECTS[`LV${antiLevel}`].powerPenalty;

  // 基礎ダメージ
  let damage = basePower * multiplier * fanBonus * antiPenalty;

  // 防御側の軽減
  if (isDefending) {
    damage *= BATTLE_PARAMS.GUARD_DAMAGE_REDUCTION;
  }

  return Math.floor(damage);
}

function getFanPowerBonus(fanRate: number): number {
  const bonuses = BATTLE_PARAMS.FAN_POWER_BONUS;
  for (let i = bonuses.length - 1; i >= 0; i--) {
    if (fanRate >= bonuses[i].threshold) {
      return bonuses[i].multiplier;
    }
  }
  return 1.0;
}
```

**2.3.3 ファンシステム** (`src/lib/battle/fanSystem.ts`)

**2.3.4 アンチゲージ管理** (`src/lib/battle/antiGauge.ts`)

**2.3.5 観客指示生成** (`src/lib/battle/audienceCommand.ts`)

**2.3.6 ターン処理** (`src/lib/battle/turnProcessor.ts`)

**2.3.7 バトルエンジン** (`src/lib/battle/battleEngine.ts`)

---

### Phase 3: 状態管理とバトルフロー

#### 3.1 カスタムフック実装 (`src/hooks/useBattle.ts`)
```typescript
import { useReducer, useCallback } from 'react';
import type { BattleState, ActionType } from '@/lib/battle/types';
import { initBattle, processTurn, checkWinCondition } from '@/lib/battle/battleEngine';

type BattleAction =
  | { type: 'START_BATTLE' }
  | { type: 'PLAYER_ACTION'; payload: ActionType }
  | { type: 'RESET_BATTLE' };

function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case 'START_BATTLE':
      return initBattle();
    case 'PLAYER_ACTION':
      return processTurn(state, action.payload);
    case 'RESET_BATTLE':
      return initBattle();
    default:
      return state;
  }
}

export function useBattle() {
  const [state, dispatch] = useReducer(battleReducer, null, initBattle);

  const startBattle = useCallback(() => {
    dispatch({ type: 'START_BATTLE' });
  }, []);

  const selectAction = useCallback((action: ActionType) => {
    dispatch({ type: 'PLAYER_ACTION', payload: action });
  }, []);

  const resetBattle = useCallback(() => {
    dispatch({ type: 'RESET_BATTLE' });
  }, []);

  return {
    state,
    startBattle,
    selectAction,
    resetBattle,
  };
}
```

#### 3.2 ログ管理フック (`src/hooks/useBattleLog.ts`)

---

### Phase 4: UI実装

#### 4.1 共通コンポーネント
- `Button.tsx`: ボタンコンポーネント
- `Card.tsx`: カード型コンテナ
- `Gauge.tsx`: HPゲージ、アンチゲージ
- `Badge.tsx`: ステータスバッジ

#### 4.2 バトルコンポーネント
- `PlayerStatus.tsx`: プレイヤー状態表示
- `EnemyStatus.tsx`: 敵状態表示
- `ActionButtons.tsx`: 行動選択ボタン
- `AudienceDisplay.tsx`: 観客構成グラフ
- `AntiGauge.tsx`: アンチゲージ専用表示
- `CommandIndicator.tsx`: 観客指示表示
- `BattleLog.tsx`: ターンログ一覧

#### 4.3 ページ実装
- `app/page.tsx`: トップ画面
- `app/battle/page.tsx`: バトル画面
- `app/result/page.tsx`: リザルト画面

#### 4.4 スタイリング
Tailwind CSS カスタムテーマ設定:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'arena-bg': '#0f1014',
        'arena-enemy': '#d15073',
        'arena-player': '#4ea8de',
        'arena-neutral': '#f4c152',
        'arena-text': '#f3f4f6',
        'arena-subtext': '#9ca3af',
        'arena-anti-lv1': '#f97316',
        'arena-anti-lv2': '#f43f5e',
        'arena-anti-lv3': '#ef4444',
      },
    },
  },
};
```

---

### Phase 5: 演出とブラッシュアップ

#### 5.1 アニメーション
- フェードイン/アウト
- ダメージ数値のポップアップ
- ゲージの滑らかな変化
- ブーイング時の画面振動効果

#### 5.2 レスポンシブ対応
- 横幅 1024px を基準
- モバイルは横画面推奨メッセージ

#### 5.3 デバッグ機能（開発用）
- パラメータ調整UI
- ターンスキップ機能

---

### Phase 6: デプロイと調整

#### 6.1 Vercelへのデプロイ
```bash
# 初回デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

または GitHub連携による自動デプロイ:
1. GitHubリポジトリとVercelを連携
2. `main` ブランチへのpushで自動デプロイ
3. Pull Requestごとにプレビュー環境が自動生成

#### 6.2 動作確認項目
- [ ] 全行動パターンの動作確認
- [ ] アンチLv3ブーイング発動確認
- [ ] 勝利条件の確認
- [ ] ログの正確性確認
- [ ] レスポンシブ表示確認

---

## データ構造設計

### 初期状態
```typescript
const INITIAL_BATTLE_STATE: BattleState = {
  isActive: false,
  currentTurn: 0,
  player: {
    hp: 1000,
    maxHp: 1000,
    basePower: 100,
    fanRate: 0.10,
    antiGauge: 0,
    antiLevel: 0,
  },
  enemy: {
    hp: 1000,
    maxHp: 1000,
    basePower: 100,
    fanRate: 0.20,
  },
  audience: {
    enemyFans: 0.20,
    neutralFans: 0.70,
    playerFans: 0.10,
  },
  currentCommand: generateAudienceCommand(),
  turnHistory: [],
  winner: null,
};
```

---

## 実装優先度

### 🔴 最優先（Phase 1-2）
- プロジェクトセットアップ
- 型定義
- コアロジック（三すくみ、ダメージ計算、ファン計算、アンチゲージ）

### 🟡 高優先（Phase 3）
- 状態管理
- ターン進行システム

### 🟢 中優先（Phase 4）
- 基本UI実装
- バトル画面の動作確認

### 🔵 低優先（Phase 5-6）
- アニメーション
- デバッグUI
- デプロイ

---

## テスト戦略

### ユニットテスト対象
- `judgement.ts`: 全パターンの三すくみ判定
- `damage.ts`: ダメージ計算の境界値テスト
- `fanSystem.ts`: ファン率変動ロジック
- `antiGauge.ts`: アンチゲージ更新とレベル判定

### 統合テスト
- `turnProcessor.ts`: 1ターンの完全な処理フロー
- `battleEngine.ts`: バトル開始から終了まで

### E2Eテスト（オプション）
- Playwright でのブラウザテスト

---

## リスク管理

### 技術的リスク
| リスク | 対策 |
|--------|------|
| 複雑なステート管理 | useReducer でシンプルに保つ |
| パフォーマンス低下 | useMemo/useCallback の適切な使用 |
| アニメーション重複 | CSS transition を基本とする |

### スケジュールリスク
| リスク | 対策 |
|--------|------|
| Phase 4 の遅延 | 最小限のUIで動作確認を優先 |
| デバッグ工数増加 | ユニットテストで事前に品質担保 |

---

## 次のステップ

1. ✅ 実装計画の確定
2. ⬜ Phase 1 実行: プロジェクトセットアップ
3. ⬜ Phase 2 実行: コアロジック実装
4. ⬜ 中間レビュー
5. ⬜ Phase 3-4 実行: UI実装
6. ⬜ Phase 5-6 実行: デプロイ

---

**備考**:
- 各フェーズ完了時にコミットを作成し、進捗を明確にする。
- 仕様変更が発生した場合は `docs/battle-system-spec.md` と本計画書を同期する。
- Vercel でのデプロイは GitHub 連携により完全自動化可能。
