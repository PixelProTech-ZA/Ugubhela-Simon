/* Ugubhela Simon — service worker. Offline-first, plus Android "Share to Simon" for PDFs and text. */
var VERSION = "simon-v1";
var ASSETS = [
  "./", "index.html", "app.css", "app.js", "bg.js", "fixes.js", "scan.js", "simon-brain.js", "manifest.webmanifest",
  "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png",
  "syne-600.woff2", "syne-800.woff2", "spacemono-400.woff2", "spacemono-700.woff2",
  "pdf.min.js", "pdf.worker.min.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ASSETS); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf("simon-v") === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("message", function (e) { if (e.data === "skip") self.skipWaiting(); });

function handleShare(req) {
  return req.formData().then(function (fd) {
    return caches.open("simon-share").then(function (cache) {
      return cache.keys().then(function (keys) { return Promise.all(keys.map(function (k) { return cache.delete(k); })); }).then(function () {
        var files = fd.getAll("pdf").filter(function (f) { return f && typeof f !== "string" && f.size; });
        var puts = files.map(function (f, i) {
          return cache.put("shared-file-" + i, new Response(f, { headers: { "content-type": f.type || "application/pdf", "x-name": f.name || "shared.pdf" } }));
        });
        var text = [fd.get("title"), fd.get("text"), fd.get("url")].filter(function (x) { return x && typeof x === "string"; }).join(" ").trim();
        if (!files.length && text) puts.push(cache.put("shared-text", new Response(text, { headers: { "content-type": "text/plain" } })));
        return Promise.all(puts);
      });
    });
  }).catch(function () {}).then(function () { return Response.redirect("./index.html?shared=1", 303); });
}

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method === "POST" && /\/share-target$/.test(url.pathname)) { e.respondWith(handleShare(req)); return; }
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.search.indexOf("nocache=") > -1) return;            /* real network tests must hit the network */

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok && res.type === "basic") { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return null; });
      if (hit) { e.waitUntil(net); return hit; }               /* stale-while-revalidate */
      return net.then(function (res) {
        if (res) return res;
        return req.mode === "navigate" ? caches.match("index.html") : Response.error();
      });
    })
  );
});
