'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ActionVariants } from '@/lib/battle-v2/types';

// V2パラメータの型定義
export interface BattleParamsV2 {
  // 基本パラメータ
  playerMaxHp: number;
  enemyMaxHp: number;
  playerBasePower: number;
  enemyBasePower: number;
  initialFanRate: number;

  // ダメージ計算
  commentBonusPerCount: number;
  fanRateMaxBonus: number;
  matchupBonusWin: number;
  matchupBonusDraw: number;
  matchupBonusLose: number;
  enableMatchups: boolean;

  // コメントシステム
  commentsPerTurn: number;
  maxCommentPoolSize: number;

  // 特殊効果
  rageExtraDamageRatio: number;
  terrorDebuffMagnitude: number;
  terrorDebuffDuration: number;
  terrorPoisonMagnitude: number;
  terrorPoisonDuration: number;
  terrorCurseMagnitude: number;
  terrorCurseDuration: number;
  griefDrainRatio: number;
  ecstasyBuffMagnitude: number;
  ecstasyBuffDuration: number;

  // アクションバリアント
  selectedActionVariants: ActionVariants;

  // 敵キャラクター
  enemyCharacterId: string;

  // ファンシステム
  fanRateChangeOnWin: number;
  fanRateChangeOnLose: number;
  fanRateBonusPerComment: number;
  fanStealAmountOnWin: number;
  initialPlayerFans: number;
  initialEnemyFans: number;
}

// デフォルト値
export const DEFAULT_BATTLE_PARAMS_V2: BattleParamsV2 = {
  // 基本パラメータ
  playerMaxHp: 1500,
  enemyMaxHp: 2000,
  playerBasePower: 100,
  enemyBasePower: 150,
  initialFanRate: 0.2,

  // ダメージ計算
  commentBonusPerCount: 0.2,
  fanRateMaxBonus: 2.0,
  matchupBonusWin: 1.5,
  matchupBonusDraw: 1.0,
  matchupBonusLose: 0.7,
  enableMatchups: true,

  // コメントシステム
  commentsPerTurn: 3,
  maxCommentPoolSize: 10,

  // 特殊効果
  rageExtraDamageRatio: 0.5,
  terrorDebuffMagnitude: 20,
  terrorDebuffDuration: 2,
  terrorPoisonMagnitude: 100,
  terrorPoisonDuration: 3,
  terrorCurseMagnitude: 5,
  terrorCurseDuration: 3,
  griefDrainRatio: 0.4,
  ecstasyBuffMagnitude: 30,
  ecstasyBuffDuration: 2,

  // アクションバリアント
  selectedActionVariants: {
    rage: 'explosive',
    terror: 'weaken',
    grief: 'drain',
    ecstasy: 'inspire',
  },

  // 敵キャラクター
  enemyCharacterId: 'marina',

  // ファンシステム
  fanRateChangeOnWin: 0.1,
  fanRateChangeOnLose: -0.05,
  fanRateBonusPerComment: 0.02,
  fanStealAmountOnWin: 0.05,
  initialPlayerFans: 0.0,
  initialEnemyFans: 0.0,
};

// Contextの型定義
interface BattleParamsV2ContextType {
  params: BattleParamsV2;
  setParams: (newParams: Partial<BattleParamsV2>) => void;
  resetParams: () => void;
}

// Contextの作成
const BattleParamsV2Context = createContext<BattleParamsV2ContextType | undefined>(
  undefined
);

// Providerコンポーネント
export function BattleParamsV2Provider({ children }: { children: ReactNode }) {
  const [params, setInternalParams] = useState<BattleParamsV2>(DEFAULT_BATTLE_PARAMS_V2);

  const setParams = (newParams: Partial<BattleParamsV2>) => {
    setInternalParams((prevParams) => ({ ...prevParams, ...newParams }));
  };

  const resetParams = () => {
    setInternalParams(DEFAULT_BATTLE_PARAMS_V2);
  };

  return (
    <BattleParamsV2Context.Provider value={{ params, setParams, resetParams }}>
      {children}
    </BattleParamsV2Context.Provider>
  );
}

// カスタムフック
export function useBattleParamsV2() {
  const context = useContext(BattleParamsV2Context);
  if (context === undefined) {
    throw new Error('useBattleParamsV2 must be used within a BattleParamsV2Provider');
  }
  return context;
}
