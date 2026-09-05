import { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';
export function Meltdown() {
  const duration = __TEST_MODE__ ? 4 : 45;
  const { setScreen, winMeltdown, paused, togglePause } = useGameStore();
  const [time, setTime] = useState(duration),
    [score, setScore] = useState(0),
    [done, setDone] = useState(false);
  useEffect(() => {
    if (done || paused) return;
    const t = setInterval(() => setTime((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [done, paused]);
  useEffect(() => {
    if (time === 0) setDone(true);
  }, [time]);
  const hit = () => {
    if (done || paused) return;
    const nextScore = score + 125;
    setScore(nextScore);
    if (nextScore >= 1500) {
      setDone(true);
      winMeltdown();
    }
  };
  const restart = () => {
    setTime(duration);
    setScore(0);
    setDone(false);
    if (paused) togglePause();
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !done) togglePause();
      if (event.key.toLowerCase() === 'r') restart();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });
  return (
    <main className="game-screen meltdown" data-testid="game-screen">
      <header className="game-hud">
        <button onClick={() => setScreen('office')} data-testid="exit-game">
          ← EVACUATE
        </button>
        <div>
          <b>THE DEADLINE MELTDOWN</b>
          <small>Stabilize every runaway system!</small>
        </div>
        <div className="stat">
          SCORE <strong data-testid="meltdown-score">{score}</strong>
        </div>
        <div className="stat">
          TIME <strong>{time}</strong>
        </div>
      </header>
      <section className="meltdown-stage">
        <div className="alarm">⚠ SYSTEMS CRITICAL ⚠</div>
        {['MESSAGES', 'BUGS', 'SERVERS', 'COFFEE'].map((x, i) => (
          <button
            data-testid="stabilize"
            onClick={hit}
            key={x}
            style={{ transform: `rotate(${i * 4 - 6}deg)` }}
          >
            <i />
            STABILIZE {x}
          </button>
        ))}
      </section>
      {paused && !done && (
        <div className="modal">
          <div className="panel">
            <h1>MELTDOWN PAUSED</h1>
            <button className="primary" onClick={togglePause}>
              Resume
            </button>
            <button onClick={restart}>Restart event</button>
            <button onClick={() => setScreen('office')}>Exit to office</button>
          </div>
        </div>
      )}
      {done && (
        <div className="modal">
          <div className="panel result">
            <span className="eyebrow">{score >= 1500 ? 'OFFICE SAVED' : 'DEADLINE MISSED'}</span>
            <h1>{score >= 1500 ? 'BLOCKS REASSEMBLED!' : 'TRY THE RESCUE AGAIN'}</h1>
            <p>
              {score >= 1500
                ? 'Coworkers celebrate beneath a storm of voxel confetti. Prism suit unlocked!'
                : 'Prioritize every system and move faster.'}
            </p>
            <div className="confetti">◆ ■ ▲ ● ◆ ■</div>
            <button className="primary" onClick={restart} data-testid="retry-meltdown">
              RETRY EVENT
            </button>
            <button onClick={() => setScreen('office')}>Return to office</button>
          </div>
        </div>
      )}
    </main>
  );
}
