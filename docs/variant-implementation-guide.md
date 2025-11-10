# アクションバリアント実装ガイド

新しい技（アクションバリアント）を追加する際の手順とルール

## 前提知識

### バリアントとは
各感情（Rage/Terror/Grief/Ecstasy）のアクションには複数のバリアント（技）が存在します。
プレイヤーは戦闘前に各感情ごとに1つのバリアントを選択します。

### 感情と効果タイプの対応
- **Rage（激怒）**: 攻撃・ダメージ系
- **Terror（恐怖）**: デバフ・妨害系
- **Grief（悲嘆）**: 回復・防御系
- **Ecstasy（恍惚）**: バフ・コメント操作系

---

## 実装手順

### 1. 型定義の追加

**ファイル**: `src/lib/battle-v2/types.ts`

#### 1.1 バリアント型に追加

該当する感情のバリアント型にIDを追加：

```typescript
// Ecstasyの例
export type EcstasyVariant = 'inspire' | 'convert' | 'comment_boost';
```

#### 1.2 必要に応じてBattleStateを拡張

永続的な状態が必要な場合、`BattleState`にフィールドを追加：

```typescript
export interface BattleState {
  // 既存フィールド...
  permanentCommentBoost: number; // 永続的なコメント追加量補正
}
```

#### 1.3 UIメッセージが必要な場合、TurnResultを拡張

```typescript
export interface TurnResult {
  // 既存フィールド...
  commentBoostApplied?: number; // このターンで増加した値
  currentCommentBoost?: number; // 現在の累積値
}
```

#### 1.4 新しい効果タイプが必要な場合

```typescript
export type SpecialEffectType =
  | 'extra_damage'
  | 'debuff'
  | 'drain'
  | 'buff'
  | 'poison'
  | 'cleanse'
  | 'your_new_effect'; // 新規追加
```

---

### 2. バリアント定義の追加

**ファイル**: `src/lib/battle-v2/actionVariants.ts`

該当する感情のバリアント定義オブジェクトに追加：

```typescript
export const ECSTASY_VARIANTS: Record<EcstasyVariant, ActionVariantDefinition> = {
  // 既存バリアント...
  comment_boost: {
    id: 'comment_boost',
    name: 'コメントブースト',
    nameJa: 'コメントブースト',
    description: '毎ターンのコメント追加量を永続的に+1（5回まで使用可能）',
    effectType: 'buff',
    magnitude: 1, // 効果量
    hasAttack: false, // 攻撃を行うか
    maxUses: 5, // 使用制限回数
  },
};
```

#### フィールドの説明
- **id**: バリアントの識別子（型定義と一致させる）
- **name/nameJa**: 技の名前
- **description**: 技の説明文
- **effectType**: 効果の種類（既存のSpecialEffectTypeから選択）
- **magnitude**: 効果の強さ（%やダメージ量など）
- **duration**: 効果の持続ターン数（バフ/デバフの場合）
- **hasAttack**: 攻撃を伴うか（true: 通常攻撃あり、false: 特殊効果のみ）
- **maxUses**: 使用可能回数
- **metadata**: 追加のメタデータ（オプション）

---

### 3. 特殊効果処理の実装

**ファイル**: `src/lib/battle-v2/specialEffects.ts`

#### 3.1 効果処理関数を追加

```typescript
/**
 * Ecstasy - コメントブースト効果: 永続的にコメント追加量を増やす
 * @param variant バリアント定義
 * @returns コメント追加量の増加値
 */
export function applyEcstasyCommentBoostEffect(
  variant: { magnitude: number }
): number {
  return variant.magnitude;
}
```

#### 命名規則
- `apply{Emotion}{VariantName}Effect`
- 例: `applyEcstasyCommentBoostEffect`, `applyRagePercentageEffect`

#### 戻り値の型
- **数値**: ダメージ量、回復量など単一の値
- **SpecialEffect**: バフ/デバフオブジェクト
- **カスタム型**: コメント変換など特殊な処理の結果

---

### 4. ターン処理での適用

