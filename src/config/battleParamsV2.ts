/**
 * Battle V2 Configuration Parameters
 * Balancing and tuning parameters for v2 battle system
 */

// ========================================
// Combat Parameters
// ========================================

export const BATTLE_CONFIG = {
  /** プレイヤーの最大HP */
  playerMaxHp: 1000,

  /** 敵の最大HP */
  enemyMaxHp: 2000,

  /** プレイヤーの基本攻撃力 */
  playerBasePower: 100,

  /** 敵の基本攻撃力 */
  enemyBasePower: 150,

  /** 初期ファン率 */
  initialFanRate: 0.2,

  /** 最大ターン数（この数を超えたら引き分けorHP判定） */
  maxTurns: 50,
} as const;

// ========================================
// Damage Calculation Parameters
// ========================================

export const DAMAGE_CONFIG = {
  /** コメント1つあたりの補正（+20%） */
  commentBonusPerCount: 0.2,

  /** ファン率の最大補正（ファン率100%で+100% = 2倍） */
  fanRateMaxBonus: 1.0,

  /** 相性補正 */
  matchupBonus: {
    win: 1.5, // 有利
    draw: 1.0, // 互角
    lose: 0.7, // 不利
  },
} as const;

// ========================================
// Comment System Parameters
// ========================================

export const COMMENT_CONFIG = {
  /** 1ターンごとに追加されるコメント数 */
  commentsPerTurn: 3,

  /** コメントプールの最大サイズ */
  maxCommentPoolSize: 10,

  /** 感情の重み（均等） */
  emotionWeights: {
    rage: 1.0,
    terror: 1.0,
    grief: 1.0,
    ecstasy: 1.0,
  },
} as const;

// ========================================
// Special Effects Parameters
// ========================================

export const SPECIAL_EFFECTS_CONFIG = {
  /** Rage: 追加ダメージの割合（基本ダメージの50%） */
  rageExtraDamageRatio: 0.5,

  /** Terror: デバフの強度（攻撃力-20%） */
  terrorDebuffMagnitude: 20,

  /** Terror: デバフの持続ターン */
  terrorDebuffDuration: 2,

  /** Grief: HP吸収の割合（与えたダメージの40%） */
  griefDrainRatio: 0.4,

  /** Ecstasy: バフの強度（攻撃力+30%） */
  ecstasyBuffMagnitude: 30,

  /** Ecstasy: バフの持続ターン */
  ecstasyBuffDuration: 2,
} as const;

// ========================================
// Fan System Parameters
// ========================================

export const FAN_SYSTEM_CONFIG = {
  /** ファン率のしきい値と対応する補正倍率 */
  fanRateThresholds: [
    { min: 0.0, max: 0.2, bonus: 1.0, rank: 'C' },
    { min: 0.2, max: 0.5, bonus: 1.2, rank: 'B' },
    { min: 0.5, max: 0.8, bonus: 1.5, rank: 'A' },
    { min: 0.8, max: 1.0, bonus: 2.0, rank: 'S' },
  ],

  /** 勝利時のファン率変化 */
  fanRateChangeOnWin: 0.1, // +10%

  /** 敗北時のファン率変化 */
  fanRateChangeOnLose: -0.05, // -5%

  /** コメント1つあたりのファン率ボーナス */
  fanRateBonusPerComment: 0.02, // +2%

  /** 1回の勝利で奪うファンの割合 */
  fanStealAmountOnWin: 0.05, // 5%

  /** 初期観客構成 */
  initialAudienceComposition: {
    playerFans: 0.2, // 20%
    enemyFans: 0.2, // 20%
    neutralFans: 0.6, // 60%
  },
} as const;

// ========================================
// AI Parameters
// ========================================

export const AI_CONFIG = {
  /** デフォルトのAI難易度 */
  defaultDifficulty: 'normal' as const,

  /** ハードAIのランダム性（次善手を選ぶ確率） */
  hardAiRandomness: 0.2, // 20%
} as const;

// ========================================
// UI/Animation Parameters
// ========================================

export const UI_CONFIG = {
  /** Showdownアニメーションの表示時間（ミリ秒） */
  showdownDuration: 1500,

  /** Showdown後の待機時間（ミリ秒） */
  showdownPostDelay: 1000,

  /** ターン処理の待機時間（ミリ秒） */
  turnProcessingDelay: 300,
} as const;
