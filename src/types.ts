export type GameId = 'inbox' | 'bugs' | 'server' | 'coffee';
export type Screen = 'cinematic' | 'office' | GameId | 'meltdown';
export type Medal = 'none' | 'bronze' | 'silver' | 'gold';
export interface GameResult {
  score: number;
  medal: Medal;
  won: boolean;
}
