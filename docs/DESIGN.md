# President Sim: The Executive Office

Owner: Jaron K. Bragg. First 3D episode: September 4, 2026.

The design comes from Jaron’s memory of Fable III’s ruler hearings: people physically approach someone with authority, ask for a decision, and live with the result. President Sim brings that feeling into a contemporary presidency. The reference is an interaction pattern; no Fable assets or dialogue are used.

## Playable now

One procedural executive office with a moving camera, an opening door, animated visitors, a desk folder, telephone, state-driven monitor and an exterior crowd when unrest rises. The same actions are exposed as keyboard and touch buttons. The room uses original stylized geometry; it is not a photoreal reconstruction of the Oval Office.

Episode 01, “The price of progress,” has four meetings. The first decision selects one of three different governor encounters. Each meeting has three policy choices, producing 81 complete paths. Questions provide additional viewpoints; documents distinguish premises, objectives and risks. A separate signing step records the decision. Immediate reactions and numerical effects precede the next meeting. The governor’s arrival applies delayed effects once, and later dialogue remembers previous directives.

The five original concepts remain: approval, civil unrest, moral standing, economy and global standing. Lower unrest means a calmer country. Scores are authored gameplay assumptions, not economic forecasts or objective judgments about actual people. Real CEOs appear as stylized dramatizations with invented dialogue. Advisers, governor and reporter are fictional.

## Separation of responsibilities

- `src/scenarios.js`: dated pack metadata, cited premises, actors and their motives, questions, documents, choices, immediate effects and conditional follow-ups.
- `src/engine.js`: deterministic state transitions, clamping, history, save reconstruction and endings. No dependency on graphics or the browser.
- `src/scene.js`: Three.js office, materials, static-geometry batching, camera, animations, physical interactions and state-driven visuals.
- `src/main.js`: conversation and briefing UI, keyboard/touch access, optional speech, device save and rendering fallback.
- `styles.css`: desktop cinematic composition and a scrollable phone layout that retains the full episode.
- `classic.html`: previous game retained separately, including its existing high-score key.

The current sequence is explicitly four hearings; adding longer campaigns requires changing the sequence and its presentation. The room itself does not encode event-specific dialogue. Additions should evolve the episode scheduler before multiplying scenario-specific branches.

## Editorial policy

Each pack has a stable ID, version, verification date and review date. The Sources panel flags an overdue pack. Source verification is an editorial task; this build does not claim to fetch or verify live news automatically. Historical export-policy material is labeled historical and must not be described as current law.

Facts from White House or company announcements describe what was announced, not proof that promised outcomes happened. Independent reporting provides context. Real meetings are premises; choices, consequences, conversations and visiting officials in the game are fiction. Research fresh premises before publishing a new pack; bump its ID/version when changing the decision contract.

## Persistence and publishing

Saves record the pack identity and policy path under `president-sim-office-v1`. Loading reconstructs the state through the same engine rather than trusting stored scores. Save storage can be unavailable; the episode still plays. Saves are local to each browser origin, so the GitHub Pages and Heartbeat versions do not share a save.

The committed bundle is the public release artifact. Build from the source, update the build marker and script/CSS cache keys, then sync the static files to Heartbeat’s `games/president-sim/`. Both URLs must be checked after publishing. The game is independent of Heartbeat’s multiplayer and account systems.

## Next development priorities

1. Improve character art, facial expression, seated conversations, gestures and departure choreography after feedback on the first episode.
2. Introduce a general event scheduler with prerequisites, deadlines, promises, durable character relationships and optional interruptions. Retain deterministic, testable state transitions.
3. Add a second episode with newly verified events, then cabinet and press-room locations when their interactions justify the spaces.
4. Add alternative consequence models and playtest balance; a single composite index must not become the sole definition of a successful presidency.
5. Consider authored voice performances and a shot sequencer for capture. The current Voice toggle uses ordinary browser synthesis; Cinema hides panels but does not record video.

The full persistent presidency is the direction. This release is its first complete playable episode, not an open world or an autonomous current-events service.
