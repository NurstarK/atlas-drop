/* ==========================================================================
   Atlas Drop — one-time save migration.
   The game was first released as "Atlas Drop" and kept every saved record
   (high scores, Daily, Sprint, badges, settings, theme, mute) under keys with
   that old prefix. This runs before every other script: it copies each old key
   to the "atlasdrop." prefix (only if the new key is not set yet) and removes
   the old one, so returning players keep their progress. Wrapped in try/catch
   because localStorage may be blocked (file://, private mode).
   ========================================================================== */
(function migrateSaves() {
  const OLD_PREFIX = ["tetro", "polis."].join("");
  const NEW_PREFIX = "atlasdrop.";
  try {
    const oldKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(OLD_PREFIX)) oldKeys.push(k);
    }
    for (const k of oldKeys) {
      const nk = NEW_PREFIX + k.slice(OLD_PREFIX.length);
      if (localStorage.getItem(nk) === null) localStorage.setItem(nk, localStorage.getItem(k));
      localStorage.removeItem(k);
    }
  } catch (e) { /* storage blocked — nothing to migrate */ }
})();
