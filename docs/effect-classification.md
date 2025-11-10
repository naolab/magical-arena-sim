# 特殊効果の分類ガイド

バフ・デバフのカウントやクレンジング対象の判定に使用する、効果タイプの分類ルール

---

## 効果分類の概要

### バフ（味方に有利な効果）
プレイヤーまたは敵の能力を向上させる効果。攻撃力上昇などがこれに該当。

### デバフ（敵に不利な効果）
プレイヤーまたは敵の能力を低下させたり、継続ダメージを与える効果。攻撃力低下、毒、呪いなどがこれに該当。

### 中立効果
バフでもデバフでもない、特殊な処理を行う効果。

---

## 現在の効果タイプ分類

### バフとして扱う効果

| 効果タイプ | 名前 | 説明 | 実装例 |
|----------|------|------|--------|
| `buff` | バフ | 攻撃力上昇などの能力向上 | トランスブースト (Ecstasy - inspire) |

**カウント対象**:
- バフ数依存の技（未実装、今後追加予定）

### デバフとして扱う効果

| 効果タイプ | 名前 | 説明 | 実装例 |
|----------|------|------|--------|
| `debuff` | デバフ | 攻撃力低下などの能力減少 | ディミニッシュテラー (Terror - weaken) |
| `poison` | 毒 | 固定値の持続ダメージ | ヴェノムナイトメア (Terror - poison) |
| `curse` | 呪い | 割合の持続ダメージ | カースドシャドウ (Terror - curse) |

**カウント対象**:
- ヘルファイア・スパイク (Rage - debuff_scaling): デバフ数に応じて追撃ダメージ
- ピュアリファイン (Grief - cleanse_heal): デバフを全て解除

**クレンジング対象**: これらの効果は`cleanse`効果で解除可能

### 中立効果（バフでもデバフでもない）

| 効果タイプ | 名前 | 説明 | 実装例 |
|----------|------|------|--------|
| `extra_damage` | 追加ダメージ | 攻撃時の追加ダメージ（一時的） | バーストレイジ (Rage - explosive) |
| `drain` | HP吸収 | ダメージを与えて回復（一時的） | ソウルドレイン (Grief - drain) |
| `cleanse` | クレンジング | デバフを解除する効果 | ピュアリファイン (Grief - cleanse_heal) |

**カウント対象外**: これらはバフ・デバフのカウントに含めない

---

## コード実装での判定方法

### デバフのカウント

デバフをカウントする場合、以下のフィルターを使用：

```typescript
// デバフ効果のみを抽出
const debuffs = effects.filter(
  (effect) => effect.type === 'debuff' || effect.type === 'poison' || effect.type === 'curse'
);
const debuffCount = debuffs.length;
```

**使用例**:
- ヘルファイア・スパイク: `const debuffCount = defender.activeEffects.filter((effect) => effect.type === 'debuff' || effect.type === 'poison' || effect.type === 'curse').length;`

### バフのカウント

バフをカウントする場合、以下のフィルターを使用：

```typescript
// バフ効果のみを抽出
const buffs = effects.filter((effect) => effect.type === 'buff');
const buffCount = buffs.length;
```

**使用例**（今後実装予定）:
- バフ数依存の技: バフの数に応じて効果が変わる

### クレンジング対象の判定

デバフを解除する際は、以下のフィルターを使用：

```typescript
// デバフを除外（クレンジング）
const cleanseEffectFilter = (effect: ActiveEffectExtended, target: 'player' | 'enemy') =>
  !(
    (effect.type === 'cleanse' || effect.type === 'debuff' || effect.type === 'poison' || effect.type === 'curse') &&
    effect.target === target
  );

const cleanedEffects = effects.filter((effect) => cleanseEffectFilter(effect, 'player'));
```

**使用例**:
- ピュアリファイン: プレイヤーのデバフを全て解除

---

## 新しい効果を追加する際のルール

### バフとして扱うべき効果

以下のいずれかに該当する場合、バフとして扱う：

1. **能力を向上させる**: 攻撃力、防御力、速度などのステータスが上昇
2. **有利な状態を付与**: 回避率上昇、反射、バリアなど
3. **ポジティブな効果**: プレイヤーにとって有利な状態変化

