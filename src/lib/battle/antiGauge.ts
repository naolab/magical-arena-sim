/**
 * アンチゲージ管理ロジック
 * アンチゲージの変動、レベル判定、ブーイングLv3処理
 */

import { BATTLE_PARAMS } from '@/config/battleParams';
import type { AntiChangeParams, AntiLevel, MultipleAntiChangeParams } from './types';

/**
 * アンチゲージの変化量を計算
 */
export function calculateAntiChange(params: AntiChangeParams): number {
  const { action, result, commandFollowed, audienceCommand } = params;

  let change = 0;

  // 1. 行動によるアンチゲージ変動
  if (action === 'attack' && result === 'win') {
    change += BATTLE_PARAMS.ANTI_CHANGE.ATTACK;
  } else if (action === 'appeal' && result === 'win') {
    change += BATTLE_PARAMS.ANTI_CHANGE.APPEAL_SUCCESS;
  } else if (action === 'guard' && result === 'win') {
    change += BATTLE_PARAMS.ANTI_CHANGE.GUARD_SUCCESS;
  }

  // 2. 観客指示違反によるペナルティ
  if (!commandFollowed) {
    if (audienceCommand.type === 'attack') {
      change += BATTLE_PARAMS.ANTI_CHANGE.COMMAND_BREAK_ATTACK;
    } else if (audienceCommand.type === 'appeal') {
      change += BATTLE_PARAMS.ANTI_CHANGE.COMMAND_BREAK_APPEAL;
    } else if (audienceCommand.type === 'guard_forbid') {
      change += BATTLE_PARAMS.ANTI_CHANGE.COMMAND_BREAK_GUARD;
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
export function getAntiLevel(antiGauge: number): AntiLevel {
  const { LV1, LV2, LV3 } = BATTLE_PARAMS.ANTI_THRESHOLDS;

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
export function calculateMultipleAntiChange(params: MultipleAntiChangeParams): number {
  const { action, result, commandsFollowed, audienceCommands } = params;

  let change = 0;

  // 1. 行動によるアンチゲージ変動
  if (action === 'attack' && result === 'win') {
    change += BATTLE_PARAMS.ANTI_CHANGE.ATTACK;
  } else if (action === 'appeal' && result === 'win') {
    change += BATTLE_PARAMS.ANTI_CHANGE.APPEAL_SUCCESS;
  } else if (action === 'guard' && result === 'win') {
    change += BATTLE_PARAMS.ANTI_CHANGE.GUARD_SUCCESS;
  }

  // 2. 各観客指示違反によるペナルティを合計
  for (let i = 0; i < audienceCommands.length; i++) {
    const followed = commandsFollowed[i];
    const command = audienceCommands[i];

    if (!followed) {
      if (command.type === 'attack') {
        change += BATTLE_PARAMS.ANTI_CHANGE.COMMAND_BREAK_ATTACK;
      } else if (command.type === 'appeal') {
        change += BATTLE_PARAMS.ANTI_CHANGE.COMMAND_BREAK_APPEAL;
      } else if (command.type === 'guard_forbid') {
        change += BATTLE_PARAMS.ANTI_CHANGE.COMMAND_BREAK_GUARD;
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
