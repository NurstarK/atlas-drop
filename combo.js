"use strict";

/* =========================================================================
   Tetropolis — best-cascade-chain record.
   A cascade "chain" is how many scoring passes one board-resolve runs (the
   same ×N depth the sidebar combo counter and the end-of-run stats panel
   show). This module owns nothing but the player's deepest chain ever reached,
   kept per mode under its own localStorage key — separate from the endless
   high-score table (scores.js), the Daily record (daily.js) and the Sprint best
   time (sprint.js). Endless, Daily and Sprint are tracked independently so each
   mode keeps its own target to beat.

   Higher is better. All localStorage access is wrapped in try/catch so the game
   still plays from a file:// page or a browser that blocks storage — it just
   won't remember the record. No network: the record lives only in the player's
   own browser.

   This module NEVER reads or writes board or game state. game.js reads the
   record to show "best chain so far" on the overlays, and records a run's new
   deepest chain here the moment it beats the stored best.
   ========================================================================= */

window.Combo = (function () {
  const STORAGE_KEY = "tetropolis.combo";
  const MODES = ["endless", "daily", "sprint"];

  function blank() { return { endless: 0, daily: 0, sprint: 0 }; }

  // Read the stored record, tolerating missing / corrupt / partial / wrong-type
  // JSON. Any mode whose value is missing or invalid simply reads back as 0.
  function read() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return blank(); }
    if (!raw) return blank();
    let o;
    try { o = JSON.parse(raw); } catch (e) { return blank(); }
    if (!o || typeof o !== "object") return blank();
    const rec = blank();
    for (const m of MODES) {
      const v = o[m];
      if (typeof v === "number" && isFinite(v) && v > 0) rec[m] = Math.floor(v);
    }
    return rec;
  }

  function write(rec) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rec)); } catch (e) { /* storage may be blocked */ }
  }

  // Best chain recorded for a mode — 0 if none (or an unknown mode).
  function best(mode) {
    if (MODES.indexOf(mode) === -1) return 0;
    return read()[mode] || 0;
  }

  // Record a run's chain depth for a mode. Keeps the deeper of the stored best
  // and this one. Returns { best, isNew }: the best after this call, and whether
  // this run set a new record (strictly deeper than the stored one).
  function record(mode, chain) {
    chain = Math.max(0, Math.floor(chain || 0));
    if (MODES.indexOf(mode) === -1) return { best: 0, isNew: false };
    const rec = read();
    const prev = rec[mode] || 0;
    const isNew = chain > prev;
    if (isNew) { rec[mode] = chain; write(rec); }
    return { best: isNew ? chain : prev, isNew };
  }

  return { best, record };
})();
