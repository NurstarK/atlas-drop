"use strict";

/* =========================================================================
   Tetropolis — Settings.
   A small options overlay opened from the gear button next to Study on the
   game overlays. Three persisted options:

     • Ghost piece  — show (or hide) the landing-position outline.
     • Merge hint   — glow the landing cells when a hard drop right now would
                      complete a city merge (or cascade into a continent clear).
     • Grid lines   — show (or hide) the faint lines between board cells.
     • New-player hints — show the one-time Hold / Next coachmarks on a first
                      game (see coachmarks.js). Toggling this off also clears any
                      coachmark currently on screen.
     • Starting lvl — endless play may begin at level 1–10 so veterans can
                      skip the slow open. (Daily always starts at level 1 so
                      the day's scores stay comparable — game.js enforces that.)

   This module is strictly additive and read-only with respect to the game's
   resolve / lock / cascade paths. It only exposes three getters that the DRAW
   step (ghost, grid) and newGame (startLevel) read; it never touches the board,
   score, events, or level itself. Every option persists in localStorage, with
   all access wrapped in try/catch so the game still plays from a file:// page
   (or any browser that blocks storage) — it just won't remember the choices.
   ========================================================================= */
window.Settings = (function () {
  const KEY = "tetropolis.settings";
  const MIN_LEVEL = 1;
  const MAX_LEVEL = 10;
  const DEFAULTS = { ghost: true, mergeHint: true, grid: true, hints: true, startLevel: 1 };

  // Round and clamp an arbitrary value to a valid starting level (1–10).
  function clampLevel(n) {
    n = Math.round(Number(n));
    if (!Number.isFinite(n)) return DEFAULTS.startLevel;
    return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, n));
  }

  // Read persisted settings, tolerating missing / corrupt / partial / legacy
  // JSON — any field that is absent or the wrong type falls back to its default.
  function load() {
    const s = { ghost: DEFAULTS.ghost, mergeHint: DEFAULTS.mergeHint, grid: DEFAULTS.grid, hints: DEFAULTS.hints, startLevel: DEFAULTS.startLevel };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === "object") {
          if (typeof p.ghost === "boolean") s.ghost = p.ghost;
          if (typeof p.mergeHint === "boolean") s.mergeHint = p.mergeHint;
          if (typeof p.grid === "boolean") s.grid = p.grid;
          if (typeof p.hints === "boolean") s.hints = p.hints;
          if (p.startLevel != null) s.startLevel = clampLevel(p.startLevel);
        }
      }
    } catch (e) {
      /* storage unavailable (file:// or disabled) — keep defaults */
    }
    return s;
  }

  const state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable — settings just won't persist this session */
    }
  }

  /* ------------------------------ DOM ------------------------------- */
  // All optional: the module still answers its getters in a headless / test
  // context where these elements don't exist.
  const hasDoc = typeof document !== "undefined";
  const root = hasDoc ? document.getElementById("settings") : null;
  const backBtn = hasDoc ? document.getElementById("settings-back") : null;
  const ghostBtn = hasDoc ? document.getElementById("set-ghost") : null;
  const mergeBtn = hasDoc ? document.getElementById("set-mergehint") : null;
  const gridBtn = hasDoc ? document.getElementById("set-grid") : null;
  const hintsBtn = hasDoc ? document.getElementById("set-hints") : null;
  const levelVal = hasDoc ? document.getElementById("set-level-val") : null;
  const levelDec = hasDoc ? document.getElementById("set-level-dec") : null;
  const levelInc = hasDoc ? document.getElementById("set-level-inc") : null;

  function reflectToggle(btn, on) {
    if (!btn) return;
    btn.textContent = on ? "On" : "Off";
    btn.setAttribute("aria-checked", on ? "true" : "false");
    btn.classList.toggle("on", on);
  }

  // Paint every control from the current state.
  function reflect() {
    reflectToggle(ghostBtn, state.ghost);
    reflectToggle(mergeBtn, state.mergeHint);
    reflectToggle(gridBtn, state.grid);
    reflectToggle(hintsBtn, state.hints);
    if (levelVal) levelVal.textContent = String(state.startLevel);
    if (levelDec) levelDec.disabled = state.startLevel <= MIN_LEVEL;
    if (levelInc) levelInc.disabled = state.startLevel >= MAX_LEVEL;
  }

  function setGhost(on) { state.ghost = !!on; save(); reflect(); }
  function setMergeHint(on) { state.mergeHint = !!on; save(); reflect(); }
  function setGrid(on) { state.grid = !!on; save(); reflect(); }
  // Turning the new-player hints off should also clear any coachmark currently
  // on screen (e.g. the player paused their first game to open Settings).
  function setHints(on) {
    state.hints = !!on;
    save();
    reflect();
    if (!state.hints && typeof Coachmarks !== "undefined") Coachmarks.dismiss();
  }
  function setStartLevel(n) { state.startLevel = clampLevel(n); save(); reflect(); }

  /* ------------------------------ API ------------------------------- */
  function open() {
    reflect();
    if (root) {
      root.classList.remove("hidden");
      if (backBtn) backBtn.focus();
    }
  }

  function close() {
    if (root) root.classList.add("hidden");
  }

  function isOpen() {
    return !!root && !root.classList.contains("hidden");
  }

  /* ----------------------------- Wiring ----------------------------- */
  if (backBtn) backBtn.addEventListener("click", close);
  if (ghostBtn) ghostBtn.addEventListener("click", () => setGhost(!state.ghost));
  if (mergeBtn) mergeBtn.addEventListener("click", () => setMergeHint(!state.mergeHint));
  if (gridBtn) gridBtn.addEventListener("click", () => setGrid(!state.grid));
  if (hintsBtn) hintsBtn.addEventListener("click", () => setHints(!state.hints));
  if (levelDec) levelDec.addEventListener("click", () => setStartLevel(state.startLevel - 1));
  if (levelInc) levelInc.addEventListener("click", () => setStartLevel(state.startLevel + 1));
  if (hasDoc) {
    for (const openBtn of document.querySelectorAll(".open-settings")) {
      openBtn.addEventListener("click", open);
    }
  }
  reflect();

  return {
    // Live getters the game reads — never cached on the game's side, so a change
    // here takes effect on the very next frame (ghost / grid) or next run (level).
    ghost: () => state.ghost,
    mergeHint: () => state.mergeHint,
    grid: () => state.grid,
    hints: () => state.hints,
    startLevel: () => state.startLevel,
    open,
    close,
    isOpen,
  };
})();
