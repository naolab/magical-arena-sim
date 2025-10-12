/**
 * ダメージ計算ロジック
 * ファン補正、アンチ補正、ガード軽減を含む
 */

import { BATTLE_PARAMS } from '@/config/battleParams';
import type { DamageParams } from './types';

/**
 * ダメージを計算
 * 計算式: 基礎火力 × 技倍率 × ファン補正 × アンチ補正 × ガード軽減
 */
export function calculateDamage(params: DamageParams): number {
  const { action, basePower, fanRate, antiLevel, result, isDefending } = params;

  // 敗北時はダメージなし
  if (result === 'lose') {
    return 0;
  }

  // 技倍率を取得
  const skillMultiplier = getSkillMultiplier(action);

  // ファン補正を取得
  const fanBonus = getFanPowerBonus(fanRate);

  // アンチ補正を取得
  const antiPenalty = BATTLE_PARAMS.ANTI_EFFECTS[`LV${antiLevel}`].powerPenalty;

  // 基礎ダメージ計算
  let damage = basePower * skillMultiplier * fanBonus * antiPenalty;

  // 相手がガードしている場合、ダメージを軽減
  if (isDefending) {
    damage *= BATTLE_PARAMS.GUARD_DAMAGE_REDUCTION;
  }

  // 小数点以下切り捨て
  return Math.floor(damage);
}

/**
 * 技倍率を取得
 */
function getSkillMultiplier(action: 'attack' | 'appeal' | 'guard'): number {
  switch (action) {
    case 'attack':
      return BATTLE_PARAMS.ATTACK_MULTIPLIER;
    case 'appeal':
      return BATTLE_PARAMS.APPEAL_MULTIPLIER;
    case 'guard':
      return BATTLE_PARAMS.GUARD_MULTIPLIER;
  }
}

/**
 * ファン率による火力補正を取得
 * 0-20%: ×1.0
 * 21-50%: ×1.2
 * 51-80%: ×1.5
 * 81-100%: ×2.0
 */
export function getFanPowerBonus(fanRate: number): number {
  const bonuses = BATTLE_PARAMS.FAN_POWER_BONUS;

  // 降順でチェックし、最初に該当する閾値の倍率を返す
  for (let i = bonuses.length - 1; i >= 0; i--) {
    if (fanRate >= bonuses[i].threshold) {
      return bonuses[i].multiplier;
    }
  }

  // デフォルト（通常ここには到達しない）
  return 1.0;
}
