"use strict";

/* =========================================================================
   Atlas Drop — Haptics (touch vibration feedback).
   A short `navigator.vibrate` pulse on the big moments of play — hard drop,
   city merge, continent clear, row clear — so a phone player *feels* the game.

   Strictly additive and feature-detected: on hardware (or a browser, e.g. iOS
   Safari) without the Vibration API, every call silently no-ops and the toggle
   button stays hidden. Vibration is purely cosmetic feedback — it never reads
   or changes the board, score, level, or any rule. All access is wrapped so it
   can never break play.
   ========================================================================= */

window.Haptics = (function () {
  const STORAGE_KEY = "atlasdrop.haptics.enabled";

  // The Vibration API. Absent on desktop Safari and iOS Safari, so guard every
  // use behind this. `vibrate` also exists but no-ops on devices with no motor.
  const supported =
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  // A pattern (ms, or [on, off, on, …]) per gameplay moment. Kept short and
  // gentle — a tap for a drop, a quick double for a row, a brighter triple for a
  // continent clear — so feedback reads without buzzing through a whole run.
  const PATTERNS = {
    harddrop: 12,
    merge: 22,
    row: [0, 18, 26, 18],
    continent: [0, 26, 30, 26, 30, 30],
  };

  let enabled = readPref();   // persisted on/off; defaults ON where supported
  let btn = null;

  function readPref() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === null ? true : v === "1";   // default ON the first time
    } catch (e) {
      return true;            // file:// may block storage — still vibrate
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch (e) {
      /* storage blocked — the preference just isn't remembered */
    }
  }

  // Fire the pulse for a gameplay moment. Silent no-op when unsupported or off.
  function fire(kind) {
    if (!supported || !enabled) return;
    const p = PATTERNS[kind];
    if (p == null) return;
    try {
      navigator.vibrate(p);
    } catch (e) {
      /* never let haptics break play */
    }
  }

  /* --------------------------- Toggle button --------------------------- */
  function updateButton() {
    if (!btn) return;
    btn.textContent = enabled ? "📳" : "📴";
    // aria-pressed true == "off" so the shared .mute-btn dim style (opacity when
    // pressed) reads as the disabled state, matching the mute button's look.
    btn.setAttribute("aria-pressed", enabled ? "false" : "true");
    btn.setAttribute("aria-label", enabled ? "Turn vibration off" : "Turn vibration on");
    btn.title = enabled ? "Vibration on" : "Vibration off";
  }

  function toggle() {
    enabled = !enabled;
    persist();
    updateButton();
    // A tiny confirmation buzz when switching ON, so the player feels it worked.
    if (supported && enabled) {
      try { navigator.vibrate(15); } catch (e) { /* ignore */ }
    }
    return enabled;
  }

  function setup() {
    // The toggle is only meaningful where vibration can actually fire — a phone
    // or tablet with the Vibration API. Gate on the *primary* pointer being
    // coarse (touch) so a desktop, or a 2-in-1 / touchscreen laptop driven by a
    // mouse — where `navigator.vibrate` exists but is a dead no-op — never shows
    // a button that does nothing. Falls back to a plain touch check on the rare
    // browser without matchMedia. (fire() still works wherever supported — this
    // only decides whether to surface the on/off UI.)
    const primaryTouch =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : ("ontouchstart" in window || (navigator.maxTouchPoints || 0) > 0);
    btn = document.getElementById("vibe-btn");
    if (supported && primaryTouch) {
      document.body.classList.add("has-vibrate");
      if (btn) {
        updateButton();
        btn.addEventListener("click", toggle);
      }
    }
  }

  setup();

  return {
    fire,
    toggle,
    isEnabled: () => enabled,
    isSupported: () => supported,
  };
})();
