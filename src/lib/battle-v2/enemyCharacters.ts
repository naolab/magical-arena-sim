/**
 * Enemy Character Definitions
 * 敵キャラクターの定義
 */

import type { ActionVariant } from './types';

export type AIStrategyType = 'normal' | 'adaptive' | 'mirror';

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
  aiStrategy?: AIStrategyType; // AI戦略タイプ
  dialogues: string[]; // バトル中のセリフ
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
    aiStrategy: 'normal',
    dialogues: [
      'ちゃんと言うことを聞かないと飼い犬に手を噛まれちゃうよ？',
      'あら、構ってもらえるのがそんなに嬉しかった？',
      'その程度の力で私に勝てると思ってるの？',
      'もっと本気を出してくれないと、つまらないわ',
      'いい調子ね、でもまだまだ甘いわよ',
    ],
  },
  hitomi: {
    id: 'hitomi',
    name: 'ひとみ',
    description: '海の魔力で戦況に適応する魔法少女',
    imagePath: '/images/enemies/hitomi.png',
    actionVariants: {
      rage: 'explosive',
      terror: 'weaken',
      grief: 'drain',
      ecstasy: 'inspire',
    },
    aiStrategy: 'adaptive',
    dialogues: [
      'みんなの応援、すごく嬉しい！もっと頑張らなきゃ！',
      'ファンのみんなが見ててくれるから負けないよ！',
      'えっと…これで合ってる？みんな喜んでくれるかな？',
      'わあ！いっぱいコメント来てる！嬉しいな！',
      'みんなのために、精一杯頑張るね！',
    ],
  },
  clio: {
    id: 'clio',
    name: 'クリオ',
    description: '相手の動きを映す鏡の魔法少女',
    imagePath: '/images/enemies/clio.png',
    actionVariants: {
      rage: 'explosive',
      terror: 'weaken',
      grief: 'drain',
      ecstasy: 'inspire',
    },
    aiStrategy: 'mirror',
    dialogues: [
      '……あなたの動き、見えてる',
      '別に…真似してるわけじゃないから',
      'その手、次はどう動くの……',
      '……同じことするの、嫌いじゃない',
      'あなたのこと…少しわかってきた、かも',
    ],
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
