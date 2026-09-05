import { hearing, pack } from "./scenarios.js";
export const labels = {
  approval: "Approval",
  unrest: "Civil unrest",
  morality: "Moral standing",
  economy: "Economy",
  global: "Global standing",
};
export const initial = () => ({
  version: pack.version,
  pack: pack.id,
  step: 0,
  phase: "briefing",
  stats: { approval: 55, unrest: 25, morality: 60, economy: 55, global: 55 },
  flags: {},
  history: [],
  news: [],
  arrival: null,
});
export function applyEffects(stats, effects) {
  const next = { ...stats };
  for (const [key, value] of Object.entries(effects))
    next[key] = Math.max(0, Math.min(100, next[key] + value));
  return next;
}
export function decide(state, id) {
  if (state.phase !== "briefing") return state;
  const h = hearing(state),
    c = h?.choices.find((c) => c.id === id);
  if (!c) return state;
  const stats = applyEffects(state.stats, c.effects);
  const delta = Object.fromEntries(
    Object.keys(labels).map((k) => [k, stats[k] - state.stats[k]]),
  );
  return {
    ...state,
    stats,
    phase: "reaction",
    flags: { ...state.flags, [h.id]: c.flag },
    history: [
      ...state.history,
      {
        hearing: h.id,
        id: c.id,
        title: c.title,
        detail: c.detail,
        reaction: c.reaction,
        week: h.week,
        delta,
      },
    ],
    news: [c.headline, ...state.news].slice(0, 5),
    arrival: null,
  };
}
export function advance(state) {
  if (state.phase !== "reaction") return state;
  const next = {
    ...state,
    step: state.step + 1,
    phase: state.step === 3 ? "ending" : "briefing",
    arrival: null,
  };
  const h = hearing(next);
  if (h?.arrival) {
    next.stats = applyEffects(next.stats, h.arrival);
    next.arrival = h.headline;
    next.news = [h.headline, ...next.news].slice(0, 5);
  }
  return next;
}
export function restore(raw) {
  try {
    const saved = JSON.parse(raw);
    if (
      saved.pack !== pack.id ||
      saved.version !== pack.version ||
      !Array.isArray(saved.history) ||
      saved.history.length > 4
    )
      return null;
    let state = initial();
    for (let i = 0; i < saved.history.length; i++) {
      const before = state;
      state = decide(state, saved.history[i].id);
      if (before === state) return null;
      if (i < saved.history.length - 1 || saved.phase !== "reaction")
        state = advance(state);
    }
    if (state.phase !== saved.phase || state.step !== saved.step) return null;
    return state;
  } catch {
    return null;
  }
}
export function ending(state) {
  const s = state.stats;
  const score = Math.round(
    (s.approval + (100 - s.unrest) + s.morality + s.economy + s.global) / 5,
  );
  const title =
    s.unrest >= 45
      ? "A presidency under pressure"
      : s.economy >= 75
        ? "The growth presidency"
        : s.morality >= 78
          ? "A presidency on the record"
          : s.global >= 68
            ? "The coalition builder"
            : "A complicated first chapter";
  const power = {
    fast: "You put speed first. The governor brought the uncovered costs back to your desk.",
    guard:
      "You negotiated protections. When the schedule slipped, you had to decide whether your conditions still mattered.",
    pause:
      "You asked for evidence before momentum. When investment wavered, you had to choose what was worth recovering.",
  }[state.flags.power];
  return {
    score,
    title,
    text: power + " The record now includes how you handled the consequences.",
    outlook:
      s.unrest >= 40
        ? "Public opposition is organized. Your next proposal will face a harder hearing."
        : s.economy < 50
          ? "Investment confidence needs repair. The next meeting will test whether you can offer a credible path."
          : "You have room to act, but every promise has created someone who expects delivery.",
  };
}
