/* Ugubhela Simon — visual layer. Pixel lanes (up/down drift), bolt streaks, and the flickering 3D pixel cube. Original, generative. */
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- pixel lanes ---------- */
  var c = document.getElementById("bg");
  if (c && c.getContext) {
    var x = c.getContext("2d"), W = 0, H = 0, dpr = 1, P = [], bolt = null, nextBolt = 0, raf = 0;
    var LANE = 26;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      var lanes = Math.floor(W / LANE), count = Math.min(70, Math.max(24, Math.floor(W * H / 16000)));
      P = [];
      for (var i = 0; i < count; i++) {
        var ln = Math.floor(rnd(0, lanes));
        P.push({ x: ln * LANE + LANE / 2, y: rnd(0, H), s: rnd(3, 6.5), v: (ln % 2 ? 1 : -1) * rnd(.12, .55), t: Math.random() < .35, a: rnd(.07, .26) });
      }
    }
    function makeBolt() {
      var y = rnd(H * .15, H * .85), px = -20, py = y, pts = [[px, py]];
      while (px < W + 40) { px += rnd(24, 70); py += rnd(-38, 38); pts.push([px, py]); }
      bolt = { pts: pts, life: 1 };
    }
    function frame(ts) {
      x.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y += p.v; if (p.y < -30) p.y = H + 10; if (p.y > H + 30) p.y = -10;
        var col = p.t ? "0,212,170" : "123,47,255";
        var tail = 26 * Math.abs(p.v) * 3, dir = p.v > 0 ? -1 : 1;
        var g = x.createLinearGradient(0, p.y, 0, p.y + dir * tail);
        g.addColorStop(0, "rgba(" + col + "," + p.a * .8 + ")"); g.addColorStop(1, "rgba(" + col + ",0)");
        x.fillStyle = g; x.fillRect(p.x - p.s / 2 + 1, Math.min(p.y, p.y + dir * tail), p.s - 2, tail);
        x.fillStyle = "rgba(" + col + "," + Math.min(.5, p.a + .12) + ")"; x.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      if (!bolt && ts > nextBolt) { makeBolt(); nextBolt = ts + rnd(6500, 12000); }
      if (bolt) {
        x.beginPath(); bolt.pts.forEach(function (q, i) { i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); });
        x.strokeStyle = "rgba(0,212,170," + (bolt.life * .32) + ")"; x.lineWidth = 2; x.shadowColor = "#00d4aa"; x.shadowBlur = 14; x.stroke(); x.shadowBlur = 0;
        bolt.life -= .035; if (bolt.life <= 0) bolt = null;
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    resize(); window.addEventListener("resize", resize);
    if (reduce) { frame(0); }
    else {
      nextBolt = 3000; raf = requestAnimationFrame(frame);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
      });
    }
  }

  /* ---------- pixel cube ---------- */
  var cube = document.getElementById("cube"), orbit = document.getElementById("orbit");
  if (cube) {
    var faces = [];
    for (var f = 0; f < 6; f++) {
      var face = document.createElement("div"); face.className = "face";
      for (var k = 0; k < 9; k++) { var px = document.createElement("span"); px.className = "px"; face.appendChild(px); }
      cube.appendChild(face); faces.push(face);
    }
    var all = cube.querySelectorAll(".px");
    function flick() {
      for (var n = 0; n < 4; n++) {
        var el = all[Math.floor(Math.random() * all.length)];
        var r = Math.random();
        el.className = "px" + (r < .45 ? " p" : r < .7 ? " t" : "");
      }
    }
    for (var j = 0; j < 14; j++) flick();
    if (!reduce) setInterval(function () { if (!document.hidden) flick(); }, 420);
  }
  if (orbit) { for (var o = 0; o < 12; o++) { var d = document.createElement("i"); d.style.setProperty("--i", o); orbit.appendChild(d); } }
})();
