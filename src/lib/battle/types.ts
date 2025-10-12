/**
 * バトルシステムの型定義
 */

// 行動タイプ
export type ActionType = 'attack' | 'appeal' | 'guard';

// 勝敗結果
export type BattleResult = 'win' | 'draw' | 'lose';

// アンチレベル (0: 通常, 1: 冷淡期, 2: ブーイング期, 3: 炎上期)
export type AntiLevel = 0 | 1 | 2 | 3;

// 観客指示
export type AudienceCommand =
  | { type: 'attack'; message: '攻撃しろ！' }
  | { type: 'appeal'; message: 'アピールして！' }
  | { type: 'guard_forbid'; message: 'ガードするな！' };

// 戦闘者の基本状態
export interface Combatant {
  hp: number;
  maxHp: number;
  basePower: number;
}

// プレイヤー固有の状態
export interface PlayerState extends Combatant {
  fanRate: number; // ファン率 (0.0 ~ 1.0)
  antiGauge: number; // アンチゲージ (0 ~ 100)
  antiLevel: AntiLevel; // アンチレベル
}

// 敵の状態
export interface EnemyState extends Combatant {
  fanRate: number; // ファン率 (0.0 ~ 1.0)
}

// 観客構成
export interface AudienceComposition {
  enemyFans: number; // 敵ファン (0.0 ~ 1.0)
  neutralFans: number; // どっちつかずのファン (0.0 ~ 1.0)
  playerFans: number; // プレイヤーファン (0.0 ~ 1.0)
}

// ターン結果
export interface TurnResult {
  turnNumber: number;
  playerAction: ActionType;
  enemyAction: ActionType;
  judgement: BattleResult; // プレイヤー視点での勝敗
  audienceCommand: AudienceCommand;
  commandFollowed: boolean; // 観客指示に従ったか
  damage: {
    toEnemy: number;
    toPlayer: number;
  };
  fanChange: {
    player: number; // ファン率の変化量
    enemy: number;
  };
  antiChange: number; // アンチゲージの変化量
  playerState: PlayerState; // ターン終了時のプレイヤー状態
  enemyState: EnemyState; // ターン終了時の敵状態
  audienceComposition: AudienceComposition; // ターン終了時の観客構成
  message: string; // ターンの説明メッセージ
}

// バトル全体の状態
export interface BattleState {
  isActive: boolean; // バトル進行中かどうか
  currentTurn: number; // 現在のターン数
  player: PlayerState;
  enemy: EnemyState;
  audience: AudienceComposition;
  currentCommand: AudienceCommand; // 現在ターンの観客指示
  turnHistory: TurnResult[]; // 過去のターン履歴
  winner: 'player' | 'enemy' | null; // 勝者
}

// ダメージ計算のパラメータ
export interface DamageParams {
  action: ActionType;
  basePower: number;
  fanRate: number;
  antiLevel: AntiLevel;
  result: BattleResult;
  isDefending: boolean; // 相手がガードしているか
}

// ファン変動計算のパラメータ
export interface FanChangeParams {
  result: BattleResult;
  action: ActionType;
  commandFollowed: boolean;
  antiLevel: AntiLevel;
}

// アンチゲージ変動計算のパラメータ
export interface AntiChangeParams {
  action: ActionType;
  result: BattleResult;
  commandFollowed: boolean;
  audienceCommand: AudienceCommand;
}
