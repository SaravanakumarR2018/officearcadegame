import { describe, expect, it } from 'vitest';
import {
  comboMultiplier,
  medalFor,
  meltdownUnlocked,
  scoreAction,
  seededRandom,
  thresholds,
} from './rules';
import type { GameId, Medal } from '../types';

const gameIds: GameId[] = ['inbox', 'bugs', 'server', 'coffee'];

describe('medal thresholds', () => {
  it.each(gameIds)('awards each rating at the documented boundary for %s', (game) => {
    const [bronze, silver, gold] = thresholds[game];
    expect(medalFor(game, bronze - 1)).toBe('none');
    expect(medalFor(game, bronze)).toBe('bronze');
    expect(medalFor(game, silver - 1)).toBe('bronze');
    expect(medalFor(game, silver)).toBe('silver');
    expect(medalFor(game, gold - 1)).toBe('silver');
    expect(medalFor(game, gold)).toBe('gold');
    expect(medalFor(game, gold + 10_000)).toBe('gold');
  });
});

describe('combo scoring', () => {
  it('steps up every three actions and caps at 3x', () => {
    expect([0, 2, 3, 6, 9, 12, 99].map(comboMultiplier)).toEqual([1, 1, 1.5, 2, 2.5, 3, 3]);
  });

  it('rounds fractional score awards predictably', () => {
    expect(scoreAction(25, 0)).toBe(25);
    expect(scoreAction(25, 3)).toBe(38);
    expect(scoreAction(25, 12)).toBe(75);
  });
});

describe('Deadline Meltdown unlock', () => {
  const medals = (value: Medal): Record<GameId, Medal> => ({
    inbox: value,
    bugs: value,
    server: value,
    coffee: value,
  });

  it('requires a medal in every office challenge', () => {
    expect(meltdownUnlocked(medals('bronze'))).toBe(true);
    expect(meltdownUnlocked(medals('gold'))).toBe(true);
    expect(meltdownUnlocked({ ...medals('gold'), coffee: 'none' })).toBe(false);
  });
});

describe('seeded randomness', () => {
  it('is deterministic, bounded, and produces a changing sequence', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const sequenceA = Array.from({ length: 20 }, a);
    const sequenceB = Array.from({ length: 20 }, b);

    expect(sequenceA).toEqual(sequenceB);
    expect(new Set(sequenceA).size).toBeGreaterThan(1);
    expect(sequenceA.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it('uses an unsigned 32-bit seed consistently', () => {
    const negative = seededRandom(-1);
    const unsigned = seededRandom(0xffff_ffff);
    expect(Array.from({ length: 5 }, negative)).toEqual(Array.from({ length: 5 }, unsigned));
  });
});