**ファイル**: `src/lib/battle-v2/turnProcessor.ts`

#### 4.1 インポートに追加

```typescript
import {
  // 既存...
  applyEcstasyCommentBoostEffect,
} from './specialEffects';
```

#### 4.2 SpecialEffectResult型を拡張（必要に応じて）

```typescript
interface SpecialEffectResult {
  extraDamage: number;
  healing: number;
  playerEffects: SpecialEffect[];
  enemyEffects: SpecialEffect[];
  convertedComments?: Comment[];
  commentConversion?: CommentConversionSummary;
  commentBoost?: number; // 新規追加
}
```

#### 4.3 triggerSpecialEffects関数に処理を追加

```typescript
case 'ecstasy':
  if (selectedVariant === 'inspire') {
    // 既存処理...
  } else if (selectedVariant === 'comment_boost') {
    result.commentBoost = applyEcstasyCommentBoostEffect(variantDef);
  }
  break;
```

#### 4.4 processTurn関数で状態を更新

```typescript
// 特殊効果の結果を処理
let updatedPermanentCommentBoost = state.permanentCommentBoost ?? 0;
if (playerSpecialEffects.commentBoost && playerSpecialEffects.commentBoost > 0) {
  updatedPermanentCommentBoost += playerSpecialEffects.commentBoost;
}

// ターン結果を作成
const turnResult: TurnResult = {
  // 既存フィールド...
  commentBoostApplied: playerSpecialEffects.commentBoost,
  currentCommentBoost: updatedPermanentCommentBoost,
};

// 状態を更新して返す
return {
  ...state,
  permanentCommentBoost: updatedPermanentCommentBoost,
  // 既存フィールド...
};
```

---

### 5. バトルエンジンでの初期化・適用

**ファイル**: `src/lib/battle-v2/battleEngine.ts`

#### 5.1 initBattle関数で状態を初期化

```typescript
return {
  // 既存フィールド...
  permanentCommentBoost: 0,
};
```

#### 5.2 継続的な効果の適用

例：コメント生成時に永続効果を適用

```typescript
// コメント生成時に永続的なブーストを適用
const commentCount = updatedState.config.commentsPerTurn + (updatedState.permanentCommentBoost ?? 0);
const newComments = generateComments(
  { count: commentCount },
  updatedState.currentTurn
);
```

---

### 6. UIでのメッセージ表示

**ファイル**: `src/components/battle-v2/BattleContainer.tsx`

#### 6.1 buildTurnMessages関数に追加

**表示タイミング**:
- ダメージ系: プレイヤー/敵の攻撃メッセージの直後
- バフ/デバフ系: `buildEffectMessages`と同じタイミング
- 持続ダメージ系（毒・呪いなど）: **毒ダメージの直後**
- その他: 効果の性質に応じて適切な位置

**コメントブーストの例**（バフメッセージの直後）:

```typescript
messages.push(
  ...buildEffectMessages(specialEffects.player, 'player', handlers.onPlayerEffect)
);

if (result.commentBoostApplied && result.commentBoostApplied > 0) {
  messages.push(
    createMessage(
      'system',
      `コメント追加量が+${result.commentBoostApplied}増加した！（現在+${result.currentCommentBoost}）`
    )
  );
}
```

**持続ダメージの例**（毒ダメージの直後）:

```typescript
// 毒ダメージのメッセージ
if (secondaryEffects.player.poisonDamage > 0) {
  messages.push(
    createMessage(
      'system',
      `あなたは毒で ${secondaryEffects.player.poisonDamage} のダメージを受けた！`,
      () => handlers.onPlayerPoison?.(secondaryEffects.player.poisonDamage)
    )
  );
}

// 呪いダメージのメッセージ
if (secondaryEffects.player.curseDamage > 0) {
  messages.push(
    createMessage(
      'system',
      `あなたは呪いで ${secondaryEffects.player.curseDamage} のダメージを受けた！`,
      () => handlers.onPlayerCurse?.(secondaryEffects.player.curseDamage)
    )
  );
}
```

