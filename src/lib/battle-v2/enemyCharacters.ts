/**
 * Enemy Character Definitions
 * 敵キャラクターの定義
 */

import type { ActionVariant } from './types';

export interface EnemyCharacter {
  id: string;
  name: string;
  description?: string;
  imagePath: string; // キャラクターイラストのパス
  actionVariants: {
    rage: ActionVariant;
    terror: ActionVariant;
    grief: ActionVariant;
    ecstasy: ActionVariant;
  };
  // 将来的に追加する可能性のあるパラメータ
  baseHp?: number;
  basePower?: number;
}

/**
 * 敵キャラクター一覧
 */
export const ENEMY_CHARACTERS: Record<string, EnemyCharacter> = {
  marina: {
    id: 'marina',
    name: 'マリナ',
    description: '感情の波を操る魔法少女',
    imagePath: '/images/enemies/marina.png',
    actionVariants: {
      rage: 'explosive',
      terror: 'weaken',
      grief: 'drain',
      ecstasy: 'inspire',
    },
  },
};

/**
 * デフォルトの敵キャラクター
 */
export const DEFAULT_ENEMY_CHARACTER: EnemyCharacter = ENEMY_CHARACTERS.marina;

/**
 * 敵キャラクターIDから敵キャラクター定義を取得
 */
export function getEnemyCharacter(id: string): EnemyCharacter {
  return ENEMY_CHARACTERS[id] || DEFAULT_ENEMY_CHARACTER;
}

/**
 * 全ての敵キャラクターIDを取得
 */
export function getAllEnemyCharacterIds(): string[] {
  return Object.keys(ENEMY_CHARACTERS);
}
