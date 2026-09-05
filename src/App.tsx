import { Suspense, lazy, useEffect } from 'react';
import { useGameStore } from './game/store';
import { ArcadeGame } from './games/ArcadeGame';
import { Meltdown } from './games/Meltdown';
import { OfficeOverlay } from './ui/Overlay';
import './styles.css';
const World = lazy(() => import('./world/World').then((m) => ({ default: m.World })));
export default function App() {
  const s = useGameStore();
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (s.screen === 'cinematic' && (e.key === ' ' || e.key === 'Escape')) s.skip();
      else if (s.screen === 'office' && e.key === 'Escape') s.togglePause();
      else if (e.key.toLowerCase() === 'm') s.toggleMute();
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [s]);
  if (['inbox', 'bugs', 'server', 'coffee'].includes(s.screen))
    return <ArcadeGame id={s.screen as 'inbox'} />;
  if (s.screen === 'meltdown') return <Meltdown />;
  return (
    <main className="office" data-testid="office">
      <Suspense
        fallback={
          <div className="loading">
            <b>ASSEMBLING OFFICE</b>
            <span />
          </div>
        }
      >
        <World
          cinematic={s.screen === 'cinematic'}
          onCinematicEnd={s.skip}
          playerColor={s.color}
          onCollect={s.collectCube}
          paused={s.paused}
          onInteract={s.setScreen}
          completed={(Object.keys(s.medals) as Array<keyof typeof s.medals>).filter(
            (game) => s.medals[game] !== 'none',
          )}
        />
      </Suspense>
      {s.screen === 'cinematic' ? (
        <div className="cinematic-ui">
          <span className="eyebrow">A VOXEL WORKPLACE ADVENTURE</span>
          <h1>
            BLOCKWORKS<small>OFFICE ARCADE</small>
          </h1>
          <button onClick={s.skip} data-testid="skip-cinematic">
            SPACE TO SKIP
          </button>
        </div>
      ) : (
        <OfficeOverlay />
      )}
    </main>
  );
}