#### 6.2 ダメージ処理関数の追加（持続ダメージの場合）

持続ダメージ効果の場合、専用のダメージ処理関数を追加：

```typescript
const applyPlayerCurseDamage = (amount: number) => {
  if (amount <= 0) return;
  setBattleState((prev) => {
    if (!prev) return prev;
    const nextHp = Math.max(0, prev.player.hp - amount);
    accurateHpRef.current.player = nextHp;
    return {
      ...prev,
      player: { ...prev.player, hp: nextHp },
    };
  });
};
```

そして`buildTurnMessages`の`handlers`に渡す：

```typescript
const turnMessages = buildTurnMessages(
  turnResult,
  {
    // 既存...
    onPlayerCurse: applyPlayerCurseDamage,
    onEnemyCurse: applyEnemyCurseDamage,
  },
  // ...
);
```

#### 6.3 技名の色付け表示

技名を感情カラーで色付け表示する場合、HTMLタグを使用：

```typescript
const playerOpening =
  playerSkillName.length > 0
    ? `あなたは <span style="color: ${playerColor}; font-weight: bold;">${playerSkillName}</span> を発動！`
    : `あなたは ${playerEmotionName} を繰り出した！`;
```

**重要**: `TypewriterText`コンポーネントはHTML対応しているため、`<span>`タグなどが正しくレンダリングされます。

#### メッセージの口調
- 「〜した！」「〜を受けた！」「〜が発動！」など、既存メッセージと統一
- 「〜されました」「〜になりました」のような丁寧語は使わない

---

### 7. バフ/デバフアイコンの追加（バフ/デバフ付与技の場合のみ）

**重要**: バフやデバフを付与する技では、アイコン表示も実装が必要です。

#### 7.1 アイコンSVGコンポーネントの追加

**ファイル**: `src/components/battle-v2/icons.tsx`

新しいアイコンのSVGコンポーネントを追加：

```typescript
export function YourNewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* SVGパスを記述 */}
      <path d="..." />
    </svg>
  );
}
```

**アイコンデザインのポイント**:
- 24x24のviewBox
- strokeWidth: 1.8 が標準
- シンプルでわかりやすいデザイン
- 効果の性質を視覚的に表現

#### 7.2 アイコン設定の追加

**ファイル**: `src/components/battle-v2/ActiveEffectIcons.tsx`

1. アイコンをインポート：

```typescript
import { ShieldIcon, SparkIcon, AttackDownIcon, PoisonIcon, YourNewIcon } from './icons';
```

2. `ICON_CONFIG`に設定を追加：

```typescript
const ICON_CONFIG: Partial<Record<SpecialEffect['type'], IconConfig>> = {
  buff: { color: '#d97706', Icon: SparkIcon },
  debuff: { color: '#15803d', Icon: AttackDownIcon },
  poison: { color: '#a855f7', Icon: PoisonIcon },
  your_new_effect: { color: '#カラーコード', Icon: YourNewIcon }, // 新規追加
};
```

**カラーの選び方**:
- バフ系: オレンジ・黄色系（#d97706, #f59e0b など）
- デバフ系: 緑・青系（#15803d, #0891b2 など）
- 毒・持続ダメージ系: 紫系（#a855f7, #9333ea など）
- 防御系: 青・シアン系（#0284c7, #06b6d4 など）

**注意**: アイコンの追加は、バフ/デバフを**付与する技**のみ必要です。コメントブーストのような永続効果の場合は不要です。

---

### 8. 持続ダメージ効果の実装（毒・呪いなど）

持続ダメージ効果を実装する場合、以下の手順で実装します。

#### 8.1 型定義の追加

**ファイル**: `src/lib/battle-v2/types.ts`

1. `SpecialEffectType`に新しい効果タイプを追加：

```typescript
export type SpecialEffectType =
  | 'extra_damage'
  | 'debuff'
  | 'drain'
  | 'buff'
  | 'poison'
  | 'curse'  // 新規追加
  | 'cleanse';
```

