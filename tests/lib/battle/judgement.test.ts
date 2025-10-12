import { describe, it, expect } from 'vitest';
import { judgeAction } from '@/lib/battle/judgement';

describe('judgeAction', () => {
  it('同じ行動なら引き分け', () => {
    expect(judgeAction('attack', 'attack')).toBe('draw');
    expect(judgeAction('appeal', 'appeal')).toBe('draw');
    expect(judgeAction('guard', 'guard')).toBe('draw');
  });

  it('アタックはアピールに勝つ', () => {
    expect(judgeAction('attack', 'appeal')).toBe('win');
  });

  it('アピールはガードに勝つ', () => {
    expect(judgeAction('appeal', 'guard')).toBe('win');
  });

  it('ガードはアタックに勝つ', () => {
    expect(judgeAction('guard', 'attack')).toBe('win');
  });

  it('負けパターンが正しい', () => {
    expect(judgeAction('attack', 'guard')).toBe('lose');
    expect(judgeAction('appeal', 'attack')).toBe('lose');
    expect(judgeAction('guard', 'appeal')).toBe('lose');
  });
});
