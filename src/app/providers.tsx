'use client';

import { BattleParamsProvider } from '@/contexts/BattleParamsContext';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <BattleParamsProvider>{children}</BattleParamsProvider>;
}
