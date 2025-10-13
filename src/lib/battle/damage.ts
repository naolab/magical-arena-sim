/**
 * ダメージ計算ロジック
 * ファン補正、アンチ補正、ガード軽減を含む
 */

import type { BattleParams, DamageParams } from './types';
import type { ActionType } from './types';

/**
 * ダメージを計算
 * 計算式: 基礎火力 × 技倍率 × ファン補正 × アンチ補正 × ガード軽減
 */
export function calculateDamage(params: DamageParams, battleParams: BattleParams): number {
  const {
    action,
    basePower,
    fanRate,
    antiLevel,
    result,
    isDefending,
    fanPowerBonusRate,
  } = params;

  // 敗北時はダメージなし
  if (result === 'lose') {
    return 0;
  }

  // 技倍率を取得
  const skillMultiplier = getSkillMultiplier(action, battleParams);

  // ファン補正を取得
  const fanBonus = getFanPowerBonus(fanRate, battleParams, fanPowerBonusRate);

  // アンチ補正を取得
  const antiPenalty = battleParams.ANTI_EFFECTS[`LV${antiLevel}`].powerPenalty;

  // 基礎ダメージ計算
  let damage = basePower * skillMultiplier * fanBonus * antiPenalty;

  // 相手がガードしている場合、ダメージを軽減
  if (isDefending) {
    damage *= battleParams.GUARD_DAMAGE_REDUCTION;
  }

  // 小数点以下切り捨て
  return Math.floor(damage);
}

/**
 * 技倍率を取得
 */
function getSkillMultiplier(
  action: ActionType,
  battleParams: BattleParams
): number {
  switch (action) {
    case 'attack':
      return battleParams.ATTACK_MULTIPLIER;
    case 'appeal':
      return battleParams.APPEAL_MULTIPLIER;
    case 'guard':
      return battleParams.GUARD_MULTIPLIER;
  }
}

/**
 * ファン率による火力補正を取得
 */
export function getFanPowerBonus(
  fanRate: number,
  battleParams: BattleParams,
  fanPowerBonusRate = 1.0
): number {
  const bonuses = battleParams.FAN_POWER_BONUS;

  // 降順でチェックし、最初に該当する閾値の倍率を返す
  for (let i = bonuses.length - 1; i >= 0; i--) {
    if (fanRate >= bonuses[i].threshold) {
      return bonuses[i].multiplier * fanPowerBonusRate;
    }
  }

  // デフォルト（通常ここには到達しない）
  return 1.0 * fanPowerBonusRate;
}