import { createOffice } from "./scene.js";
import { hearing, actors, pack } from "./scenarios.js";
import { initial, decide, advance, restore, ending, labels } from "./engine.js";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let state = initial(),
  office = null,
  started = false,
  heard = new Set(),
  panel = "briefing",
  pending = null,
  voice = false,
  speechText = "",
  speechActor = "aide",
  noticeTimer,
  storageAvailable = true;
const saveKey = "president-sim-office-v1";
let saved = null;
try {
  saved = restore(localStorage.getItem(saveKey));
} catch {
  storageAvailable = false;
}
const BUILD = "2026-09-04-office-2";
document.body.dataset.build = BUILD;
function notify(text) {
  $("#notice").textContent = text;
  $("#notice").hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => ($("#notice").hidden = true), 6500);
}
function save() {
  try {
    localStorage.setItem(saveKey, JSON.stringify(state));
    $("#save-status").textContent = "Saved on this device";
  } catch {
    storageAvailable = false;
    $("#save-status").textContent = "Playing without a save";
  }
}
function say(text, id) {
  speechText = text;
  speechActor = id;
  if (!voice || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.96;
  u.pitch = id === "energy" || id === "governor" ? 1.06 : 0.94;
  u.lang = "en-US";
  speechSynthesis.speak(u);
}
function statsHTML() {
  return Object.entries(labels)
    .map(
      ([k, v]) =>
        `<div class="stat ${k}"><div class="stat-top"><span class="stat-label">${v}</span><span class="stat-value">${state.stats[k]}<small>/100</small></span></div><div class="stat-track" role="meter" aria-label="${v}${k === "unrest" ? " (lower is calmer)" : ""}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state.stats[k]}"><div class="stat-fill" style="width:${state.stats[k]}%"></div></div></div>`,
    )
    .join("");
}
function effectHTML(delta) {
  return `<div class="effect-list">${Object.entries(delta)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<span class="${(k === "unrest" ? v < 0 : v > 0) ? "positive" : "negative"}">${labels[k]} ${v > 0 ? "+" : ""}${v}</span>`,
    )
    .join("")}</div>`;
}
function avatar(id) {
  const a = actors[id];
  return `<span class="avatar" style="--actor:${a.color}">${a.name
    .split(" ")
    .filter((n) => n !== "Dr.")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")}</span>`;
}
function conversation(
  id,
  text,
  tag = "FICTIONAL DIALOGUE · YOUR PRESIDENCY",
  extra = "",
) {
  const a = actors[id];
  $("#conversation").innerHTML =
    `<div class="speaker-row">${avatar(id)}<span class="speaker-name">${a.name}<small class="speaker-role">${a.role}</small></span></div><blockquote>${esc(text)}</blockquote><div class="dialogue-tag"><span>${tag}</span><span>EPISODE 01</span></div>${extra}`;
  say(text, id);
}
function updateHUD() {
  $("#stats").innerHTML = statsHTML();
  $("#record-count").textContent = state.history.length;
  $("#ticker p").textContent =
    state.news[0] || "Awaiting your first directive.";
  office?.update(state);
}
function focusPanel() {
  const h = $("#briefing h2");
  if (h) {
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }
  if (innerWidth <= 850)
    $("#briefing").scrollIntoView({ behavior: "smooth", block: "start" });
  else $("#briefing").scrollTop = 0;
}
function heading(h) {
  return `<div class="briefing-head"><span>${h.kicker}</span><span class="chapter">${h.chapter} <small>/ 04</small></span></div><h2>${h.title}</h2>`;
}
function renderBriefing() {
  const h = hearing(state);
  if (!h) return;
  let html = heading(h);
  if (state.phase === "reaction") {
    const c = state.history.at(-1);
    html += `<p class="eyebrow">DIRECTIVE SIGNED</p><div class="signature">The President</div><p class="context">${esc(c.title)}</p><p class="confirmation-sub">${esc(c.detail)}</p><div class="divider"></div><p class="section-label">YOUR ADMINISTRATION IS MOVING</p><p class="context">The room has heard your decision. Its effects now belong to your presidency.</p><button class="document-button" data-modal="record">View the presidential record →</button><div class="progress-dots">${[0, 1, 2, 3].map((i) => `<span class="${i <= state.step ? "done" : ""}"></span>`).join("")}</div>`;
  } else if (panel === "briefing") {
    html += `<p class="context">${esc(h.context)}</p>${state.arrival ? `<div class="arrival-note">FROM YOUR EARLIER DECISION<br>${esc(state.arrival)}</div>` : ""}<p class="section-label">IN THE ROOM</p><div class="visitor-list">${h.visitors.map((id) => `<button class="visitor" data-actor="${id}">${avatar(id)}<span>${actors[id].name.replace("Dr. ", "")}<small>${id === h.lead ? "Visiting your office" : "Advising you"}</small></span></button>`).join("")}</div><button class="document-button" data-document="0"><span>▤</span><div>Open the briefing folder<small>${h.documents.length} ${h.documents.length === 1 ? "document" : "documents"} on your desk</small></div></button><div class="divider"></div><p class="section-label">BEFORE YOU DECIDE</p>${h.questions.map((q) => `<button class="question ${heard.has(q.id) ? "heard" : ""}" data-question="${q.id}">${esc(q.label)}<span>${heard.has(q.id) ? "✓" : "↗"}</span></button>`).join("")}<button class="primary decision-call" data-action="choices">Make your decision →</button><p class="decision-hint">${heard.size} of ${h.questions.length} questions explored · Take the time you need.</p>`;
  } else if (panel === "choices") {
    html += `<button class="back-button" data-action="briefing">← Return to the discussion</button><p class="context">Choose your administration’s position. You will review the directive before signing.</p>${h.choices.map((c, i) => `<button class="choice" data-choice="${c.id}"><span class="choice-number">OPTION 0${i + 1}</span><strong>${c.title}</strong><p>${c.detail}</p></button>`).join("")}`;
  } else if (panel === "confirm") {
    const c = h.choices.find((c) => c.id === pending);
    html += `<button class="back-button" data-action="choices">← Consider the alternatives</button><div class="confirm-box"><p class="section-label">PRESIDENTIAL DIRECTIVE</p><h3>${c.title}</h3><p>${c.detail}</p><div class="signature">Your decision. Your record.</div><button class="primary" data-action="sign">Sign this directive →</button></div><p class="confirmation-sub">Your visitors will respond immediately. Some consequences will take time to reach your desk.</p>`;
  }
  $("#briefing").innerHTML = html;
}
function renderReaction() {
  const c = state.history.at(-1);
  conversation(
    "aide",
    c.reaction,
    "DIRECTIVE SIGNED · IMMEDIATE EFFECTS",
    `${effectHTML(c.delta)}<div class="next"><small>${state.step === 3 ? "The first chapter is complete." : `Next appointment · Week ${hearing({ ...state, step: state.step + 1 }).week}`}</small><button class="primary" data-action="next">${state.step === 3 ? "Review your presidency" : "Admit the next visitors"} →</button></div>`,
  );
}
function showHearing() {
  const h = hearing(state);
  if (!h) {
    showEnding();
    return;
  }
  heard = new Set();
  panel = "briefing";
  pending = null;
  office?.enter(h.visitors);
  $("#clock-label").textContent = `WEEK ${h.week} · ${h.time}`;
  updateHUD();
  renderBriefing();
  if (state.phase === "reaction") renderReaction();
  else
    conversation(
      h.lead,
      h.intro,
      state.arrival
        ? "A PRIOR DECISION HAS RETURNED"
        : "FICTIONAL DIALOGUE · YOUR PRESIDENCY",
    );
  window.scrollTo({ top: 0, behavior: "instant" });
}
function start(resume = false) {
  state = resume && saved ? saved : initial();
  started = true;
  document.body.classList.add("playing");
  document.body.classList.remove("cinematic");
  office?.cinema(false);
  $("#cinema").setAttribute("aria-pressed", "false");
  $("#cinema").textContent = "Cinema";
  $("#welcome").hidden = true;
  $("#game").hidden = false;
  $("#ending").hidden = true;
  save();
  showHearing();
  if (!storageAvailable)
    notify(
      "Saving is unavailable in this browser. You can still play the full episode.",
    );
}
function recordHTML() {
  return state.history.length
    ? `<ol class="record-list">${state.history.map((h) => `<li><span>WEEK ${h.week} · ${h.hearing.toUpperCase()}</span><strong>${esc(h.title)}</strong><p>${esc(h.detail)}</p>${effectHTML(h.delta)}</li>`).join("")}</ol>`
    : "<p>Your record starts with the first directive you sign.</p>";
}
function showEnding() {
  document.body.classList.remove("cinematic");
  office?.cinema(false);
  $("#cinema").textContent = "Cinema";
  $("#cinema").setAttribute("aria-pressed", "false");
  $("#game").hidden = true;
  $("#ending").hidden = false;
  office?.view("desk");
  const e = ending(state);
  $("#ending").innerHTML =
    `<p class="eyebrow">EPISODE 01 · THE PRESIDENTIAL RECORD</p><h1>${e.title}</h1><p>${esc(e.text)}</p><div class="ending-score"><strong>${e.score}<small>/100</small></strong><span>COMPOSITE PRESIDENCY INDEX<br>Approval, calm, moral standing, economy and global standing.<br>Game mechanics, not a prediction of real-world outcomes.</span></div><p>${esc(e.outlook)}</p><details><summary>Review all four directives</summary>${recordHTML()}</details><div class="ending-actions"><button class="primary" data-action="restart">Play a different presidency →</button><button data-action="copy">Copy my presidential record</button><button data-modal="sources">Explore the sources</button></div><p class="session-note">The first playable chapter of President Sim. More situations can be added through scenario packs.</p>`;
  say(e.title + ". " + e.text, "aide");
  window.scrollTo({ top: 0, behavior: "instant" });
  $("#ending h1").tabIndex = -1;
  $("#ending h1").focus({ preventScroll: true });
}
function openModal(html) {
  $("#modal-content").innerHTML = html;
  const heading = $("#modal-content h2");
  if (heading) {
    heading.id = "modal-heading";
    $("#modal").setAttribute("aria-labelledby", "modal-heading");
  }
  if (!$("#modal").open) $("#modal").showModal();
  $("#modal").scrollTop = 0;
}
function showDocument(index) {
  const h = hearing(state);
  if (!h) return;
  const d = h.documents[index];
  office?.view("briefing");
  openModal(
    `<p class="eyebrow">BRIEFING ${index + 1} OF ${h.documents.length}</p><h2>${d.title}</h2><p>${esc(d.body)}</p><div class="facts">${d.metrics.map(([k, v]) => `<div class="fact"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`).join("")}</div>${h.documents.length > 1 ? `<button data-document="${(index + 1) % h.documents.length}">Next document →</button>` : ""}<button style="margin-left:8px" data-modal="sources">Sources ↗</button>`,
  );
}
function showModal(type) {
  if (type === "record")
    openModal(
      `<h2>The presidential record</h2><p>Your signed directives persist through the episode. Civil unrest is the one indicator where lower means calmer.</p>${recordHTML()}${state.news.length ? `<h3>Recent coverage</h3><ul>${state.news.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}`,
    );
  if (type === "sources") {
    const stale = new Date().toISOString().slice(0, 10) > pack.reviewAfter;
    openModal(
      `<p class="eyebrow">REAL PREMISES. A FICTIONAL PRESIDENCY.</p><h2>Behind the headlines</h2><p>Episode 01 draws on AI infrastructure, electricity-cost debates and historical chip-export negotiations. These meetings, dialogue, advisers, choices and numerical outcomes are authored fiction. Public figures appear as stylized dramatizations, not recorded testimony.</p><p>Evidence checked ${pack.verifiedAt}. ${stale ? "This pack is due for a source review; treat it as a dated scenario." : `Next editorial review due ${pack.reviewAfter}.`} This is a dated scenario pack, not a live news feed.</p><ol class="source-list">${pack.sources.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a><small>${s.date}</small>${s.note}</li>`).join("")}</ol><h3>Credits</h3><p>Created by Jaron K. Bragg with Codex. Original procedural environment and character geometry. Three.js (MIT) renders the office; its license is included with the source. Fonts: DM Sans and Libre Caslon Display via Google Fonts. Optional narration uses your browser’s synthetic voice, not a public figure’s voice.</p><p><a href="https://github.com/JaronKBragg7337/President-Sim" target="_blank" rel="noopener noreferrer">View the source on GitHub ↗</a></p>`,
    );
  }
  if (type === "how")
    openModal(
      "<h2>Take your seat.</h2><p>Visitors enter the office with a request. Select a person to hear what they want. Ask the questions in the briefing panel and open the folder on your desk for more context.</p><p>Choose “Make your decision,” review the options, then sign a directive. Hear the reaction before admitting the next visitors. Your first choice changes the governor’s later visit.</p><h3>Look around</h3><p>Use Desk, Visitors and Room to move the camera. Drag across the 3D view to look slightly left or right. The visitors, briefing folder, desk phone and monitor are clickable; the same actions are available as buttons.</p><h3>Make a video</h3><p>Turn on Cinema, or press C, to hide the briefing panels. Dialogue remains visible. Press C again or use the Cinema button to restore the controls. Voice is optional browser narration. No microphone or recording permission is requested.</p><h3>Your presidency</h3><p>The game saves automatically on this device. A complete episode has four hearings. Indicators represent authored game tradeoffs; civil unrest is better when lower. If 3D is unavailable, the same episode remains playable in briefing mode.</p>",
    );
}
function question(id) {
  const q = hearing(state)?.questions.find((q) => q.id === id);
  if (!q || state.phase !== "briefing") return;
  heard.add(id);
  panel = "briefing";
  renderBriefing();
  office?.select(q.actor);
  conversation(
    q.actor,
    q.text,
    "ADDITIONAL BRIEFING · " + q.label.toUpperCase(),
  );
  if (innerWidth <= 850)
    $("#conversation").scrollIntoView({ behavior: "smooth", block: "center" });
}
function actor(id) {
  if (!started || state.phase !== "briefing") return;
  const h = hearing(state),
    a = actors[id];
  if (!a) return;
  office?.select(id);
  conversation(
    id,
    id === h.lead ? h.intro : a.motive,
    "THEIR PRIORITY · " + a.role.toUpperCase(),
  );
  if (innerWidth <= 850)
    $("#conversation").scrollIntoView({ behavior: "smooth", block: "center" });
}
function cinema() {
  if (!started) {
    notify("Enter the office first, then use Cinema for a clean filming view.");
    return;
  }
  const enabled = document.body.classList.toggle("cinematic");
  office?.cinema(enabled);
  $("#cinema").setAttribute("aria-pressed", String(enabled));
  $("#cinema").textContent = enabled ? "Exit cinema" : "Cinema";
  if (enabled) {
    office?.view("visitors");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
$("#start").addEventListener("click", () => start());
$("#resume").addEventListener("click", () => start(true));
$("#cinema").addEventListener("click", cinema);
$("#sound").addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    notify(
      "This browser does not provide narration. All dialogue is available as text.",
    );
    return;
  }
  voice = !voice;
  $("#sound").textContent = voice ? "Voice on" : "Voice off";
  $("#sound").setAttribute("aria-pressed", String(voice));
  if (voice) say(speechText || "The President will see you now.", speechActor);
  else speechSynthesis.cancel();
});
$("#fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    else
      notify(
        "Fullscreen is unavailable here. Open the game directly for a larger view.",
      );
  } catch {
    notify(
      "Your browser did not allow fullscreen. The game is still playable.",
    );
  }
});
$("#close-modal").addEventListener("click", () => $("#modal").close());
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    const r = $("#modal").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      $("#modal").close();
  }
});
document.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "c" &&
    !$("#modal").open &&
    !/input|textarea/i.test(e.target.tagName)
  ) {
    cinema();
  }
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const d = b.dataset;
  if (d.modal) showModal(d.modal);
  if (d.document !== undefined) showDocument(Number(d.document));
  if (d.actor) actor(d.actor);
  if (d.question) question(d.question);
  if (d.view) {
    office?.view(d.view);
    document
      .querySelectorAll("[data-view]")
      .forEach((a) => a.setAttribute("aria-pressed", String(a === b)));
  }
  if (d.choice && state.phase === "briefing") {
    pending = d.choice;
    panel = "confirm";
    renderBriefing();
    focusPanel();
  }
  if (d.action === "choices" || d.action === "briefing") {
    if (state.phase !== "briefing") return;
    panel = d.action;
    renderBriefing();
    focusPanel();
  }
  if (d.action === "sign" && pending && state.phase === "briefing") {
    b.disabled = true;
    state = decide(state, pending);
    pending = null;
    save();
    updateHUD();
    renderBriefing();
    renderReaction();
    office?.react(state.history.at(-1).delta);
    office?.view("visitors");
    if (innerWidth <= 850)
      $("#conversation").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }
  if (d.action === "next" && state.phase === "reaction") {
    state = advance(state);
    save();
    showHearing();
  }
  if (d.action === "restart") start();
  if (d.action === "copy") {
    const text = `My President Sim record: ${ending(state).title}\n${state.history.map((h) => `Week ${h.week}: ${h.title}`).join("\n")}\nhttps://jaronkbragg7337.github.io/President-Sim/`;
    try {
      await navigator.clipboard.writeText(text);
      notify("Presidential record copied.");
    } catch {
      openModal(`<h2>Your record to share</h2><p>${esc(text)}</p>`);
    }
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && "speechSynthesis" in window) speechSynthesis.cancel();
});
function fail3D(message) {
  document.body.classList.add("fallback");
  notify(message);
}
try {
  office = createOffice(
    $("#office"),
    (id) => {
      if (id === "document") showDocument(0);
      else if (id === "record") showModal("record");
      else actor(id);
    },
    fail3D,
  );
  document.body.dataset.renderer = "webgl";
} catch (error) {
  console.warn("Office renderer unavailable:", error.message);
  document.body.dataset.renderer = "fallback";
  fail3D(
    "3D is unavailable on this device. The full episode is playable in briefing mode.",
  );
}
$("#start").disabled = false;
$("#start").textContent = "Take your seat →";
if (saved) {
  $("#resume").hidden = false;
  $("#start").textContent = "Start a new presidency";
}
document.body.dataset.ready = "true";
