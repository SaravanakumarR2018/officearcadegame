import { useEffect, useMemo, useState } from 'react';
import type { GameId } from '../types';
import { medalFor, scoreAction } from '../game/rules';
import { useGameStore } from '../game/store';
import { sound } from '../audio/synth';

const info = {
  inbox: {
    title: 'INBOX IMPACT',
    subtitle: 'Route message blocks before chaos wins.',
    actions: ['URGENT', 'IMPORTANT', 'SPAM', 'LATER'],
    hint: 'Match the flashing route. 1–4 keys work too.',
  },
  bugs: {
    title: 'BUG HUNT',
    subtitle: 'Capture escaped voxel bugs.',
    actions: ['ZAP', 'NET', 'SCAN', 'FREEZE'],
    hint: 'Pick the tool matching each bug. Golden bugs are worth more.',
  },
  server: {
    title: 'SERVER STACK',
    subtitle: 'Build a stable, powered tower.',
    actions: ['RACK', 'LINK', 'COOL', 'POWER'],
    hint: 'Connect the matching module before it falls.',
  },
  coffee: {
    title: 'COFFEE RUSH',
    subtitle: 'Deliver brews through office traffic.',
    actions: ['LEFT', 'FORWARD', 'RIGHT', 'STEADY'],
    hint: 'Follow the safe lane and protect the coffee.',
  },
} as const;
export function ArcadeGame({ id }: { id: GameId }) {
  const duration = __TEST_MODE__ ? 4 : 35;
  const meta = info[id],
    { finish, setScreen, muted, volume, togglePause, paused } = useGameStore();
  const [tutorial, setTutorial] = useState(true),
    [time, setTime] = useState(duration),
    [score, setScore] = useState(0),
    [combo, setCombo] = useState(0),
    [target, setTarget] = useState(0),
    [ended, setEnded] = useState<'win' | 'loss' | null>(null),
    [round, setRound] = useState(0);
  const colors = ['#ff5f6d', '#ffd166', '#22d3a7', '#60a5fa'];
  useEffect(() => {
    if (tutorial || paused || ended) return;
    const t = setInterval(() => setTime((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [tutorial, paused, ended]);
  useEffect(() => {
    if (time === 0 && !ended) {
      setEnded(score >= 500 ? 'win' : 'loss');
      if (score >= 500) finish(id, score);
    }
  }, [time, score, ended, finish, id]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !tutorial && !ended) togglePause();
      if (e.key.toLowerCase() === 'r') restart();
      const n = Number(e.key) - 1;
      if (n >= 0 && n < 4) act(n);
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  });
  const difficulty = useMemo(() => 1 + Math.floor(round / 6), [round]);
  function act(i: number) {
    if (tutorial || paused || ended) return;
    if (i === target) {
      const c = combo + 1,
        b = id === 'bugs' && round % 11 === 10 ? 180 : 80;
      setCombo(c);
      setScore((v) => v + scoreAction(b, c));
      sound('good', muted, volume);
    } else {
      setCombo(0);
      setScore((v) => Math.max(0, v - 40));
      sound('bad', muted, volume);
    }
    setRound((v) => v + 1);
    setTarget((target + difficulty + (round % 3)) % 4);
  }
  function restart() {
    setTutorial(false);
    setTime(duration);
    setScore(0);
    setCombo(0);
    setTarget(0);
    setEnded(null);
    setRound(0);
  }
  return (
    <main className={`game-screen game-${id}`} data-testid="game-screen">
      <header className="game-hud">
        <button onClick={() => setScreen('office')} data-testid="exit-game">
          ← OFFICE
        </button>
        <div>
          <b>{meta.title}</b>
          <small>{meta.subtitle}</small>
        </div>
        <div className="stat">
          SCORE <strong data-testid="score">{score}</strong>
        </div>
        <div className="stat">
          TIME <strong>{time}</strong>
        </div>
        <button onClick={togglePause} data-testid="pause">
          Ⅱ
        </button>
      </header>
      <section className="arcade-stage">
        <div className="stage-grid" />
        <div
          className="challenge-object"
          style={{ '--voxel': colors[target] } as React.CSSProperties}
        >
          <i />
          <i />
          <i />
          <i />
          <span data-testid="active-target">{meta.actions[target]}</span>
        </div>
        <div className="combo">
          COMBO ×{combo} · LEVEL {difficulty}
        </div>
      </section>
      <nav className="action-grid">
        {meta.actions.map((a, i) => (
          <button
            key={a}
            style={{ '--accent': colors[i] } as React.CSSProperties}
            onClick={() => act(i)}
          >
            {i + 1}
            <b>{a}</b>
          </button>
        ))}
      </nav>
      {tutorial && (
        <div className="modal tutorial">
          <div className="panel">
            <span className="eyebrow">QUICK BRIEFING</span>
            <h1>{meta.title}</h1>
            <p>{meta.hint}</p>
            <div className="tutorial-art">◆ ◆ ◆</div>
            <button className="primary" onClick={() => setTutorial(false)}>
              START SHIFT
            </button>
            <button onClick={() => setScreen('office')}>Back to office</button>
          </div>
        </div>
      )}
      {paused && (
        <div className="modal">
          <div className="panel">
            <h1>SHIFT PAUSED</h1>
            <button className="primary" onClick={togglePause}>
              Resume
            </button>
            <button onClick={restart}>Restart</button>
            <button onClick={() => setScreen('office')}>Exit to office</button>
          </div>
        </div>
      )}
      {ended && (
        <div className="modal">
          <div className="panel result">
            <span className="eyebrow">{ended === 'win' ? 'SHIFT COMPLETE' : 'TIME EXPIRED'}</span>
            <h1>
              {ended === 'win' ? `${medalFor(id, score).toUpperCase()} RATING` : 'INBOX CHAOS!'}
            </h1>
            <div className="final-score">{score}</div>
            <button className="primary" onClick={restart} data-testid="retry">
              TRY AGAIN
            </button>
            <button onClick={() => setScreen('office')}>Return to office</button>
          </div>
        </div>
      )}
    </main>
  );
}
