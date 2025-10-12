import { describe, it, expect } from 'vitest';
import { calculateDamage, getFanPowerBonus } from '@/lib/battle/damage';

describe('calculateDamage', () => {
  it('敗北時はダメージ0', () => {
    const damage = calculateDamage({
      action: 'attack',
      basePower: 100,
      fanRate: 0.5,
      antiLevel: 0,
      result: 'lose',
      isDefending: false,
    });
    expect(damage).toBe(0);
  });

  it('アタック勝利時の基本ダメージ', () => {
    const damage = calculateDamage({
      action: 'attack',
      basePower: 100,
      fanRate: 0.1, // ファン補正 ×1.0
      antiLevel: 0, // アンチ補正なし
      result: 'win',
      isDefending: false,
    });
    // 100 × 1.2 (アタック倍率) × 1.0 (ファン) × 1.0 (アンチ) = 120
    expect(damage).toBe(120);
  });

  it('ガード時のダメージ軽減', () => {
    const damage = calculateDamage({
      action: 'attack',
      basePower: 100,
      fanRate: 0.1,
      antiLevel: 0,
      result: 'win',
      isDefending: true, // ガード軽減80%
    });
    // 120 × 0.2 = 24
    expect(damage).toBe(24);
  });
});

describe('getFanPowerBonus', () => {
  it('ファン率0-20%で補正×1.0', () => {
    expect(getFanPowerBonus(0.0)).toBe(1.0);
    expect(getFanPowerBonus(0.2)).toBe(1.0);
  });

  it('ファン率21-50%で補正×1.2', () => {
    expect(getFanPowerBonus(0.21)).toBe(1.2);
    expect(getFanPowerBonus(0.5)).toBe(1.2);
  });

  it('ファン率51-80%で補正×1.5', () => {
    expect(getFanPowerBonus(0.51)).toBe(1.5);
    expect(getFanPowerBonus(0.8)).toBe(1.5);
  });

  it('ファン率81-100%で補正×2.0', () => {
    expect(getFanPowerBonus(0.81)).toBe(2.0);
    expect(getFanPowerBonus(1.0)).toBe(2.0);
  });
});
