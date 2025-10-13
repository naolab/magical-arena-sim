/**
 * バトルシステムのパラメータ定数
 * battle-system-spec.md に基づく数値設定
 */

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
    // 勝敗による変動
    WIN: 0.1, // 勝利時 +10%
    DRAW_WIN: 0.05, // 引き分け時（ファン率高い方） +5%
    LOSE: -0.05, // 敗北時 -5%

    // 観客指示による変動
    COMMAND_FOLLOW: 0.05, // 指示に従う +5%
    COMMAND_BREAK: -0.05, // 指示に反する -5%

    // 技成功時の変動
    APPEAL_SUCCESS: 0.1, // アピール成功 +10%
    GUARD_SUCCESS: 0.03, // ガード成功 +3%
  },

  // アンチゲージ変動
  ANTI_CHANGE: {
    // 行動による変動
    ATTACK: 5, // アタック時 +5
    APPEAL_SUCCESS: -15, // アピール成功 -15
    GUARD_SUCCESS: -5, // ガード成功 -5

    // 観客指示違反による変動
    COMMAND_BREAK_ATTACK: 10, // 攻撃しろ違反 +10
    COMMAND_BREAK_APPEAL: 10, // アピール違反 +10
    COMMAND_BREAK_GUARD: 15, // ガード違反 +15
  },

  // アンチレベル閾値
  ANTI_THRESHOLDS: {
    LV1: 30,
    LV2: 60,
    LV3: 90,
  },

  // アンチレベル効果
  ANTI_EFFECTS: {
    LV0: {
      fanPenalty: 0, // ファン獲得ペナルティ（乗算）
      powerPenalty: 1.0, // 火力ペナルティ（乗算）
    },
    LV1: {
      fanPenalty: 0.2, // ファン獲得 -20%
      powerPenalty: 0.8, // 火力 -20%
    },
    LV2: {
      fanPenalty: 0.4, // ファン獲得 -40%
      powerPenalty: 0.6, // 火力 -40%
    },
    LV3: {
      fanPenalty: 0.6, // ファン獲得 -60%
      powerPenalty: 0.4, // 火力 -60%
    },
  },

  // 観客指示出現確率
  COMMAND_PROBABILITY: {
    ATTACK: 0.2, // 20%
    ATTACK_FORBID: 0.1, // 10%
    APPEAL: 0.2, // 20%
    APPEAL_FORBID: 0.1, // 10%
    GUARD: 0.2, // 20%
    GUARD_FORBID: 0.2, // 20%
  },

  // 初期観客構成
  INITIAL_AUDIENCE: {
    ENEMY_FANS: 0.2, // 敵ファン 20%
    NEUTRAL_FANS: 0.7, // どっちつかず 70%
    PLAYER_FANS: 0.1, // プレイヤーファン 10%
  },

  // ファン率による火力補正
  FAN_POWER_BONUS_RATE: 1.0, // ファン率火力ボーナスの全体倍率
  FAN_POWER_BONUS: [
    { threshold: 0.0, multiplier: 1.0 }, // 0-20%: ×1.0
    { threshold: 0.21, multiplier: 1.2 }, // 21-50%: ×1.2
    { threshold: 0.51, multiplier: 1.5 }, // 51-80%: ×1.5
    { threshold: 0.81, multiplier: 2.0 }, // 81-100%: ×2.0
  ],

  // 勝利条件
  WIN_CONDITIONS: {
    HP_THRESHOLD: 0, // HP 0以下
    FAN_THRESHOLD: 0.8, // ファン率 80%以上
  },
} as const;

// 型エクスポート（型推論用）
export type BattleParams = typeof BATTLE_PARAMS;
