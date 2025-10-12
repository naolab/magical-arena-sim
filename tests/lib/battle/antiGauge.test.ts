import { describe, it, expect } from 'vitest';
import { getAntiLevel, clampAntiGauge } from '@/lib/battle/antiGauge';

describe('getAntiLevel', () => {
  it('0-29でLv0', () => {
    expect(getAntiLevel(0)).toBe(0);
    expect(getAntiLevel(29)).toBe(0);
  });

  it('30-59でLv1', () => {
    expect(getAntiLevel(30)).toBe(1);
    expect(getAntiLevel(59)).toBe(1);
  });

  it('60-89でLv2', () => {
    expect(getAntiLevel(60)).toBe(2);
    expect(getAntiLevel(89)).toBe(2);
  });

  it('90-100でLv3', () => {
    expect(getAntiLevel(90)).toBe(3);
    expect(getAntiLevel(100)).toBe(3);
  });
});

describe('clampAntiGauge', () => {
  it('0-100の範囲にクランプ', () => {
    expect(clampAntiGauge(-10)).toBe(0);
    expect(clampAntiGauge(0)).toBe(0);
    expect(clampAntiGauge(50)).toBe(50);
    expect(clampAntiGauge(100)).toBe(100);
    expect(clampAntiGauge(150)).toBe(100);
  });
});
