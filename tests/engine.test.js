import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  decide,
  advance,
  restore,
  applyEffects,
  ending,
} from "../src/engine.js";
import { hearing } from "../src/scenarios.js";
test("all 81 policy paths complete, remain bounded and restore exactly at every phase", () => {
  let count = 0;
  function visit(s) {
    assert.deepEqual(restore(JSON.stringify(s)), s);
    for (const n of Object.values(s.stats)) assert.ok(n >= 0 && n <= 100);
    if (s.phase === "ending") {
      count++;
      assert.equal(s.history.length, 4);
      assert.ok(ending(s).score >= 0 && ending(s).score <= 100);
      return;
    }
    const h = hearing(s);
    assert.ok(h);
    for (const c of h.choices) {
      const reaction = decide(s, c.id);
      assert.equal(reaction.history.length, s.history.length + 1);
      assert.equal(decide(reaction, c.id), reaction, "double sign is ignored");
      assert.deepEqual(restore(JSON.stringify(reaction)), reaction);
      visit(advance(reaction));
    }
  }
  visit(initial());
  assert.equal(count, 81);
});
test("governor event remembers each power policy and arrives only once", () => {
  const titles = new Set(),
    stats = new Set();
  for (const id of ["fast", "guard", "pause"]) {
    let s = advance(decide(initial(), id));
    s = advance(decide(s, "limited"));
    titles.add(hearing(s).title);
    stats.add(JSON.stringify(s.stats));
    assert.ok(s.arrival);
    assert.equal(advance(s), s);
    assert.ok(hearing(s).documents[0].body.includes(s.history[0].detail));
  }
  assert.equal(titles.size, 3);
  assert.equal(stats.size, 3);
});
test("invalid saves and input cannot manufacture stats or skip hearings", () => {
  for (const bad of [
    "nope",
    "null",
    "{}",
    JSON.stringify({ ...initial(), step: 3 }),
    JSON.stringify({ ...initial(), history: [{ id: "not-real" }] }),
  ])
    assert.equal(restore(bad), null);
  const altered = { ...initial(), stats: { economy: 99999 } };
  assert.deepEqual(restore(JSON.stringify(altered)), initial());
  assert.equal(decide(initial(), "missing").history.length, 0);
});
test("deltas reflect clamped values", () => {
  assert.deepEqual(
    applyEffects({ approval: 98, unrest: 3 }, { approval: 12, unrest: -10 }),
    { approval: 100, unrest: 0 },
  );
});
