"use strict";

/* =========================================================================
   Tetropolis — Daily Challenge.
   A date-seeded, deterministic run: everyone who plays on the same calendar
   day faces the exact same stream of piece TYPES and COUNTRIES, so scores are
   directly comparable. The seed is just today's local date string
   (YYYY-MM-DD) — no network, no account, nothing leaves the page.

   This module owns three things: the day's pseudo-random generator, the day's
   best-score record, and the player's daily play streak (all kept under its own
   localStorage key, separate from the endless high-score table in scores.js). It
   NEVER reads or writes board or game state. game.js pulls floats from it to
   choose a piece's type and country while a daily challenge is running, and
   records the final score + bumps the streak here on a daily game over.

   City codes are NOT drawn from this stream — they are cosmetic (a code never
   affects a merge, a continent clear, or scoring) and stay on Math.random, so
   holding/swapping a piece (which re-labels its cells) can never knock the
   shared type/country stream out of sync between two players.
   ========================================================================= */

window.Daily = (function () {
  const STORAGE_KEY = "tetropolis.daily";

  // Local calendar date as YYYY-MM-DD — both the human-readable seed label and
  // the day the stored best belongs to.
  function todayKey() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  // xmur3-style string hash -> a 32-bit integer seed for the PRNG.
  function hashSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h ^ (h >>> 16)) >>> 0;
  }

  // mulberry32 — a tiny, well-distributed seeded PRNG. The same seed always
  // yields the same sequence of floats on every device and browser.
  function makePrng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let prng = makePrng(hashSeed(todayKey()));

  // Re-seed from today's date. Called whenever a daily challenge (re)starts so
  // every attempt — by anyone, any number of times — begins from the same point.
  function reset() {
    prng = makePrng(hashSeed(todayKey()));
  }

  // Next float in [0, 1) from the day's stream.
  function rand() {
    return prng();
  }

  // A YYYY-MM-DD key as an integer day count (UTC midnight / 86.4M ms). Only ever
  // used to DIFF two keys, so the timezone cancels out — it just has to be the
  // same transform for both. Returns NaN for a malformed / missing key.
  function dayNum(key) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || "");
    if (!m) return NaN;
    return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000);
  }

  function blank() { return { date: "", best: 0, streak: 0, lastPlayed: "" }; }

  // Read the stored record, tolerating missing / corrupt / legacy data. Legacy
  // records (date + best only) simply read back with streak 0 / no lastPlayed.
  function read() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return blank(); }
    if (!raw) return blank();
    let o;
    try { o = JSON.parse(raw); } catch (e) { return blank(); }
    if (!o || typeof o !== "object") return blank();
    const best = typeof o.best === "number" && isFinite(o.best) ? Math.max(0, Math.floor(o.best)) : 0;
    const streak = typeof o.streak === "number" && isFinite(o.streak) ? Math.max(0, Math.floor(o.streak)) : 0;
    return {
      date: typeof o.date === "string" ? o.date : "",
      best,
      streak,
      lastPlayed: typeof o.lastPlayed === "string" ? o.lastPlayed : "",
    };
  }

  function write(rec) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rec)); } catch (e) { /* storage may be blocked */ }
  }

  // Today's best score — 0 if nobody has set one today. A best from an earlier
  // day does NOT carry over: each calendar day starts fresh.
  function best() {
    const rec = read();
    return rec.date === todayKey() ? rec.best : 0;
  }

  // The live daily streak: consecutive calendar days on which a Daily was played.
  // It is only "alive" if the last day played was today or yesterday — a gap of
  // two or more days (or a clock moved backwards) breaks it, so this returns 0.
  function streak() {
    const rec = read();
    if (!rec.lastPlayed) return 0;
    const diff = dayNum(todayKey()) - dayNum(rec.lastPlayed);
    return diff === 0 || diff === 1 ? rec.streak : 0;
  }

  // Record a finished daily run. Updates today's best AND the play streak, then
  // returns { best, isNew, streak }: the day's best after this run, whether it
  // set a new best for today, and the streak after counting today's play.
  function record(score) {
    const s = Math.max(0, Math.floor(score || 0));
    const today = todayKey();
    const rec = read();
    const todayBest = rec.date === today ? rec.best : 0;   // best resets on a new day

    // Streak: same day as last played -> unchanged; the very next day -> +1;
    // any larger gap (or a NaN/backwards date) -> restart at 1.
    const diff = rec.lastPlayed ? dayNum(today) - dayNum(rec.lastPlayed) : Infinity;
    let newStreak;
    if (diff === 0) newStreak = Math.max(1, rec.streak);
    else if (diff === 1) newStreak = Math.max(1, rec.streak) + 1;
    else newStreak = 1;

    const newBest = Math.max(todayBest, s);
    write({ date: today, best: newBest, streak: newStreak, lastPlayed: today });
    return { best: newBest, isNew: s > todayBest, streak: newStreak };
  }

  return { todayKey, reset, rand, best, record, streak };
})();