2. `TurnResult.secondaryEffects`に専用フィールドを追加：

```typescript
secondaryEffects: {
  player: {
    extraDamage: number;
    healing: number;
    poisonDamage: number;
    curseDamage: number;  // 新規追加
  };
  enemy: {
    extraDamage: number;
    healing: number;
    poisonDamage: number;
    curseDamage: number;  // 新規追加
  };
};
```

#### 8.2 計算関数の追加

**ファイル**: `src/lib/battle-v2/specialEffects.ts`

ダメージ計算関数を追加：

```typescript
/**
 * 呪い効果によるダメージを計算・適用（割合ダメージ）
 * @param effects 有効な効果リスト
 * @param maxHp 対象の最大HP
 * @returns 呪いダメージの合計
 */
export function calculateCurseDamage(effects: SpecialEffect[], maxHp: number): number {
  const curseEffects = effects.filter((e) => e.type === 'curse');
  const totalPercentage = curseEffects.reduce((total, effect) => total + effect.magnitude, 0);
  return Math.round(maxHp * (totalPercentage / 100));
}
```

#### 8.3 ターン処理での適用

**ファイル**: `src/lib/battle-v2/turnProcessor.ts`

1. インポートに追加：

```typescript
import {
  // 既存...
  calculateCurseDamage,
} from './specialEffects';
```

2. `processTurn`関数内でダメージ計算と適用（毒ダメージの直後）：

```typescript
// 5.6. 呪いダメージの適用（ターン開始時の効果）
const playerCurseDamage = calculateCurseDamage(updatedPlayer.activeEffects, updatedPlayer.maxHp);
const enemyCurseDamage = calculateCurseDamage(updatedEnemy.activeEffects, updatedEnemy.maxHp);

if (playerCurseDamage > 0) {
  updatedPlayer = {
    ...updatedPlayer,
    hp: Math.max(0, updatedPlayer.hp - playerCurseDamage),
  };
}

if (enemyCurseDamage > 0) {
  updatedEnemy = {
    ...updatedEnemy,
    hp: Math.max(0, updatedEnemy.hp - enemyCurseDamage),
  };
}
```

3. `TurnResult`オブジェクトに追加：

```typescript
secondaryEffects: {
  player: {
    extraDamage: playerExtraDamage,
    healing: playerHealing,
    poisonDamage: playerPoisonDamage,
    curseDamage: playerCurseDamage,  // 追加
  },
  enemy: {
    extraDamage: enemyExtraDamage,
    healing: enemyHealing,
    poisonDamage: enemyPoisonDamage,
    curseDamage: enemyCurseDamage,  // 追加
  },
},
```

#### 8.4 デバフ扱いの効果の場合

呪いなどをデバフとして扱う場合、以下も追加：

1. **Hellfireなどデバフカウント技への追加**：

```typescript
// debuff_scaling (Hellfire)
const debuffCount = defender.activeEffects.filter(
  (effect) => effect.type === 'debuff' || effect.type === 'poison' || effect.type === 'curse'
).length;
```

2. **Pure Refineなどのクレンジング対象への追加**：

```typescript
const cleanseEffectFilter = (effect: ActiveEffectExtended, target: 'player' | 'enemy') =>
  !(
    (effect.type === 'cleanse' || effect.type === 'debuff' || effect.type === 'poison' || effect.type === 'curse') &&
    effect.target === target
  );
```

#### 8.5 説明文の追加

**ファイル**: `src/lib/battle-v2/specialEffects.ts`

`getEffectDescription`関数に説明を追加：

```typescript
switch (effect.type) {
  // 既存...
  case 'curse':
    return `${emotionName}: 呪い (最大HPの${effect.magnitude}%ダメージ/ターン, 残り${effect.duration}ターン)`;
  // ...
}
```

---

## チェックリスト

新しいバリアントを実装する際は、以下を確認：

