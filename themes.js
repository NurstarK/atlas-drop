"use strict";

/* =========================================================================
   Atlas Drop — Board themes.
   A purely-cosmetic board colour theme, chosen in Settings. The theme swaps
   only the board's BACKGROUND GRADIENT + GRID LINES (the canvas palette that
   game.js keeps in COLORS and drawGrid reads) and, via a <body> class, the
   CSS panel/accent tint. The continent hues and country colours — which do
   the actual gameplay colour work — are NEVER touched, so tile readability,
   the legend, and every rule stay exactly the same across themes.

   Strictly additive and read-only with respect to resolve / lock / cascade.
   It exposes the active theme's canvas palette (game.js copies it into COLORS
   at load and whenever the choice changes) and toggles one <body> class for
   the CSS chrome. The choice persists in localStorage, all access wrapped in
   try/catch so the game still plays from a file:// page (or where storage is
   blocked) — it just won't remember the choice.

   The control lives in the Settings panel (a segmented button group,
   #set-theme) but the theme concept — catalogue, persistence, body class —
   lives here so game.js and settings.js stay focused.
   ========================================================================= */
window.Themes = (function () {
  const KEY = "atlasdrop.theme";
  const DEFAULT_ID = "indigo";

  // Each theme carries the five canvas colours drawGrid / the previews / the
  // pause minimap read from COLORS, plus the <body> class that re-tints the
  // CSS chrome (empty string = the default :root palette, no class). The
  // continent/country colours are deliberately absent — they never change.
  const THEMES = [
    {
      id: "indigo",
      name: "Indigo",
      bodyClass: "",            // default :root palette
      boardTop: "#1a1f4a",
      boardBottom: "#0f1a3a",
      previewBg: "#161c40",
      grid: "rgba(148,163,255,0.13)",
      gridEdge: "rgba(148,163,255,0.28)",
    },
    {
      id: "midnight",
      name: "Midnight",
      bodyClass: "theme-midnight",
      boardTop: "#0c0e1c",
      boardBottom: "#05060f",
      previewBg: "#0a0c18",
      grid: "rgba(148,163,255,0.10)",
      gridEdge: "rgba(148,163,255,0.22)",
    },
    {
      id: "contrast",
      name: "Contrast",
      bodyClass: "theme-contrast",
      boardTop: "#242c62",
      boardBottom: "#151c4a",
      previewBg: "#222a5c",
      grid: "rgba(196,206,255,0.30)",
      gridEdge: "rgba(196,206,255,0.58)",
    },
  ];

  const BY_ID = {};
  for (const t of THEMES) BY_ID[t.id] = t;

  // Clamp an arbitrary id to a known theme.
  function known(id) {
    return (id && BY_ID[id]) ? id : DEFAULT_ID;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return known(JSON.parse(raw));
    } catch (e) {
      /* storage unavailable (file:// or disabled) — keep the default */
    }
    return DEFAULT_ID;
  }

  let currentId = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(currentId));
    } catch (e) {
      /* storage unavailable — the choice just won't persist this session */
    }
  }

  function theme() { return BY_ID[currentId] || BY_ID[DEFAULT_ID]; }

  // The canvas palette the draw step reads (copied into COLORS by game.js).
  function palette() {
    const t = theme();
    return {
      boardTop: t.boardTop,
      boardBottom: t.boardBottom,
      previewBg: t.previewBg,
      grid: t.grid,
      gridEdge: t.gridEdge,
    };
  }

  /* ------------------------------ DOM ------------------------------- */
  const hasDoc = typeof document !== "undefined";
  const group = hasDoc ? document.getElementById("set-theme") : null;
  const buttons = (group && group.querySelectorAll) ? group.querySelectorAll("button[data-theme]") : [];

  // Re-tint the CSS chrome: remove every theme class, add the active one.
  function applyBodyClass() {
    if (!hasDoc || !document.body) return;
    for (const t of THEMES) if (t.bodyClass) document.body.classList.remove(t.bodyClass);
    const bc = theme().bodyClass;
    if (bc) document.body.classList.add(bc);
  }

  // Highlight the active segmented button.
  function reflect() {
    for (const b of buttons) {
      const on = b.getAttribute("data-theme") === currentId;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  // Switch theme: persist, re-tint chrome, highlight the control, then let
  // game.js copy the new palette into COLORS and repaint (via the global hook,
  // present once game.js has loaded).
  function set(id) {
    currentId = known(id);
    save();
    applyBodyClass();
    reflect();
    if (typeof window.applyThemePalette === "function") window.applyThemePalette();
  }

  /* ----------------------------- Wiring ----------------------------- */
  for (const b of buttons) {
    b.addEventListener("click", () => set(b.getAttribute("data-theme")));
  }
  applyBodyClass();   // tint the chrome from first paint
  reflect();

  return {
    current: () => currentId,   // active theme id
    palette,                    // canvas colours for COLORS
    list: () => THEMES.map((t) => ({ id: t.id, name: t.name })),
    set,
    applyBodyClass,
  };
})();
