/**
 * 観客指示生成ロジック
 * ランダムに観客からの指示を生成
 */

import { BATTLE_PARAMS } from '@/config/battleParams';
import type { AudienceCommand, ActionType } from './types';

/**
 * 観客指示をランダムに生成
 * 確率: 攻撃40%, アピール30%, ガード禁止30%
 */
export function generateAudienceCommand(): AudienceCommand {
  const rand = Math.random();
  const { ATTACK, APPEAL, GUARD_FORBID } = BATTLE_PARAMS.COMMAND_PROBABILITY;

  if (rand < ATTACK) {
    return { type: 'attack', message: '攻撃しろ！' };
  } else if (rand < ATTACK + APPEAL) {
    return { type: 'appeal', message: 'アピールして！' };
  } else {
    return { type: 'guard_forbid', message: 'ガードするな！' };
  }
}

/**
 * プレイヤーの行動が観客指示に従っているかチェック
 */
export function isCommandFollowed(
  command: AudienceCommand,
  playerAction: ActionType
): boolean {
  switch (command.type) {
    case 'attack':
      return playerAction === 'attack';
    case 'appeal':
      return playerAction === 'appeal';
    case 'guard_forbid':
      return playerAction !== 'guard';
  }
}

/**
 * 複数の観客指示に対してプレイヤーの行動をチェック
 */
export function checkMultipleCommands(
  commands: AudienceCommand[],
  playerAction: ActionType
): boolean[] {
  return commands.map((command) => isCommandFollowed(command, playerAction));
}
