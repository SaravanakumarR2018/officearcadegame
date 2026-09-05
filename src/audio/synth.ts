let context: AudioContext | undefined;
export function sound(
  kind: 'good' | 'bad' | 'jump' | 'win' | 'click',
  muted = false,
  volume = 0.5,
) {
  if (muted) return;
  try {
    context ??= new AudioContext();
    const o = context.createOscillator(),
      g = context.createGain();
    const hz = { good: 620, bad: 150, jump: 330, win: 880, click: 420 }[kind];
    o.frequency.setValueAtTime(hz, context.currentTime);
    if (kind === 'win') o.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.2);
    g.gain.setValueAtTime(volume * 0.11, context.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    o.connect(g).connect(context.destination);
    o.start();
    o.stop(context.currentTime + 0.2);
  } catch {
    /* playable without WebAudio */
  }
}
