# BLOCKWORKS: OFFICE ARCADE

**A colorful 3D voxel workplace where every desk hides a challenge.** Explore a handcrafted office diorama, earn medals in four original arcade activities, collect Productivity Cubes, and save the building from the Deadline Meltdown.

## Features

- Real-time aerial opening cinematic flowing into an over-the-shoulder playable office.
- Rich procedural voxel environment: reception, meeting room, developer and communications clusters, break room, server room, lounge, manager cabin, plants, city windows, coworkers, printers, and animated props.
- **Inbox Impact** message sorting, **Bug Hunt** capture tools, **Server Stack** modular connections, and **Coffee Rush** delivery lanes.
- Bronze, silver, and gold scores, combos, rising difficulty, tutorials, retries, persistent high scores, collectibles, cosmetics, and the unlockable **Deadline Meltdown** finale.
- Synthesized Web Audio feedback—no external assets or licenses—and local-only persistence.
- Responsive keyboard/mouse UI, pause/settings, muted fallback, deterministic rules, and GitHub Pages subpath support.

## Controls

| Input         | Action                |
| ------------- | --------------------- |
| WASD / arrows | Move                  |
| Mouse drag    | Orbit camera          |
| Shift         | Sprint                |
| Space         | Jump / skip cinematic |
| E             | Interact              |
| Escape        | Skip, pause, or leave |
| M             | Mute                  |
| R             | Restart active game   |
| 1–4           | Mini-game action      |

## Setup and commands

Requires Node.js 20+ and npm.

```bash
npm ci
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

The Vite development URL is printed to the terminal. The production base is `/officearcadegame/`; preview the built app with `npm run preview`.

## Project structure

```text
src/world       Three.js environment, camera, player, NPCs
src/games       Four arcade modes and finale
src/game        scoring, progression, persistence
src/audio       Web Audio synthesizer
src/ui          HUD and overlays
tests           Playwright browser journeys
.github/workflows validation and Pages deployment
```

## Persistence and troubleshooting

Progress and volume live in `localStorage` under `blockworks-progress`. Use **Settings → Reset progress** for a clean save. If audio is silent, click once inside the page to satisfy browser autoplay rules. For poor GPU performance, close other WebGL tabs; the scene limits pixel ratio, shadows, and shared geometry. If Playwright lacks a browser, run `npx playwright install chromium`.

## Deployment

CI validates pushes and pull requests. The Pages workflow validates and deploys only from the default branch (`main` or this repository's original `work` branch), never a feature branch. In repository settings choose **GitHub Actions** as the Pages source.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Released under the existing [MIT License](LICENSE). All visuals are procedural geometry and all sound is generated at runtime.
