/**
 * アンチゲージ管理ロジック
 * アンチゲージの変動、レベル判定、ブーイングLv3処理
 */

import type { BattleParams } from '@/config/battleParams';
import type {
  AntiChangeParams,
  AntiLevel,
  MultipleAntiChangeParams,
} from './types';

/**
 * アンチゲージの変化量を計算
 */
export function calculateAntiChange(
  params: AntiChangeParams,
  battleParams: BattleParams
): number {
  const { action, result, commandFollowed, audienceCommand } = params;

  let change = 0;

  // 1. 行動によるアンチゲージ変動
  if (action === 'attack' && result === 'win') {
    change += battleParams.ANTI_CHANGE.ATTACK;
  } else if (action === 'appeal') {
    change += battleParams.ANTI_CHANGE.APPEAL_SUCCESS;
  } else if (action === 'guard') {
    change += battleParams.ANTI_CHANGE.GUARD_SUCCESS;
  }

  // 2. 観客指示違反によるペナルティ
  if (!commandFollowed) {
    if (
      audienceCommand.type === 'attack' ||
      audienceCommand.type === 'attack_forbid'
    ) {
      change += battleParams.ANTI_CHANGE.COMMAND_BREAK_ATTACK;
    } else if (
      audienceCommand.type === 'appeal' ||
      audienceCommand.type === 'appeal_forbid'
    ) {
      change += battleParams.ANTI_CHANGE.COMMAND_BREAK_APPEAL;
    } else if (
      audienceCommand.type === 'guard' ||
      audienceCommand.type === 'guard_forbid'
    ) {
      change += battleParams.ANTI_CHANGE.COMMAND_BREAK_GUARD;
    }
  }

  return change;
}

/**
 * アンチゲージ値からアンチレベルを判定
 * Lv0: 0-29
 * Lv1: 30-59
 * Lv2: 60-89
 * Lv3: 90-100
 */
export function getAntiLevel(
  antiGauge: number,
  battleParams: BattleParams
): AntiLevel {
  const { LV1, LV2, LV3 } = battleParams.ANTI_THRESHOLDS;

  if (antiGauge >= LV3) return 3;
  if (antiGauge >= LV2) return 2;
  if (antiGauge >= LV1) return 1;
  return 0;
}

/**
 * アンチレベルの名称を取得
 */
export function getAntiLevelName(level: AntiLevel): string {
  const names: Record<AntiLevel, string> = {
    0: '通常',
    1: '冷淡期',
    2: 'ブーイング期',
    3: '炎上期',
  };
  return names[level];
}

/**
 * 複数の観客指示に対するアンチゲージの変化量を計算（合計）
 */
export function calculateMultipleAntiChange(
  params: MultipleAntiChangeParams,
  battleParams: BattleParams
): number {
  const { action, result, commandsFollowed, audienceCommands } = params;

  let change = 0;

  // 1. 行動によるアンチゲージ変動
  if (action === 'attack' && result === 'win') {
    change += battleParams.ANTI_CHANGE.ATTACK;
  } else if (action === 'appeal') {
    change += battleParams.ANTI_CHANGE.APPEAL_SUCCESS;
  } else if (action === 'guard') {
    change += battleParams.ANTI_CHANGE.GUARD_SUCCESS;
  }

  // 2. 各観客指示違反によるペナルティを合計
  for (let i = 0; i < audienceCommands.length; i++) {
    const followed = commandsFollowed[i];
    const command = audienceCommands[i];

    if (!followed) {
      if (command.type === 'attack' || command.type === 'attack_forbid') {
        change += battleParams.ANTI_CHANGE.COMMAND_BREAK_ATTACK;
      } else if (command.type === 'appeal' || command.type === 'appeal_forbid') {
        change += battleParams.ANTI_CHANGE.COMMAND_BREAK_APPEAL;
      } else if (command.type === 'guard' || command.type === 'guard_forbid') {
        change += battleParams.ANTI_CHANGE.COMMAND_BREAK_GUARD;
      }
    }
  }

  return change;
}

/**
 * アンチゲージを0-100の範囲にクランプ
 */
export function clampAntiGauge(value: number): number {
  return Math.max(0, Math.min(100, value));
}