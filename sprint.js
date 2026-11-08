"use strict";

/* =========================================================================
   Tetropolis — Sprint mode record.
   Sprint is a race: reach a fixed score goal as fast as you can. This module
   owns nothing but the player's best Sprint time, kept under its own
   localStorage key — separate from the endless high-score table (scores.js)
   and the Daily record (daily.js). No network: the time lives only in the
   player's own browser.

   A time is recorded only when a run actually REACHES the goal (a run that tops
   out short of it is a did-not-finish and records nothing). Lower is better. The
   goal the time was set at is stored alongside it, so if the goal ever changes
   an old time for a different goal is simply ignored rather than shown as a
   record for the new one. All localStorage access is wrapped in try/catch so the
   game still plays from a file:// page or a browser that blocks storage — it just
   won't remember the best time.

   This module NEVER reads or writes board or game state. game.js reads the best
   time to show it, and records a finished Sprint's time here on a Sprint win.
   ========================================================================= */

window.Sprint = (function () {
  const STORAGE_KEY = "tetropolis.sprint";

  function blank() { return { goal: 0, bestMs: 0 }; }

  // Read the stored record, tolerating missing / corrupt / partial / legacy JSON.
  function read() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return blank(); }
    if (!raw) return blank();
    let o;
    try { o = JSON.parse(raw); } catch (e) { return blank(); }
    if (!o || typeof o !== "object") return blank();
    const goal = typeof o.goal === "number" && isFinite(o.goal) ? Math.max(0, Math.floor(o.goal)) : 0;
    const bestMs = typeof o.bestMs === "number" && isFinite(o.bestMs) ? Math.max(0, Math.floor(o.bestMs)) : 0;
    return { goal, bestMs };
  }

  function write(rec) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rec)); } catch (e) { /* storage may be blocked */ }
  }

  // Best time (ms) recorded for the given goal — 0 if none, or if the stored
  // best was set at a different goal (so it isn't comparable).
  function best(goal) {
    const rec = read();
    return rec.goal === goal && rec.bestMs > 0 ? rec.bestMs : 0;
  }

  // Record a finished (goal-reached) Sprint of `ms` milliseconds at `goal`.
  // Returns { best, isNew }: the best time after this run, and whether this run
  // set a new best (faster than the stored one, or the first time at this goal).
  function record(goal, ms) {
    ms = Math.max(0, Math.floor(ms || 0));
    const prev = best(goal);               // 0 when none / different goal
    const isNew = prev === 0 || ms < prev;
    const bestMs = isNew ? ms : prev;
    write({ goal, bestMs });
    return { best: bestMs, isNew };
  }

  return { best, record };
})();
