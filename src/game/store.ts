import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId, Medal, Screen } from '../types';
import { medalFor } from './rules';

const emptyMedals: Record<GameId, Medal> = {
  inbox: 'none',
  bugs: 'none',
  server: 'none',
  coffee: 'none',
};
const emptyScores: Record<GameId, number> = { inbox: 0, bugs: 0, server: 0, coffee: 0 };
interface State {
  screen: Screen;
  cinematic: boolean;
  paused: boolean;
  muted: boolean;
  volume: number;
  medals: Record<GameId, Medal>;
  scores: Record<GameId, number>;
  cubes: number;
  color: string;
  meltdownWon: boolean;
  setScreen: (s: Screen) => void;
  skip: () => void;
  togglePause: () => void;
  toggleMute: () => void;
  setVolume: (n: number) => void;
  collectCube: () => void;
  finish: (g: GameId, score: number) => void;
  winMeltdown: () => void;
  reset: () => void;
}
export const useGameStore = create<State>()(
  persist(
    (set) => ({
      screen: 'cinematic',
      cinematic: true,
      paused: false,
      muted: false,
      volume: 0.55,
      medals: { ...emptyMedals },
      scores: { ...emptyScores },
      cubes: 0,
      color: '#ff6b6b',
      meltdownWon: false,
      setScreen: (screen) => set({ screen, paused: false }),
      skip: () => set({ screen: 'office', cinematic: false }),
      togglePause: () => set((s) => ({ paused: !s.paused })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setVolume: (volume) => set({ volume }),
      collectCube: () => set((s) => ({ cubes: Math.min(12, s.cubes + 1) })),
      finish: (g, score) =>
        set((s) => ({
          scores: { ...s.scores, [g]: Math.max(score, s.scores[g]) },
          medals: { ...s.medals, [g]: medalFor(g, Math.max(score, s.scores[g])) },
        })),
      winMeltdown: () => set({ meltdownWon: true, color: '#a78bfa' }),
      reset: () =>
        set({
          medals: { ...emptyMedals },
          scores: { ...emptyScores },
          cubes: 0,
          color: '#ff6b6b',
          meltdownWon: false,
          screen: 'office',
          cinematic: false,
        }),
    }),
    {
      name: 'blockworks-progress',
      partialize: (s) => ({
        medals: s.medals,
        scores: s.scores,
        cubes: s.cubes,
        color: s.color,
        meltdownWon: s.meltdownWon,
        muted: s.muted,
        volume: s.volume,
      }),
    },
  ),
);
