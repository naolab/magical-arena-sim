import { BattleContainer } from '@/components/battle-v2/BattleContainer';
import { BattleParamsV2Provider } from '@/contexts/BattleParamsV2Context';

export default function BattleV2() {
  return (
    <BattleParamsV2Provider>
      <BattleContainer />
    </BattleParamsV2Provider>
  );
}
