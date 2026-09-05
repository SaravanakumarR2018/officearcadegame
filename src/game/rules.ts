import type { GameId, Medal } from '../types';
export const thresholds: Record<GameId, [number, number, number]> = {
  inbox: [500, 900, 1400],
  bugs: [450, 800, 1250],
  server: [500, 850, 1300],
  coffee: [450, 800, 1200],
};
export function medalFor(game: GameId, score: number): Medal {
  const [b, s, g] = thresholds[game];
  return score >= g ? 'gold' : score >= s ? 'silver' : score >= b ? 'bronze' : 'none';
}
export function comboMultiplier(combo: number) {
  return 1 + Math.min(4, Math.floor(combo / 3)) * 0.5;
}
export function scoreAction(base: number, combo: number) {
  return Math.round(base * comboMultiplier(combo));
}
export function meltdownUnlocked(medals: Record<GameId, Medal>) {
  return Object.values(medals).every((m) => m !== 'none');
}
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => (s = (Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296;
}
