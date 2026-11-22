/* Ugubhela Simon — the brain. Pure rules, no AI, no network. */
(function (root) {
  var DAYS = { sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3, thursday: 4, thu: 4, thur: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6 };

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9\s\/]/g, " ").replace(/\s+/g, " ").trim();
  }

  function lev(a, b) {
    var m = a.length, n = b.length, i, j, d = [];
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[m][n];
  }

  function fuzzyHas(tokens, kw) {
    var max = kw.length >= 8 ? 2 : kw.length >= 5 ? 1 : 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t === kw) return true;
      if (max && Math.abs(t.length - kw.length) <= max && lev(t, kw) <= max) return true;
    }
    return false;
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  /* returns ISO date string, null (= "no date") or undefined (= not understood) */
  function parseDue(s, now) {
    now = now || new Date();
    s = norm(s);
    if (!s || /^(no|none|no date|skip|nothing|later|no due date)$/.test(s)) return null;
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var m;
    if (/\b(today|tonight)\b/.test(s)) return iso(d);
    if (/\b(tomorrow|tmrw|tomorow)\b/.test(s)) { d.setDate(d.getDate() + 1); return iso(d); }
    m = s.match(/\bin (\d{1,3}) days?\b/);
    if (m) { d.setDate(d.getDate() + parseInt(m[1], 10)); return iso(d); }
    if (/\bnext week\b/.test(s)) { d.setDate(d.getDate() + 7); return iso(d); }
    m = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (m) {
      var day = +m[1], mon = +m[2] - 1, yr = m[3] ? +m[3] : d.getFullYear();
      if (yr < 100) yr += 2000;
      var x = new Date(yr, mon, day);
      if (x.getMonth() !== mon || x.getDate() !== day) return undefined;
      if (!m[3] && x < d) x = new Date(yr + 1, mon, day);
      return iso(x);
    }
    var words = s.split(" ");
    for (var i = 0; i < words.length; i++) {
      if (Object.prototype.hasOwnProperty.call(DAYS, words[i])) {
        var diff = (DAYS[words[i]] - d.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        d.setDate(d.getDate() + diff);
        return iso(d);
      }
    }
    return undefined;
  }

  var RE_FULL = /\b(?:(?:on|by|for|due|next|this)\s+)?(today|tonight|tomorrow|tmrw|next week|in \d{1,3} days?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i;
  var RE_ABBR = /\b(?:on|by|next|this)\s+(mon|tues?|wed|thu(?:rs?)?|fri|sat|sun)\b/i;

  /* pulls a date phrase out of a task sentence */
  function extractDue(text, now) {
    var m = RE_FULL.exec(text) || RE_ABBR.exec(text);
    if (!m) return { text: text.trim(), due: undefined };
    var due = parseDue(m[0], now);
    if (due === undefined) return { text: text.trim(), due: undefined };
    var rest = (text.slice(0, m.index) + " " + text.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
    rest = rest.replace(/\b(on|by|for|due)\s*$/i, "").trim();
    return { text: rest, due: due };
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* "add task buy toner friday", "remind me to call school tomorrow", "todo: x" */
  function parseTaskCommand(text, now) {
    var t = String(text || "").trim();
    var m = t.match(/^(?:please\s+)?(?:add|create|new|make)\s+(?:a\s+|new\s+)?(?:task|todo|to-do|reminder)\s*(?:to|for|:|-)?\s*(.*)$/i) ||
            t.match(/^(?:please\s+)?remind me\s*(?:to)?\s*(.*)$/i) ||
            t.match(/^(?:todo|task)\s*[:\-]\s*(.*)$/i);
    if (!m) return null;
    var body = (m[1] || "").trim();
    if (!body) return { text: "", due: undefined };
    var ex = extractDue(body, now);
    return { text: cap(ex.text), due: ex.due };
  }

  var INTENTS = [
    { id: "greet", kw: { hi: 2, hello: 2, hey: 2, sharp: 2, aweh: 2, howzit: 2, yo: 2, "good morning": 2, "good afternoon": 2 } },
    { id: "help", kw: { help: 2, "what can you do": 3, menu: 2, options: 2, features: 2 } },
    { id: "pdf", kw: { pdf: 3, convert: 1, extract: 2, ocr: 2, scan: 1, text: 1, document: 1, txt: 2 } },
    { id: "tasks", kw: { tasks: 3, task: 2, todo: 2, "to do": 2, list: 1, reminders: 2, overdue: 2, "my tasks": 3 } },
    { id: "price", kw: { price: 3, prices: 3, cost: 3, "how much": 3, quote: 2, fee: 2, rates: 2, charge: 2, visit: 1, callout: 2 } },
    { id: "coverage", kw: { where: 1, "where do you work": 3, "do you come": 2, "areas you cover": 3, cover: 2, coverage: 3, pretoria: 2, johannesburg: 2, centurion: 2, midrand: 2, sandton: 2, gauteng: 2, area: 1, areas: 1, "come to": 2 } },
    { id: "contact", kw: { contact: 3, whatsapp: 3, phone: 2, call: 1, email: 2, number: 2, book: 2, booking: 2, human: 2 } },
    { id: "scan", kw: { scan: 2, "scan my": 3, "scan this": 3, "health check": 3, diagnose: 2, "check my": 2, "pocket scan": 3, "test my": 2, speedtest: 2, "speed test": 3 } },
    { id: "fix", kw: { fix: 2, repair: 2, problem: 2, broken: 2, "not working": 3, issue: 2, troubleshoot: 3, solve: 2, help: 0 } },
    { id: "ads", kw: { ads: 3, advert: 2, adverts: 2, popup: 2, popups: 2, "ad free": 3 } },
    { id: "who", kw: { who: 1, simon: 2, ugubhela: 3, name: 1, bot: 1, robot: 1, real: 1, ai: 1 } },
    { id: "thanks", kw: { thanks: 3, thank: 3, cheers: 2, shot: 2, ngiyabonga: 3 } },
    { id: "bye", kw: { bye: 3, goodbye: 3, ciao: 2 } }
  ];


  var STOP = {};
  "a an the my is are was be to of in on at it its i me we you your and or for with this that not no do does did can cant dont wont isnt im ive just very so but if then when what why how please need want have has had get got keep keeps from out up".split(" ").forEach(function (w) { STOP[w] = 1; });

  function qtokens(text) {
    var n = norm(String(text || "").replace(/['’`]/g, ""));
    return { n: n, t: n ? n.split(" ") : [] };
  }

  /* ranks fixes for a plain-English problem description. returns [{ fix, score }] best first */
  function findFixes(text, list, limit) {
    var q = qtokens(text), out = [];
    var toks = q.t.filter(function (w) { return w.length > 1 && !STOP[w]; });
    if (!toks.length) return out;
    list.forEach(function (f) {
      var words = (f.k + " " + f.t).toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
      var set = {}; words.forEach(function (w) { set[w] = 1; });
      var titleWords = {}; norm(f.t.replace(/['’`]/g, "")).split(" ").forEach(function (w) { titleWords[w] = 1; });
      var score = 0, hits = 0;
      toks.forEach(function (w) {
        if (set[w]) { score += 2; hits++; if (titleWords[w]) score += 0.75; return; }
        if (w.length >= 5) {
          for (var i = 0; i < words.length; i++) {
            var kw = words[i];
            if (kw.length >= 5 && Math.abs(kw.length - w.length) <= 1 && lev(w, kw) <= 1) { score += 1.5; hits++; break; }
          }
        }
      });
      /* two-word phrases from the query that sit inside the title or search words */
      for (var j = 0; j + 1 < q.t.length; j++) {
        var ph = q.t[j] + " " + q.t[j + 1];
        if (!STOP[q.t[j]] && !STOP[q.t[j + 1]] && (f.k.indexOf(ph) > -1 || f.t.toLowerCase().indexOf(ph) > -1)) score += 1.5;
      }
      if (hits) out.push({ fix: f, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, limit || 3);
  }

  /* returns { id, score } or { id: null } when Simon honestly does not know */
  function detectIntent(text) {
    var n = norm(text);
    if (!n) return { id: null, score: 0 };
    var tokens = n.split(" ");
    var best = null, bestScore = 0;
    INTENTS.forEach(function (it) {
      var score = 0;
      Object.keys(it.kw).forEach(function (k) {
        if (k.indexOf(" ") > -1) { if (n.indexOf(k) > -1) score += it.kw[k]; }
        else if (fuzzyHas(tokens, k)) score += it.kw[k];
      });
      if (score > bestScore) { bestScore = score; best = it.id; }
    });
    return bestScore >= 2 ? { id: best, score: bestScore } : { id: null, score: bestScore };
  }

  var api = { findFixes: findFixes, norm: norm, lev: lev, iso: iso, parseDue: parseDue, extractDue: extractDue, parseTaskCommand: parseTaskCommand, detectIntent: detectIntent };
  root.SimonBrain = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);