### 必須項目
- [ ] `types.ts`: バリアント型に追加
- [ ] `actionVariants.ts`: バリアント定義を追加
- [ ] `specialEffects.ts`: 効果処理関数を実装
- [ ] `turnProcessor.ts`: インポート追加
- [ ] `turnProcessor.ts`: `triggerSpecialEffects`に処理を追加
- [ ] `battleEngine.ts`: 初期化処理（必要な場合）
- [ ] `BattleContainer.tsx`: メッセージ表示（必要な場合）
- [ ] `npm run build`でビルドが通ることを確認
- [ ] ローカル環境で動作確認

### バフ/デバフ付与技の場合（追加項目）
- [ ] `icons.tsx`: アイコンSVGコンポーネントを追加
- [ ] `ActiveEffectIcons.tsx`: アイコンをインポート
- [ ] `ActiveEffectIcons.tsx`: `ICON_CONFIG`に設定を追加
- [ ] `ActiveEffectIcons.tsx`: ツールチップ表示に効果タイプを追加

### 持続ダメージ技の場合（追加項目）
- [ ] `types.ts`: `SpecialEffectType`に新効果タイプを追加
- [ ] `types.ts`: `TurnResult.secondaryEffects`に専用フィールド追加
- [ ] `specialEffects.ts`: ダメージ計算関数を追加（例: `calculateCurseDamage`）
- [ ] `turnProcessor.ts`: ターン開始時のダメージ計算・適用処理を追加
- [ ] `turnProcessor.ts`: `TurnResult`オブジェクトにダメージ値を追加
- [ ] `BattleContainer.tsx`: `buildTurnMessages`の`handlers`型定義を拡張
- [ ] `BattleContainer.tsx`: ダメージ処理関数を追加（例: `applyPlayerCurseDamage`）
- [ ] `BattleContainer.tsx`: メッセージ表示を追加（毒ダメージの直後）
- [ ] `BattleContainer.tsx`: `buildTurnMessages`呼び出しで`handlers`に追加
- [ ] デバフ扱いの場合: `turnProcessor.ts`の`cleanseEffectFilter`に追加
- [ ] デバフ扱いの場合: Hellfireなど関連技のデバフカウントに追加
- [ ] `specialEffects.ts`: `getEffectDescription`に説明を追加
- [ ] `icons.tsx`: アイコンSVGコンポーネントを追加
- [ ] `ActiveEffectIcons.tsx`: アイコン設定を追加

### オプション項目
- [ ] `types.ts`: `BattleState`に永続状態を追加（必要な場合）
- [ ] `types.ts`: `TurnResult`にメッセージ用フィールド追加（必要な場合）
- [ ] `types.ts`: 新しい`SpecialEffectType`を追加（必要な場合）
- [ ] `turnProcessor.ts`: `SpecialEffectResult`型を拡張（必要な場合）
- [ ] `turnProcessor.ts`: `processTurn`で状態を更新（必要な場合）
- [ ] `battleEngine.ts`: 継続的な効果を適用（必要な場合）

---

## ベストプラクティス

### 効果の設計
1. **既存システムの活用**: 可能な限り既存の`SpecialEffectType`を使用
2. **シンプルに**: 複雑な効果は複数のシンプルな効果の組み合わせで実装
3. **テスト容易性**: 極端な値でテストしやすい設計にする

### コードスタイル
1. **命名**: 他のバリアントと一貫性のある命名
2. **コメント**: 複雑な計算式には説明コメントを追加
3. **型安全性**: できるだけ型推論を活用し、`any`は避ける

### パフォーマンス
1. **不要な計算を避ける**: 条件分岐で早期リターン
2. **配列操作**: 大きな配列のコピーは最小限に
3. **メモ化**: 同じ計算を繰り返さない

### デバッグ
1. **console.log**: 開発中は`console.log`で値を確認
2. **リリース前**: 不要な`console.log`は削除
3. **型エラー**: ビルドエラーは必ず解決してからコミット

---

## よくあるパターン

### パターン1: 単純なダメージ追加
- 効果タイプ: `extra_damage`
- 必要なファイル: types.ts, actionVariants.ts, specialEffects.ts, turnProcessor.ts
- アイコン: **不要**

