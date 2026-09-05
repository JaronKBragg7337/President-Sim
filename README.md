# President Sim — The Executive Office

**[Play President Sim](https://jaronkbragg7337.github.io/President-Sim/)** · **[Play on Heartbeat Observatory](https://www.heartbeatobservatory.com/games/president-sim/)** · **[Play Classic](https://jaronkbragg7337.github.io/President-Sim/classic.html)**

The President will see you now. A CEO wants five minutes, your advisers disagree, and a governor returns with the consequences of your decision.

Free to play in a browser. No login or installation. Desktop and phone controls share the same episode.

## Episode 01: The price of progress

- A stylized 3D executive office with walking visitors and interactive desk objects.
- Four linked hearings: AI infrastructure, chip exports, a branching governor visit and a press interview.
- Questions, documents and competing interests before each signed directive.
- Five presidency indicators, 81 complete policy paths, immediate reactions and delayed consequences.
- A saved presidential record, resume on this device, and replay with different choices.
- Optional browser narration, Cinema view for filming, reduced-motion support and a complete briefing-mode fallback when WebGL is unavailable.
- Dated source notes that separate real premises from fictional meetings and outcomes.

This is the first playable 3D episode. It does not yet include free walking, other White House rooms, open-ended conversations, persistent NPC relationships or automatically refreshed news. The previous 16-round game is preserved as Classic.

Independent fiction inspired by public events. Not affiliated with the White House. Public figures are stylized dramatizations; their dialogue is invented. Numerical outcomes are game rules, not predictions. The source panel includes verification and review dates.

## Develop

```sh
npm ci
npm test
npm run build
python -m http.server 4173
```

Open `http://localhost:4173` for local development. The release bundle is committed in `assets/app.js`, so GitHub Pages serves the project without a runtime build or external JavaScript CDN. Fonts have local fallbacks if Google Fonts is unavailable.

If a cloud-synced Windows drive prevents npm from extracting dependencies, build a copy in a normal local temporary directory, then copy back the generated bundle. Do not edit installed dependencies.

`npm test` traverses all 81 paths, checks save restoration in both briefing/reaction phases, validates delayed consequences, and verifies clamping and invalid-input handling. Browser tests complement these engine checks.

Build identity is stored in `src/main.js`; keep it aligned with the script and stylesheet cache keys in `index.html` for releases. When syncing Heartbeat, copy `index.html`, `styles.css`, `icon.svg`, `classic.html`, `THREE-LICENSE.txt` and `assets/` to `games/president-sim/`. Verify both public origins; their device-local saves are separate.

## Direction and credits

[Design and architecture](docs/DESIGN.md) · [Suggested gameplay video](docs/VIDEO.md)

Created by [Jaron K. Bragg](https://github.com/JaronKBragg7337) with Codex. Office and characters use original procedural geometry. Three.js is MIT licensed; see [THREE-LICENSE.txt](THREE-LICENSE.txt). DM Sans and Libre Caslon Display are delivered through Google Fonts.