**実装時の注意**:
- 効果タイプは既存の`buff`を使用するか、明確にバフとわかる新しいタイプを追加
- バフカウント処理に追加が必要な場合は、判定ロジックを更新

### デバフとして扱うべき効果

以下のいずれかに該当する場合、デバフとして扱う：

1. **能力を低下させる**: 攻撃力、防御力、速度などのステータスが減少
2. **不利な状態を付与**: 命中率低下、スタン、混乱など
3. **継続ダメージ**: 毒、呪い、出血などのダメージ効果
4. **ネガティブな効果**: プレイヤーにとって不利な状態変化

**実装時の注意**:
- 効果タイプは`debuff`系（既存: `debuff`, `poison`, `curse`）を使用
- デバフカウント処理に追加：ヘルファイアなどの判定ロジックを更新
- クレンジング対象に追加：`cleanseEffectFilter`に新しい効果タイプを追加

### 中立効果として扱うべき効果

以下のいずれかに該当する場合、中立効果として扱う：

1. **一時的な効果**: 継続せず、その場で処理が完結する
2. **特殊処理**: バフ・デバフの枠組みに収まらない効果
3. **メタ効果**: 他の効果を操作する効果（クレンジング、変換など）

**実装時の注意**:
- バフ・デバフのカウント対象外
- クレンジング対象外（ただし`cleanse`自体は例外）

---

## チェックリスト：新しい効果を追加する際

### 効果タイプの決定
- [ ] この効果はバフか？（能力向上、有利な状態）
- [ ] この効果はデバフか？（能力低下、不利な状態、継続ダメージ）
- [ ] この効果は中立か？（一時的、特殊処理）

### バフとして扱う場合
- [ ] `types.ts`: `SpecialEffectType`に追加（既存の`buff`を使うか新規追加）
- [ ] 今後のバフカウント処理で使用する可能性を考慮
- [ ] このドキュメントの「バフとして扱う効果」テーブルに追加

### デバフとして扱う場合
- [ ] `types.ts`: `SpecialEffectType`に追加（`debuff`系の命名）
- [ ] ヘルファイア: `turnProcessor.ts`のデバフカウント判定に追加
- [ ] ピュアリファイン: `turnProcessor.ts`の`cleanseEffectFilter`に追加
- [ ] 他のデバフ依存技がある場合、それらの判定にも追加
- [ ] このドキュメントの「デバフとして扱う効果」テーブルに追加

### 中立効果として扱う場合
- [ ] `types.ts`: `SpecialEffectType`に追加
- [ ] カウント・クレンジング処理には追加しない
- [ ] このドキュメントの「中立効果」テーブルに追加

---

## 今後の拡張予定

### バフ数依存の技（例）

```typescript
// バフの数に応じて効果が変わる技
const buffCount = attacker.activeEffects.filter((effect) => effect.type === 'buff').length;
const multiplier = 1 + buffCount * 0.3; // バフ1つにつき+30%
const damage = baseDamage * multiplier;
```

### デバフ反転の技（例）

```typescript
// デバフをバフに変換する技
const debuffs = player.activeEffects.filter(
  (effect) => effect.type === 'debuff' || effect.type === 'poison' || effect.type === 'curse'
);
const buffsToAdd = debuffs.map((debuff) => ({
  ...debuff,
  type: 'buff' as const,
  target: debuff.target,
}));
```

### 条件付きクレンジング（例）

```typescript
// デバフのみを解除（毒・呪いは残す）
const cleanedEffects = effects.filter(
  (effect) => !(effect.type === 'debuff' && effect.target === 'player')
);
```

---

## 関連ファイル

- `src/lib/battle-v2/types.ts`: `SpecialEffectType`の定義
- `src/lib/battle-v2/turnProcessor.ts`: デバフカウント、クレンジング処理
- `src/lib/battle-v2/specialEffects.ts`: 効果の説明文生成
- `src/components/battle-v2/ActiveEffectIcons.tsx`: アイコン表示設定

---

## 更新履歴
- 2025-11-10: 初版作成（呪い実装後の整理）
