'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { BATTLE_PARAMS, type BattleParams } from '@/config/battleParams';

// Contextの型定義
interface BattleParamsContextType {
  params: BattleParams;
  setParams: (newParams: Partial<BattleParams>) => void;
}

// Contextの作成
const BattleParamsContext = createContext<BattleParamsContextType | undefined>(
  undefined
);

// Providerコンポーネント
export function BattleParamsProvider({ children }: { children: ReactNode }) {
  const [params, setInternalParams] = useState<BattleParams>(BATTLE_PARAMS);

  const setParams = (newParams: Partial<BattleParams>) => {
    setInternalParams((prevParams) => ({ ...prevParams, ...newParams }));
  };

  return (
    <BattleParamsContext.Provider value={{ params, setParams }}>
      {children}
    </BattleParamsContext.Provider>
  );
}

// カスタムフック
export function useBattleParams() {
  const context = useContext(BattleParamsContext);
  if (context === undefined) {
    throw new Error('useBattleParams must be used within a BattleParamsProvider');
  }
  return context;
}
