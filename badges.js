"use strict";

/* =========================================================================
   Tetropolis — Achievement badges.
   A set of milestone badges the player unlocks over time — first city merge,
   first continent clear, a deep cascade chain, score milestones in a single
   run, clearing a Sprint, and reaching a 7-day Daily streak. Each badge
   latches once-earned and is kept forever under this module's own localStorage
   key (`tetropolis.badges`), separate from the high-score table (scores.js),
   the Daily record (daily.js), the Sprint best time (sprint.js) and the
   best-chain record (combo.js). No network: the badges live only in the
   player's own browser.

   This module owns the badge DEFINITIONS (the single source of truth for every
   badge's id, icon, name and description — the overlay grid and the on-board
   "unlocked" banner both read them here) and the earned/locked state. It NEVER
   reads or writes board or game state: game.js calls earn(id) at the exact
   points the triggering events already fire (a merge / continent clear / deep
   chain in resolveBoard, a score milestone at the same read-only chokepoints the
   best-score ticker uses, a Sprint clear in winSprint, a 7-day streak at a Daily
   game over) and reads the list to paint the grid. All localStorage access is
   wrapped in try/catch so the game still plays from a file:// page or a browser
   that blocks storage — it just won't remember what was unlocked.
   ========================================================================= */

window.Badges = (function () {
  const STORAGE_KEY = "tetropolis.badges";

  // The badge catalogue, in display order. `id` is the stable storage key; the
  // icon / name / desc drive the grid and the unlock banner. Thresholds live in
  // game.js where the events fire — this module only knows which ids exist.
  const BADGES = [
    { id: "first-merge",     icon: "🏙️", name: "City Planner",   desc: "Complete your first city merge." },
    { id: "first-continent", icon: "🌍", name: "Continental",     desc: "Clear your first continent." },
    { id: "chain-5",         icon: "⚡", name: "Chain Reaction",  desc: "Reach a ×5 cascade chain in one drop." },
    { id: "score-25k",       icon: "🥉", name: "25K Club",        desc: "Score 25,000 in a single run." },
    { id: "score-50k",       icon: "🥈", name: "50K Club",        desc: "Score 50,000 in a single run." },
    { id: "score-100k",      icon: "🥇", name: "100K Club",       desc: "Score 100,000 in a single run." },
    { id: "sprint-clear",    icon: "🏁", name: "Sprinter",        desc: "Clear a Sprint (reach the goal)." },
    { id: "streak-7",        icon: "🔥", name: "Regular",         desc: "Reach a 7-day Daily streak." },
  ];

  const IDS = BADGES.map((b) => b.id);
  const BY_ID = {};
  for (const b of BADGES) BY_ID[b.id] = b;

  // Read the earned set from storage, tolerating missing / corrupt / partial /
  // wrong-type JSON. Only known badge ids stored as `true` count as earned; any
  // unknown key or non-true value is ignored.
  function readStored() {
    const earned = {};
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return earned; }
    if (!raw) return earned;
    let o;
    try { o = JSON.parse(raw); } catch (e) { return earned; }
    if (!o || typeof o !== "object") return earned;
    for (const id of IDS) {
      if (o[id] === true) earned[id] = true;
    }
    return earned;
  }

  // The authoritative earned set for THIS page session, seeded once from storage.
  // Holding it in memory means a badge still latches within the session even when
  // localStorage is blocked (file:// / private mode) or throwing — so earn()'s
  // `isNew` can only be true once, and a per-frame caller (checkScoreBadges) can
  // never re-fire the unlock banner. When storage works, persist() also writes it
  // so the badge is remembered across sessions.
  const earned = readStored();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(earned)); } catch (e) { /* storage may be blocked — the in-memory set still latches this session */ }
  }

  // The full catalogue (fresh copies so callers can't mutate the definitions).
  function all() {
    return BADGES.map((b) => ({ id: b.id, icon: b.icon, name: b.name, desc: b.desc }));
  }

  // Has this badge already been earned? False for an unknown id.
  function isEarned(id) {
    if (!BY_ID[id]) return false;
    return earned[id] === true;
  }

  // How many badges are earned, and the total — for the grid header.
  function count() {
    let n = 0;
    for (const id of IDS) if (earned[id]) n++;
    return { earned: n, total: IDS.length };
  }

  // Earn a badge. Latches once per page session — a second call for the same id
  // (or an unknown id) is a no-op that returns isNew:false, even if localStorage
  // is blocked. Returns { isNew, badge }: whether THIS call unlocked it (so
  // game.js fires the banner exactly once) and the badge definition (null for an
  // unknown id).
  function earn(id) {
    const badge = BY_ID[id];
    if (!badge) return { isNew: false, badge: null };
    if (earned[id] === true) return { isNew: false, badge };
    earned[id] = true;
    persist();
    return { isNew: true, badge: { id: badge.id, icon: badge.icon, name: badge.name, desc: badge.desc } };
  }

  return { all, isEarned, count, earn };
})();
