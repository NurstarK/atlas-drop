"use strict";

/* =========================================================================
   Tetropolis — first-play coachmarks.
   A one-time onboarding nicety: the very first time a player starts a game,
   two small dismissible bubbles point at the parts of the sidebar a new
   player is most likely to overlook —

     • the Hold slot  ("Press C / tap Hold to stash a piece"), and
     • the Next queue ("3 pieces ahead — plan your merges").

   They appear when play begins, auto-hide after the first hold or ~8 seconds,
   and are never shown again once dismissed (a flag is kept in localStorage,
   its own key). The whole thing is view-only: it reads nothing from and writes
   nothing to the board, score, piece, or any game state — it only toggles two
   DOM nodes. It can be turned off entirely in Settings (New-player hints), and
   it degrades silently where storage is blocked (file://) or the DOM is absent
   (headless tests). No network.
   ========================================================================= */
window.Coachmarks = (function () {
  const KEY = "tetropolis.coachmarks";   // "seen" flag — "1" once shown
  const HIDE_MS = 8000;                   // auto-dismiss after this long on screen

  // Have the coachmarks already been shown once? Tolerant of blocked storage.
  function seen() {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch (e) {
      return false;   // storage unavailable — treat as a first play, harmlessly
    }
  }

  function markSeen() {
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {
      /* storage unavailable (file:// or disabled) — just won't persist */
    }
  }

  const hasDoc = typeof document !== "undefined";
  const holdEl = hasDoc ? document.getElementById("coach-hold") : null;
  const nextEl = hasDoc ? document.getElementById("coach-next") : null;

  let timer = null;
  let showing = false;

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function hideEls() {
    if (holdEl) holdEl.classList.add("hidden");
    if (nextEl) nextEl.classList.add("hidden");
  }

  // Hide the coachmarks and remember they've been seen so they never return.
  // Called on the first hold, when the auto-hide timer fires, or if the player
  // turns the hint off in Settings. Idempotent and cheap: a call while nothing
  // is showing just tidies up (no timer, already hidden, nothing to persist).
  function dismiss() {
    clearTimer();
    hideEls();
    if (showing) {
      markSeen();
      showing = false;
    }
  }

  // Show the onboarding coachmarks for a first-time player — once, ever. No-op
  // if they've already been seen, if the Settings "New-player hints" toggle is
  // off, or if neither bubble exists (headless). Purely a view change.
  function maybeShow() {
    if (showing) return;
    if (typeof Settings !== "undefined" && Settings.hints && !Settings.hints()) return;
    if (seen()) return;
    if (!holdEl && !nextEl) return;
    showing = true;
    if (holdEl) holdEl.classList.remove("hidden");
    if (nextEl) nextEl.classList.remove("hidden");
    clearTimer();
    timer = setTimeout(dismiss, HIDE_MS);
  }

  return { maybeShow, dismiss, seen };
})();
