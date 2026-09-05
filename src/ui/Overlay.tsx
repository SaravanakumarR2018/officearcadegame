import { useState } from 'react';
import { useGameStore } from '../game/store';
import { meltdownUnlocked } from '../game/rules';
import type { GameId } from '../types';
const labels: Record<GameId, string> = {
  inbox: 'Inbox Impact',
  bugs: 'Bug Hunt',
  server: 'Server Stack',
  coffee: 'Coffee Rush',
};
export function OfficeOverlay() {
  const s = useGameStore();
  const [settings, setSettings] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <div className="office-brand">
        <span>BLOCKWORKS</span>
        <b>OFFICE ARCADE</b>
      </div>
      <div className="objective">
        EXPLORE THE OFFICE <small>Every desk hides a challenge.</small>
      </div>
      <div className="progress-board">
        <h3>SHIFT PROGRESS</h3>
        {(Object.keys(labels) as GameId[]).map((g) => (
          <button data-testid={`workstation-${g}`} key={g} onClick={() => s.setScreen(g)}>
            <span>{labels[g]}</span>
            <b className={`medal ${s.medals[g]}`}>{s.medals[g]}</b>
            <small>{s.scores[g].toLocaleString()}</small>
          </button>
        ))}
        <button
          disabled={!meltdownUnlocked(s.medals)}
          onClick={() => s.setScreen('meltdown')}
          className="deadline"
          data-testid="deadline"
        >
          <span>Deadline Meltdown</span>
          <b>{meltdownUnlocked(s.medals) ? 'UNLOCKED' : 'EARN 4 MEDALS'}</b>
        </button>
      </div>
      <div className="cube-count">◆ {s.cubes}/12 PRODUCTIVITY CUBES</div>
      <div className="top-actions">
        <button data-testid="mute" aria-pressed={s.muted} onClick={s.toggleMute}>
          {s.muted ? '🔇' : '🔊'} M
        </button>
        <button data-testid="settings" aria-label="Settings" onClick={() => setSettings(true)}>
          ⚙
        </button>
        <button onClick={s.togglePause} data-testid="pause">
          Ⅱ ESC
        </button>
      </div>
      {(s.paused || settings) && (
        <div className="modal">
          <div className="panel">
            <span className="eyebrow">BLOCKWORKS</span>
            <h1>{settings ? 'SETTINGS' : 'PAUSED'}</h1>
            {settings && (
              <label>
                MASTER VOLUME
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={s.volume}
                  onChange={(e) => s.setVolume(+e.target.value)}
                />
              </label>
            )}
            <button
              className="primary"
              onClick={() => {
                if (s.paused) s.togglePause();
                setSettings(false);
              }}
            >
              Resume shift
            </button>
            <button onClick={() => setConfirm(true)}>Reset progress</button>
            {confirm && (
              <div className="confirm">
                <p>Erase every score, medal and collectible?</p>
                <button
                  onClick={() => {
                    s.reset();
                    setConfirm(false);
                  }}
                  data-testid="reset-progress"
                >
                  Yes, reset
                </button>
                <button onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
