/* Ugubhela Simon — POCKET SCAN. Real measurements only. If the browser can't measure something, it says so. */
(function (root) {
  function now() { return performance.now(); }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function bust(path) { return path + (path.indexOf("?") > -1 ? "&" : "?") + "nocache=" + Date.now() + Math.floor(Math.random() * 1e6); }
  function timeout(ms, ctrl) { return setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, ms); }

  function fmtSkew(sec) {
    var a = Math.abs(sec), d = sec > 0 ? "fast" : "slow";
    if (a < 90) return Math.round(a) + " s " + d;
    if (a < 5400) return Math.round(a / 60) + " min " + d;
    if (a < 172800) return (a / 3600).toFixed(1) + " h " + d;
    return Math.round(a / 86400) + " days " + d;
  }

  function deviceInfo() {
    var ua = navigator.userAgent || "", uad = navigator.userAgentData;
    var os = uad && uad.platform ? uad.platform : /Android/i.test(ua) ? "Android" : /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Unknown OS";
    var br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
    return { os: os, browser: br, mobile: /Mobi|Android|iPhone|iPad/i.test(ua) || (uad && uad.mobile) || false,
      screen: Math.round(screen.width) + "x" + Math.round(screen.height) + " @" + (window.devicePixelRatio || 1) + "x" };
  }

  /* each check returns Promise<{ id, label, value, status, note, fix }>   status: ok | warn | bad | info | na */
  var checks = {};

  checks.network = function (ctx) {
    return new Promise(function (resolve) {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      var offline = navigator.onLine === false;
      if (offline) { ctx.offline = true; return resolve({ id: "network", label: "Connection", value: "Offline", status: "bad", note: "This device says it has no network.", fix: ["net-down"] }); }
      if (!c) return resolve({ id: "network", label: "Connection", value: "Online", status: "info", note: "This browser doesn't share the connection type. Latency below is measured for real." });
      var bits = [];
      if (c.effectiveType) bits.push(String(c.effectiveType).toUpperCase());
      if (c.downlink) bits.push("~" + c.downlink + " Mbps (browser estimate)");
      var st = "ok", note = "";
      if (c.saveData) { st = "warn"; note = "Data saver is on. Pages may load slimmed down."; }
      if (c.effectiveType === "slow-2g" || c.effectiveType === "2g") { st = "bad"; note = "Very slow link."; }
      else if (c.effectiveType === "3g" && st === "ok") { st = "warn"; note = "3G-class speed. Heavy pages will crawl."; }
      resolve({ id: "network", label: "Connection", value: bits.join(" · ") || "Online", status: st, note: note, fix: st === "ok" ? undefined : ["net-slow"] });
    });
  };

  checks.latency = function (ctx) {
    return new Promise(function (resolve) {
      if (ctx.offline) return resolve({ id: "latency", label: "Response time", value: "n/a", status: "na", note: "Skipped: offline." });
      if (location.protocol === "file:") return resolve({ id: "latency", label: "Response time", value: "n/a", status: "na", note: "Open the hosted or installed app to test the network." });
      var times = [], i = 0, hdr = null, fails = 0;
      (function next() {
        if (i >= 4) return done();
        var ctrl = new AbortController(), tm = timeout(6000, ctrl), t0 = now(), n = i++;
        fetch(bust("manifest.webmanifest"), { cache: "no-store", signal: ctrl.signal }).then(function (r) {
          clearTimeout(tm);
          var dt = now() - t0;
          if (n > 0 || times.length === 0) times.push(dt);
          if (!hdr && r.headers.get("date")) hdr = { d: r.headers.get("date"), at: Date.now(), rtt: dt };
          return r.arrayBuffer();
        }).then(next, function () { clearTimeout(tm); fails++; next(); });
      })();
      function done() {
        ctx.hdr = hdr;
        if (!times.length) { ctx.offline = true; return resolve({ id: "latency", label: "Response time", value: "No answer", status: "bad", note: "The network didn't answer in time. Wi-Fi may be connected with no internet.", fix: ["net-down"] }); }
        var ms = Math.round(median(times)); ctx.latency = ms;
        var st = ms < 150 ? "ok" : ms < 400 ? "warn" : "bad";
        resolve({ id: "latency", label: "Response time", value: ms + " ms", status: st,
          note: (fails ? fails + " of 4 tests failed. " : "") + (st === "ok" ? "Good for calls and browsing." : st === "warn" ? "Noticeably slow. Try closer to the router." : "Very slow response."),
          fix: st === "ok" && !fails ? undefined : ["net-slow", "net-down"] });
      }
    });
  };

  checks.clock = function (ctx) {
    return new Promise(function (resolve) {
      var h = ctx.hdr;
      if (!h) return resolve({ id: "clock", label: "Date & time", value: "n/a", status: "na", note: "Needs an online test to compare your clock with a server." });
      var server = new Date(h.d).getTime();
      if (!isFinite(server)) return resolve({ id: "clock", label: "Date & time", value: "n/a", status: "na", note: "Server didn't give a readable time." });
      var skew = (h.at - h.rtt / 2 - server) / 1000;
      var a = Math.abs(skew), st = a < 45 ? "ok" : a < 600 ? "warn" : "bad";
      var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
      resolve({ id: "clock", label: "Date & time", value: st === "ok" ? "Correct" : fmtSkew(skew), status: st,
        note: st === "ok" ? "Checked against a server" + (tz ? ". Time zone: " + tz : "") + "." : st === "warn" ? "Off by enough to break 2-step codes. Turn on automatic time." : "Far enough off to cause 'not private' errors and sign-in failures.",
        fix: st === "ok" ? undefined : ["net-cert"] });
    });
  };

  checks.speed = function (ctx) {
    return new Promise(function (resolve) {
      if (!ctx.speed) return resolve(null);
      if (ctx.offline) return resolve({ id: "speed", label: "Download speed", value: "n/a", status: "na", note: "Skipped: offline." });
      var url = bust("pdf.worker.min.js"), ctrl = new AbortController(), tm = timeout(9000, ctrl), t0 = now(), bytes = 0;
      fetch(url, { cache: "no-store", signal: ctrl.signal }).then(function (r) {
        var rd = r.body && r.body.getReader ? r.body.getReader() : null;
        if (!rd) return r.arrayBuffer().then(function (b) { bytes = b.byteLength; });
        return (function pump() { return rd.read().then(function (x) { if (x.done) return; bytes += x.value.length; return pump(); }); })();
      }).then(function () {
        clearTimeout(tm);
        var secs = (now() - t0) / 1000, wire = bytes;
        try {
          var e = performance.getEntriesByType("resource").filter(function (r) { return r.name === new URL(url, location.href).href; }).pop();
          if (e && (e.encodedBodySize || e.transferSize)) wire = e.encodedBodySize || e.transferSize;
        } catch (er) {}
        var mbps = wire * 8 / secs / 1e6;
        var st = mbps >= 8 ? "ok" : mbps >= 2 ? "warn" : "bad";
        resolve({ id: "speed", label: "Download speed", value: mbps.toFixed(1) + " Mbps", status: st,
          note: "Small-file estimate (about " + (wire / 1048576).toFixed(1) + " MB). Real speed on big files can be higher.",
          fix: st === "ok" ? undefined : ["net-slow"] });
      }, function () { clearTimeout(tm); resolve({ id: "speed", label: "Download speed", value: "Failed", status: "bad", note: "The test file didn't finish downloading.", fix: ["net-slow"] }); });
    });
  };

  checks.smooth = function () {
    return new Promise(function (resolve) {
      if (document.hidden) return resolve({ id: "smooth", label: "Screen smoothness", value: "n/a", status: "na", note: "Keep this app on screen while it measures." });
      var frames = 0, long = 0, last = 0, t0 = 0, stop = 1300;
      function f(t) {
        if (!t0) { t0 = t; last = t; }
        else { frames++; if (t - last > 50) long++; last = t; }
        if (t - t0 < stop) requestAnimationFrame(f);
        else {
          var fps = Math.round(frames / ((last - t0) / 1000));
          var st = fps >= 50 ? "ok" : fps >= 30 ? "warn" : "bad";
          resolve({ id: "smooth", label: "Screen smoothness", value: fps + " fps", status: st,
            note: st === "ok" ? "Smooth." + (long ? " " + long + " small stutter" + (long > 1 ? "s" : "") + "." : "") : "Choppy while the scan ran. Close other apps and test again.",
            fix: st === "ok" ? undefined : [(deviceInfo().mobile ? "ph-slow" : "pc-slow")] });
        }
      }
      requestAnimationFrame(f);
    });
  };

  checks.power = function () {
    return new Promise(function (resolve) {
      if (!navigator.getBattery) return resolve({ id: "power", label: "Battery", value: "n/a", status: "na", note: "Battery details aren't shared by this browser (or this device has none)." });
      navigator.getBattery().then(function (b) {
        var pct = Math.round(b.level * 100), st = "ok", note = b.charging ? "Charging." : "On battery.";
        if (!b.charging && pct < 20) { st = "warn"; note = "Low and not charging."; }
        if (!b.charging && pct < 8) st = "bad";
        resolve({ id: "power", label: "Battery", value: pct + "%" + (b.charging ? " · charging" : ""), status: st, note: note, fix: st === "ok" ? undefined : [(deviceInfo().mobile ? "ph-battery" : "pc-battery")] });
      }, function () { resolve({ id: "power", label: "Battery", value: "n/a", status: "na", note: "Couldn't read the battery." }); });
    });
  };

  checks.hardware = function () {
    return new Promise(function (resolve) {
      var cores = navigator.hardwareConcurrency, mem = navigator.deviceMemory, bits = [], st = "ok", note = "";
      if (mem) bits.push("≈" + mem + " GB RAM"); if (cores) bits.push(cores + " cores");
      if (!bits.length) return resolve({ id: "hardware", label: "Memory & processor", value: "n/a", status: "na", note: "This browser hides hardware details." });
      if ((mem && mem <= 2) || (cores && cores <= 2)) { st = "warn"; note = "Light hardware. Heavy apps and many tabs will lag."; }
      else note = mem ? "Browsers round RAM down and cap it at 8 GB." : "";
      resolve({ id: "hardware", label: "Memory & processor", value: bits.join(" · "), status: st, note: note, fix: st === "ok" ? undefined : [(deviceInfo().mobile ? "ph-slow" : "pc-slow")] });
    });
  };

  checks.disk = function () {
    return new Promise(function (resolve) {
      resolve({ id: "disk", label: "Free disk space", value: "Can't see it", status: "na", note: "Websites aren't allowed to read free space. Check it by hand: Settings, Storage.", fix: [deviceInfo().mobile ? "ph-storage" : "fs-full"] });
    });
  };

  checks.away = function () {
    return new Promise(function (resolve) {
      var sw = "serviceWorker" in navigator && navigator.serviceWorker.controller;
      if (!("caches" in window)) return resolve({ id: "away", label: "Away-ready", value: "No", status: "warn", note: "This browser can't store Simon offline." });
      caches.keys().then(function (k) {
        var has = k.some(function (x) { return x.indexOf("simon-") === 0; });
        resolve({ id: "away", label: "Away-ready", value: has && sw ? "Works offline" : "Not yet", status: has && sw ? "ok" : "info",
          note: has && sw ? "Fixes, scan and tasks open with no signal." : "Open Simon once with data, then it will work offline." });
      }, function () { resolve({ id: "away", label: "Away-ready", value: "Unknown", status: "info", note: "" }); });
    });
  };

  checks.device = function () {
    return new Promise(function (resolve) {
      var d = deviceInfo();
      resolve({ id: "device", label: "This device", value: d.os + " · " + d.browser, status: "info", note: "Screen " + d.screen + (("ontouchstart" in window) ? ", touch" : "") + "." });
    });
  };

  var ORDER = ["device", "network", "latency", "clock", "speed", "smooth", "hardware", "power", "disk", "away"];

  function score(rows) {
    var sum = 0, n = 0;
    rows.forEach(function (r) { if (r.status === "ok") { sum += 100; n++; } else if (r.status === "warn") { sum += 55; n++; } else if (r.status === "bad") { sum += 12; n++; } });
    return n ? Math.round(sum / n) : null;
  }

  /* run({ speed:boolean }, onRow(row, i, total)) -> Promise<{ ts, score, rows }> */
  function run(opts, onRow) {
    opts = opts || {};
    var ctx = { speed: !!opts.speed, offline: false }, rows = [], idx = 0;
    var ids = ORDER.filter(function (id) { return id !== "speed" || ctx.speed; });
    return new Promise(function (resolve) {
      (function next() {
        if (idx >= ids.length) { var res = { ts: Date.now(), score: score(rows), rows: rows }; return resolve(res); }
        var id = ids[idx++];
        checks[id](ctx).then(function (row) {
          if (row) { rows.push(row); if (onRow) onRow(row, idx, ids.length); }
          setTimeout(next, 90);
        });
      })();
    });
  }

  function report(res) {
    var d = new Date(res.ts), p = function (n) { return n < 10 ? "0" + n : n; };
    var lines = ["POCKET SCAN · " + d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()),
      "Health score: " + (res.score == null ? "n/a" : res.score + "/100")];
    res.rows.forEach(function (r) { lines.push((r.status === "ok" ? "[OK]   " : r.status === "warn" ? "[WARN] " : r.status === "bad" ? "[BAD]  " : "[info] ") + r.label + ": " + r.value + (r.note && r.status !== "ok" && r.status !== "info" ? " (" + r.note + ")" : "")); });
    return lines.join("\n");
  }

  root.SimonScan = { run: run, report: report, deviceInfo: deviceInfo, score: score };
  if (typeof module !== "undefined" && module.exports) module.exports = root.SimonScan;
})(typeof window !== "undefined" ? window : this);