### パターン2: バフ/デバフ付与
- 効果タイプ: `buff` / `debuff`
- 持続ターン数: `duration`フィールドで指定
- UIメッセージ: `buildEffectMessages`が自動生成
- アイコン: **必須**（icons.tsx, ActiveEffectIcons.tsx）

### パターン3: 永続的な状態変更
- `BattleState`に永続フィールド追加
- `initBattle`で初期化
- `processTurn`で状態を更新
- UIメッセージ: カスタムメッセージを追加
- アイコン: **不要**（永続効果はアイコン不要）

### パターン4: コメントプール操作
- `ExtendedEffectTriggerParams`で`comments`を受け取る
- 変換後のコメント配列を返す
- `CommentConversionEvent`でUI表示
- アイコン: **不要**

### パターン5: 持続ダメージ効果（毒・呪いなど）
- 効果タイプ: `poison` / `curse` など新規型
- `TurnResult.secondaryEffects`に専用フィールド追加（例: `curseDamage`）
- `specialEffects.ts`に計算関数追加（例: `calculateCurseDamage`）
- `turnProcessor.ts`でターン開始時にダメージ計算・適用
- `BattleContainer.tsx`でダメージ処理関数とメッセージ表示
- デバフ扱いの場合: `cleanseEffectFilter`に追加、Hellfireなど関連技にも追加
- アイコン: **必須**（持続効果として表示）

---

## トラブルシューティング

### ビルドエラー: 型が一致しない
→ `types.ts`の定義と実装が一致しているか確認

### 効果が発動しない
→ `triggerSpecialEffects`のswitch文に処理を追加したか確認
→ `selectedVariant`の値が正しいか`console.log`で確認

### メッセージが表示されない
→ `TurnResult`にフィールドを追加したか確認
→ `turnResult`オブジェクトに値を設定したか確認
→ `buildTurnMessages`に表示処理を追加したか確認

### 使用回数が減らない
→ `maxUses`が正しく設定されているか確認
→ バリアント定義の`id`が型定義と一致しているか確認

### 持続ダメージが適用されない
→ `calculateXXXDamage`関数を`turnProcessor.ts`にインポートしたか確認
→ ダメージ計算処理を`processTurn`の適切な位置に追加したか確認
→ `TurnResult`に専用フィールドを追加したか確認

### 技名が色付けされない / HTMLタグがそのまま表示される
→ `TypewriterText`コンポーネントはHTML対応済みなので正しくレンダリングされるはず
→ `<span>`タグの記述が正しいか確認（閉じタグ漏れなど）
→ `buildTurnMessages`の`options`に`playerEmotion`, `enemyEmotion`を渡しているか確認

### アイコンが表示されない
→ `ICON_CONFIG`に追加したか確認
→ アイコンコンポーネントを正しくインポートしたか確認
→ `SpecialEffectType`と`ICON_CONFIG`のキーが一致しているか確認

---

## 参考実装例

### 簡単な例: Rage - 割合ダメージ
- ファイル: `docs/variant-implementation-guide.md` の近くに実装例を参照
- 既存バリアント: `percentage` (src/lib/battle-v2/actionVariants.ts:31-40)

### 複雑な例: Ecstasy - コメントブースト
- コミット: `11f0945`, `95fa2f0`
- 永続状態、UIメッセージ、継続効果の全てを含む

### 持続ダメージの例: Terror - 呪い
- コミット: `5a69945`
- 割合ダメージ、デバフ扱い、アイコン表示、技名色付けを含む

---

## 更新履歴
- 2025-11-10: 初版作成（コメントブースト実装経験を元に作成）
- 2025-11-10: セクション6追加（技名色付け表示のHTMLタグ対応）
- 2025-11-10: セクション8追加（持続ダメージ効果の実装手順）
- 2025-11-10: チェックリスト追加（持続ダメージ技の場合）
- 2025-11-10: トラブルシューティング追加（色付け、アイコン関連）
- 2025-11-10: パターン5追加（持続ダメージ効果）
