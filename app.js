/* Ugubhela Simon — the app. Runs entirely on this device. No AI service, no accounts, no ads, no upload. */
(function () {
  "use strict";
  var B = window.SimonBrain, FX = window.SimonFixes, SC = window.SimonScan;
  var WA = "27651971461", CALLOUT = 350, MAX_PDF_MB = 50;
  var ACCENT = { pc: "#7b2fff", net: "#00d4aa", phone: "#4aa3ff", dev: "#efaa32", files: "#c06bff", sec: "#ff6b6b" };
  var LEVEL = { 1: "Easy", 2: "Careful", 3: "Advanced" };

  function $(id) { return document.getElementById(id); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function persist() { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }

  /* ---------- icons (own stroke set) ---------- */
  var ICON = {
    pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    wifi: '<path d="M3 9a13 13 0 0 1 18 0M6 12.5a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19.2" r=".8"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/>',
    all: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    trash: '<path d="M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13"/>',
    chev: '<path d="m9 6 6 6-6 6"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[name] || "") + "</svg>"; }
  function setIcon(node, name) { node.innerHTML = icon(name); }

  /* generative mosaic thumbnail, unique per fix */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function thumb(fix) {
    var h = hash(fix.id), box = el("div", "thumb"), col = ACCENT[fix.cat] || "#7b2fff", svg = "";
    var cells = 0, bobAt = h % 11;
    for (var r = 0; r < 5; r++) for (var c = 0; c < 3; c++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      if ((h & 3) === 0) continue;
      var op = [0, .4, .7, 1][h & 3], y = 2 + r * 7.2;
      var cls = (cells++ % 11 === bobAt) ? ' class="bobpx"' : "";
      svg += '<rect' + cls + ' x="' + (2 + c * 7.2) + '" y="' + y + '" width="5.6" height="5.6" rx="1.4" opacity="' + op + '"/>';
      if (c < 2) svg += '<rect x="' + (2 + (4 - c) * 7.2) + '" y="' + y + '" width="5.6" height="5.6" rx="1.4" opacity="' + op + '"/>';
    }
    box.style.color = col;
    box.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true">' + svg + "</svg>";
    return box;
  }

  /* ---------- ripple ---------- */
  document.addEventListener("pointerdown", function (e) {
    var t = e.target.closest && e.target.closest(".rip");
    if (!t) return;
    var r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = el("span", "ripple");
    s.style.width = s.style.height = d + "px";
    s.style.left = (e.clientX - r.left - d / 2) + "px"; s.style.top = (e.clientY - r.top - d / 2) + "px";
    t.appendChild(s); setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 650);
  }, { passive: true });

  /* ---------- snackbar ---------- */
  var snackT = null;
  function snack(text, label, fn, ms) {
    var s = $("snack"), b = $("snackBtn");
    $("snackTxt").textContent = text;
    if (label) { b.hidden = false; b.textContent = label; b.onclick = function () { s.classList.remove("on"); fn && fn(); }; } else { b.hidden = true; b.onclick = null; }
    s.classList.add("on"); clearTimeout(snackT);
    snackT = setTimeout(function () { s.classList.remove("on"); }, ms || (label ? 6000 : 3200));
  }

  /* ---------- sheets (Android back button closes the top one) ---------- */
  var stack = [], scrim = $("scrim");
  function pushSheet(node, onClose) {
    stack.push({ node: node, onClose: onClose });
    node.classList.add("open"); scrim.classList.add("on");
    try { history.pushState({ sheet: stack.length }, ""); } catch (e) {}
    setTimeout(function () { try { node.focus({ preventScroll: true }); } catch (e) {} }, 60);
  }
  function popSheet() {
    var t = stack.pop(); if (!t) return;
    t.node.classList.remove("open"); if (!stack.length) scrim.classList.remove("on");
    if (t.onClose) t.onClose();
  }
  function closeTop() { if (!stack.length) return; var hs = false; try { hs = history.state && history.state.sheet; } catch (e) {} if (hs) history.back(); else popSheet(); }
  window.addEventListener("popstate", function () { if (stack.length) popSheet(); });
  scrim.addEventListener("click", closeTop);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeTop(); });

  /* ---------- state ---------- */
  var tasks = store.get("simon_tasks", []);
  var unknown = store.get("simon_unknown", []);
  var cases = store.get("simon_cases", []);
  var stats = store.get("simon_stats", { fixed: 0, handed: 0 });
  var taskView = "all", fixCat = "all", wait = null, draft = "";
  var log = $("log"), quick = $("quick"), msgInput = $("msg");

  function todayISO() { return B.iso(new Date()); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return B.iso(d); }
  function fmtDue(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" }); }
  function waLink(text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }
  function openWA(text) { window.open(waLink(text), "_blank", "noopener"); }
  function ago(ts) {
    var s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 90) return "just now"; if (s < 5400) return Math.round(s / 60) + " min ago";
    if (s < 129600) return Math.round(s / 3600) + " h ago"; return Math.round(s / 86400) + " days ago";
  }
  function copyText(t, okMsg) {
    function fallback() {
      var ta = el("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} ta.remove(); snack(ok ? okMsg : "Couldn't copy automatically.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { snack(okMsg); }, fallback); else fallback();
  }
  function shareText(title, text) {
    if (navigator.share) { navigator.share({ title: title, text: text }).catch(function () {}); }
    else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
  }

  /* ---------- router ---------- */
  var VIEWS = ["chat", "fix", "scan", "tasks", "tools"];
  function go(v) {
    if (VIEWS.indexOf(v) < 0) v = "chat";
    VIEWS.forEach(function (n) { $("v-" + n).classList.toggle("on", n === v); });
    qa(".nav-i").forEach(function (b) { var on = b.getAttribute("data-go") === v; b.classList.toggle("on", on); if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    try { history.replaceState(history.state, "", "#" + v); } catch (e) {}
    if (v === "fix") renderFixes(); if (v === "tasks") renderTasks(); if (v === "tools") renderUnknown();
    if (v === "chat") scrollDown();
  }
  qa(".nav-i").forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-go")); }); });

  /* ================= CHAT ================= */
  var chain = Promise.resolve();
  function later(fn, ms) { chain = chain.then(function () { return new Promise(function (res) { setTimeout(function () { try { fn(); } catch (e) {} res(); }, ms || 0); }); }); }
  function scrollDown() { requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; }); }
  function bubble(role, text) {
    var d = el("div", "msg " + role);
    if (role === "bot") d.appendChild(el("span", "who", "SIMON"));
    d.appendChild(document.createTextNode(text));
    log.appendChild(d); scrollDown(); return d;
  }
  function setQuick(list) {
    quick.textContent = "";
    list.forEach(function (b) { var e = el("button", "rip", b[0]); e.type = "button"; e.onclick = function () { b[1](); }; quick.appendChild(e); });
    quick.scrollLeft = 0;
  }
  function say(text, buttons, after) {
    var t;
    later(function () { t = el("div", "msg bot typing"); t.setAttribute("aria-hidden", "true"); t.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(t); scrollDown(); setQuick([]); });
    later(function () { if (t && t.parentNode) t.remove(); bubble("bot", text); setQuick(buttons || defaultButtons()); if (after) after(); }, 380);
  }
  function ask(label, text) { return [label, function () { handle(text || label); }]; }
  function defaultButtons() {
    return [["Fix a problem", function () { handle("Fix a problem"); }], ask("Scan my device"), ask("PDF to text"), ask("My tasks"), ask("Prices"), ask("Where do you work?"),
      ["Talk to a human", function () { openWA("Hi PixelProTech, I'd like to talk to someone."); }]];
  }

  function startFix(id) { go("fix"); openFix(id); }
  function offerFixes(fm) {
    var top = fm[0].fix, amb = fm[1] && fm[1].score >= fm[0].score * .85;
    var btns = [];
    if (amb) {
      fm.slice(0, 3).forEach(function (m) { btns.push([m.fix.t, function () { startFix(m.fix.id); }]); });
      say("That could be a few things. Which one sounds closest?", btns.concat([["None of these", function () { handle("none of these"); }]]));
      return;
    }
    btns.push(["Start: " + top.t, function () { startFix(top.id); }]);
    fm.slice(1, 3).forEach(function (m) { btns.push([m.fix.t, function () { startFix(m.fix.id); }]); });
    say("That sounds like \"" + top.t + "\". About " + top.m + " min, " + LEVEL[top.l].toLowerCase() + ". I'll walk you through it one step at a time, and it works with no signal.", btns);
  }

  var ANSWERS = {
    greet: function () { say("Sharp, bro! Ugubhela Simon here, your IT FAST BRO. Tell me what's broken, or I can scan this device, turn a PDF into text, or keep your tasks. What do you need?"); },
    help: function () { say("Here's what I can really do:\n1. Walk you through " + FX.list.length + " fixes for PC, Wi-Fi and phone (works offline)\n2. Scan this device for real\n3. Turn a PDF into text (no ads, no upload)\n4. Keep your tasks and due dates\n5. Tell you prices, areas and how to book\n\nAnything else, I'll tell you \"ja-nee, I don't know that yet\"."); },
    fix: function () { say("Tell me what's wrong in plain words, like \"wifi connected but no internet\" or \"printer offline\". Or browse the whole library.", [["Open Fix lane", function () { go("fix"); }], ask("My PC is slow"), ask("No internet"), ask("Phone storage full")]); },
    scan: function () { say("Pocket Scan checks the device you're holding: network, clock, smoothness, battery and hardware. Real measurements only, and I'll tell you what a browser can't see.", [["Open Pocket Scan", function () { go("scan"); }], ask("My PC is slow")]); },
    pdf: function () { say("Lekker. Drop your PDF below and I'll pull the text out. It stays on your device.", [ask("My tasks"), ask("Prices")], showPdfCard); },
    tasks: function () { say(taskSummary(), [ask("Add a task"), ["Show overdue", function () { setTaskView("overdue"); go("tasks"); }], ask("PDF to text")]); },
    price: function () { say("On-site diagnostic: R350 per visit (home users). Business call-out: R650 per visit. Schools get a custom quote. Parts are quoted separately, and nothing is done without your approval.", [["Book on WhatsApp", function () { openWA("Hi PixelProTech, I'd like to book an on-site visit."); }], ask("Where do you work?")]); },
    coverage: function () { say("We come to you in Gauteng.\nJohannesburg: Sandton, Randburg, Roodepoort, Midrand, Fourways, CBD.\nPretoria/Centurion: Centurion, Hatfield, Menlyn, Brooklyn, Montana, CBD.\nOther Gauteng areas depend on the job and availability, just ask.", [ask("Prices"), ["Ask on WhatsApp", function () { openWA("Hi PixelProTech, do you cover my area?"); }]]); },
    contact: function () { say("WhatsApp or call: 065 197 1461\nEmail: pixelprotechsolutions@proton.me", [["Open WhatsApp", function () { openWA("Hi PixelProTech!"); }], ask("Prices")]); },
    ads: function () { say("No ads here, bro. No popups, no sign-up, no upload. Ja, really."); },
    who: function () { say("I'm Ugubhela Simon, a rule-based helper. Not an AI. I only know what's built into me, and when I don't know, I say so. Never guess, always check."); },
    thanks: function () { say("Shot, bro. Anytime."); },
    bye: function () { say("Sharp. Catch you later."); }
  };

  function startTaskFlow() { wait = "taskText"; say("What's the task? (say \"cancel\" to stop)", [["Cancel", function () { handle("cancel"); }]]); }
  function askDue() {
    wait = "taskDue";
    say("When is it due? Say today, tomorrow, a weekday like Friday, a date like 25/12, or \"no date\".",
      [["Today", function () { handle("today"); }], ["Tomorrow", function () { handle("tomorrow"); }], ["No date", function () { handle("no date"); }], ["Cancel", function () { handle("cancel"); }]]);
  }
  function confirmTask(text, due) {
    addTask(text, due);
    say("Done, bro. Saved: \"" + text + "\"" + (due ? ", due " + fmtDue(due) : ", no due date") + ".", [ask("My tasks"), ask("Add a task"), ask("Fix a problem")]);
  }

  function handle(raw) {
    var text = String(raw || "").trim();
    if (!text) return;
    bubble("me", text); msgInput.value = "";
    if (!$("v-chat").classList.contains("on")) go("chat");

    if (wait && /^(cancel|stop|never ?mind|forget it)$/i.test(text)) { wait = null; draft = ""; say("No stress, cancelled."); return; }
    if (wait === "taskText") {
      var pc = B.parseTaskCommand("add task " + text), t = pc && pc.text ? pc.text : text;
      draft = t.charAt(0).toUpperCase() + t.slice(1);
      if (pc && pc.due !== undefined && pc.text) { wait = null; confirmTask(draft, pc.due); return; }
      askDue(); return;
    }
    if (wait === "taskDue") {
      var due = B.parseDue(text);
      if (due === undefined) { say("I didn't catch that date. Try \"tomorrow\", \"Friday\", \"25/12\" or \"no date\".", [["Tomorrow", function () { handle("tomorrow"); }], ["No date", function () { handle("no date"); }], ["Cancel", function () { handle("cancel"); }]]); return; }
      wait = null; var d = draft; draft = ""; confirmTask(d, due); return;
    }
    var cmd = B.parseTaskCommand(text);
    if (cmd) {
      if (!cmd.text) { startTaskFlow(); return; }
      if (cmd.due !== undefined) { confirmTask(cmd.text, cmd.due); return; }
      draft = cmd.text; askDue(); return;
    }
    if (/^add a task$/i.test(text)) { startTaskFlow(); return; }
    if (/^pdf to text$/i.test(text)) { ANSWERS.pdf(); return; }
    if (/^none of these$/i.test(text)) { say("No stress. Describe it a bit more, or hand it to the team with what you've tried.", [["Describe it to PixelProTech", function () { askTeam(""); }], ["Browse the library", function () { go("fix"); }]]); return; }

    var it = B.detectIntent(text), fm = B.findFixes(text, FX.list, 3);
    if (it.id && it.id !== "fix" && it.score >= 3) { ANSWERS[it.id](); return; }
    if (fm.length && fm[0].score >= 2.5) { offerFixes(fm); return; }
    if (it.id) { ANSWERS[it.id](); return; }

    rememberUnknown(text);
    say("Ja-nee, I don't know that one yet. I've kept your question on this device so I can be taught. Want to send it to the team?",
      [["Send it on WhatsApp", function () { openWA("Question for Simon: " + text); }], ask("What can you do?"), ask("Fix a problem")]);
  }
  $("form").addEventListener("submit", function (e) { e.preventDefault(); handle(msgInput.value); });
  function askTeam(note) { var c = newCase(null, "Problem described in chat"); c.note = note || ""; c.status = "handover"; saveCases(); openWA(buildHandover(c, null)); }

  /* ================= TASKS ================= */
  function saveTasks() { store.set("simon_tasks", tasks); updateBadge(); }
  function addTask(text, due, fixId) {
    tasks.unshift({ id: Date.now() + "" + Math.floor(Math.random() * 1000), text: text, due: due || null, done: false, fix: fixId || undefined });
    saveTasks(); renderTasks(); persist();
  }
  function counts() {
    var t = todayISO(), open = 0, over = 0, today = 0;
    tasks.forEach(function (k) { if (k.done) return; open++; if (k.due && k.due < t) over++; if (k.due === t) today++; });
    return { open: open, over: over, today: today };
  }
  function updateBadge() {
    var c = counts(), n = c.over + c.today, b = $("taskBadge");
    b.hidden = !n; b.textContent = n > 9 ? "9+" : n;
  }
  function setTaskView(v) { taskView = v; qa("#taskTabs .chip").forEach(function (t) { t.classList.toggle("on", t.getAttribute("data-view") === v); }); renderTasks(); }
  function renderTasks() {
    var list = $("taskList"), t = todayISO(); list.textContent = "";
    var shown = tasks.filter(function (k) {
      if (taskView === "today") return !k.done && k.due === t;
      if (taskView === "overdue") return !k.done && k.due && k.due < t;
      return true;
    }).sort(function (a, b) {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.due && b.due && a.due !== b.due) return a.due < b.due ? -1 : 1;
      if (!!a.due !== !!b.due) return a.due ? -1 : 1;
      return 0;
    });
    var c = counts();
    $("taskCount").textContent = c.open + " open" + (c.over ? " · " + c.over + " overdue" : "");
    if (!shown.length) {
      var e = el("li", "empty", taskView === "all" ? "No tasks yet. Tap New task, or tell Simon." : "Nothing here. Lekker.");
      list.appendChild(e);
    }
    shown.forEach(function (k) {
      var li = el("li", "task" + (k.done ? " done" : ""));
      var lab = el("label"), cb = el("input"); cb.type = "checkbox"; cb.checked = k.done; cb.setAttribute("aria-label", "Done: " + k.text);
      cb.onchange = function () { k.done = cb.checked; saveTasks(); renderTasks(); };
      lab.appendChild(cb);
      var body = el("div", "body"); body.appendChild(el("span", "t", k.text));
      if (k.due) { body.appendChild(el("span", "due" + (!k.done && k.due < t ? " over" : !k.done && k.due === t ? " today" : ""), fmtDue(k.due))); }
      if (k.fix && FX.byId[k.fix]) { var of = el("button", "fxchip rip", "Open fix"); of.type = "button"; of.style.marginLeft = "8px"; of.onclick = function () { startFix(k.fix); }; body.appendChild(of); }
      var ed = el("button", "ib rip"); ed.type = "button"; ed.innerHTML = icon("edit"); ed.setAttribute("aria-label", "Edit task"); ed.onclick = function () { openTaskSheet(k); };
      var dl = el("button", "ib rip"); dl.type = "button"; dl.innerHTML = icon("trash"); dl.setAttribute("aria-label", "Delete task");
      dl.onclick = function () {
        var idx = tasks.indexOf(k); tasks.splice(idx, 1); saveTasks(); renderTasks();
        snack("Task deleted", "Undo", function () { tasks.splice(Math.min(idx, tasks.length), 0, k); saveTasks(); renderTasks(); });
      };
      li.appendChild(lab); li.appendChild(body); li.appendChild(ed); li.appendChild(dl); list.appendChild(li);
    });
    updateBadge();
  }
  function taskSummary() {
    var c = counts();
    if (!tasks.length) return "You have no tasks yet. Say \"add task call the school friday\" and I'll save it.";
    var s = "You have " + c.open + " open task" + (c.open === 1 ? "" : "s") + ".";
    if (c.over) s += " " + c.over + " overdue."; if (c.today) s += " " + c.today + " due today.";
    if (!c.over && !c.today) s += " Nothing urgent.";
    return s;
  }
  var editing = null, sheetFix = null;
  function markDueChip(val) {
    qa("#dueChips .chip").forEach(function (c) {
      var d = c.getAttribute("data-due"), v = d === "today" ? addDays(0) : d === "tomorrow" ? addDays(1) : d === "week" ? addDays(7) : "";
      c.classList.toggle("on", v === (val || ""));
    });
  }
  function openTaskSheet(task, prefill) {
    editing = task && task.id ? task : null; sheetFix = (task && task.fix) || (prefill && prefill.fix) || null;
    $("taskSheetTitle").textContent = editing ? "Edit task" : "New task";
    $("taskText").value = editing ? editing.text : (prefill && prefill.text) || "";
    var due = editing ? editing.due : (prefill && prefill.due) || "";
    $("taskDue").value = due || ""; markDueChip(due);
    pushSheet($("taskSheet"));
    setTimeout(function () { $("taskText").focus(); }, 360);
  }
  qa("#dueChips .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      var d = c.getAttribute("data-due"), v = d === "today" ? addDays(0) : d === "tomorrow" ? addDays(1) : d === "week" ? addDays(7) : "";
      $("taskDue").value = v; markDueChip(v);
    });
  });
  $("taskDue").addEventListener("change", function () { markDueChip($("taskDue").value); if (!qa("#dueChips .chip.on").length) qa("#dueChips .chip").forEach(function (c) { c.classList.remove("on"); }); });
  $("taskCancel").addEventListener("click", closeTop);
  $("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = $("taskText").value.trim(); if (!t) { $("taskText").focus(); return; }
    var due = $("taskDue").value || null;
    if (editing) { editing.text = t; editing.due = due; saveTasks(); renderTasks(); snack("Task updated"); }
    else { addTask(t, due, sheetFix); snack("Task saved" + (due ? " for " + fmtDue(due) : "")); }
    closeTop();
  });
  $("taskFab").addEventListener("click", function () { openTaskSheet(null); });
  qa("#taskTabs .chip").forEach(function (t) { t.addEventListener("click", function () { setTaskView(t.getAttribute("data-view")); }); });

  /* ================= TEACH SIMON ================= */
  function saveUnknown() { store.set("simon_unknown", unknown); }
  function renderUnknown() {
    var ul = $("unknownList"); ul.textContent = "";
    if (!unknown.length) { ul.appendChild(el("li", "empty", "Nothing yet. Simon will keep what he can't answer.")); return; }
    unknown.slice(0, 20).forEach(function (u) { ul.appendChild(el("li", "", u.q)); });
  }
  function rememberUnknown(q) {
    var key = B.norm(q);
    if (!unknown.some(function (u) { return B.norm(u.q) === key; })) { unknown.unshift({ q: q.slice(0, 200), t: Date.now() }); unknown = unknown.slice(0, 50); saveUnknown(); }
    renderUnknown();
  }
  $("sendUnknown").onclick = function () {
    if (!unknown.length) { snack("Nothing to send yet."); return; }
    openWA("Questions for Simon:\n- " + unknown.slice(0, 10).map(function (u) { return u.q; }).join("\n- "));
  };
  $("clearUnknown").onclick = function () { var prev = unknown; unknown = []; saveUnknown(); renderUnknown(); snack("Cleared", "Undo", function () { unknown = prev; saveUnknown(); renderUnknown(); }); };

  /* ================= PDF TO TEXT (offline, local pdf.js) ================= */
  var pdfLoading = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfLoading) return pdfLoading;
    pdfLoading = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "pdf.min.js";
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js"; res(window.pdfjsLib); };
      s.onerror = function () { pdfLoading = null; rej(new Error("load")); };
      document.head.appendChild(s);
    });
    return pdfLoading;
  }
  function pageText(content) {
    var out = "", lastY = null;
    content.items.forEach(function (it) {
      if (typeof it.str !== "string") return;
      var y = it.transform ? it.transform[5] : 0;
      if (lastY !== null && Math.abs(y - lastY) > 2) out += "\n"; else if (out && !/\s$/.test(out) && it.str) out += " ";
      out += it.str; lastY = y;
    });
    return out.replace(/[ \t]+\n/g, "\n").trim();
  }
  function buildPdfTool(host) {
    var drop = el("label", "drop"); drop.appendChild(document.createTextNode("Drop a PDF here, or tap to choose one. It never leaves this device."));
    var file = el("input"); file.type = "file"; file.accept = "application/pdf,.pdf"; drop.appendChild(file);
    var status = el("div", "status"); status.setAttribute("role", "status");
    var out = el("textarea", "out"); out.readOnly = true; out.hidden = true; out.setAttribute("aria-label", "Extracted text");
    var row = el("div", "row-actions"); row.hidden = true;
    var copy = el("button", "tonal rip", "Copy text"); copy.type = "button";
    var dl = el("button", "tonal rip", "Download .txt"); dl.type = "button";
    row.appendChild(copy); row.appendChild(dl);
    [drop, status, out, row].forEach(function (n) { host.appendChild(n); });
    var base = "converted";
    function setStatus(t, cls) { status.textContent = t; status.className = "status" + (cls ? " " + cls : ""); }
    function run(f) {
      if (!f) return;
      if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") { setStatus("That is not a PDF. Please choose a .pdf file.", "err"); return; }
      if (f.size > MAX_PDF_MB * 1048576) { setStatus("That file is over " + MAX_PDF_MB + " MB. Too big for me to read here.", "err"); return; }
      base = f.name.replace(/\.pdf$/i, "") || "converted"; out.hidden = true; row.hidden = true;
      setStatus("Loading the PDF reader…");
      var started = performance.now();
      loadPdfJs().then(function (lib) { return f.arrayBuffer().then(function (buf) { return lib.getDocument({ data: buf }).promise; }); })
        .then(function (pdf) {
          var parts = [], empty = [], i = 1;
          function next() {
            if (i > pdf.numPages) return Promise.resolve();
            setStatus("Reading page " + i + " of " + pdf.numPages + "…");
            var n = i++;
            return pdf.getPage(n).then(function (p) { return p.getTextContent(); }).then(function (c) { var t = pageText(c); if (t.replace(/\s/g, "").length < 3) empty.push(n); parts.push(t); return next(); });
          }
          return next().then(function () { return { pdf: pdf, parts: parts, empty: empty }; });
        }).then(function (r) {
          var text = r.parts.join("\n\n").trim(), chars = text.replace(/\s/g, "").length, secs = ((performance.now() - started) / 1000).toFixed(1);
          if (chars < 20) { setStatus("Ja-nee. This PDF has no real text inside, it's probably a scan or photo. I can't do OCR yet, and I won't make text up. Try the original file, or a clearer export.", "warn"); return; }
          out.value = text; out.hidden = false; row.hidden = false;
          var msg = "Done in " + secs + "s: " + r.pdf.numPages + " page" + (r.pdf.numPages === 1 ? "" : "s") + ", about " + text.split(/\s+/).length + " words.";
          if (r.empty.length) { msg += " No readable text on page" + (r.empty.length === 1 ? " " : "s ") + r.empty.join(", ") + " (scanned or image-only)."; setStatus(msg, "warn"); } else setStatus(msg);
        }).catch(function (err) {
          if (err && err.message === "load") setStatus("Ja-nee, I couldn't load the PDF reader. Reload the app and try again.", "err");
          else setStatus("I couldn't open that PDF. It may be damaged or password-protected.", "err");
        });
    }
    file.onchange = function () { run(file.files[0]); };
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function (e) { run(e.dataTransfer && e.dataTransfer.files[0]); });
    copy.onclick = function () { copyText(out.value, "Copied"); };
    dl.onclick = function () {
      var url = URL.createObjectURL(new Blob([out.value], { type: "text/plain;charset=utf-8" }));
      var a = el("a"); a.href = url; a.download = base + ".txt"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    };
    return { run: run };
  }
  var toolsPdf = buildPdfTool($("pdfHost"));
  function showPdfCard() { var card = el("div", "msg card"); buildPdfTool(card); log.appendChild(card); scrollDown(); }

  /* ================= FIX LANE ================= */
  function saveCases() { cases = cases.slice(0, 60); store.set("simon_cases", cases); }
  function saveStats() { store.set("simon_stats", stats); }
  function newCase(fx, title) {
    var c = { id: Date.now() + "" + Math.floor(Math.random() * 100), fixId: fx ? fx.id : null, title: fx ? fx.t : title, started: Date.now(), upd: Date.now(), idx: 0, done: [], status: "open", note: "" };
    cases.unshift(c); saveCases(); return c;
  }
  function short(s, n) { s = String(s).replace(/\s+/g, " "); return s.length > n ? s.slice(0, n - 1).trim() + "…" : s; }
  function buildHandover(c, fx) {
    var L = ["PIXELPROTECH HANDOVER SHEET", "Problem: " + c.title];
    if (c.note) L.push("Details: " + c.note);
    var d = SC.deviceInfo(); L.push("Device: " + d.os + " · " + d.browser + " · " + d.screen);
    var sc = store.get("simon_scan", null);
    if (sc) {
      L.push("Last Pocket Scan (" + ago(sc.ts) + "): " + (sc.score == null ? "n/a" : sc.score + "/100"));
      sc.rows.filter(function (r) { return r.status === "warn" || r.status === "bad"; }).forEach(function (r) { L.push("  - " + r.label + ": " + r.value); });
    }
    if (fx) {
      var tried = [];
      fx.st.forEach(function (s, i) { if (c.done[i]) tried.push((i + 1) + ". " + short(s, 100)); });
      L.push("Steps tried (" + tried.length + " of " + fx.st.length + "):"); L.push(tried.length ? tried.join("\n") : "None yet.");
    }
    L.push("Result: not fixed yet. Please advise or book a visit.");
    return L.join("\n");
  }
  function fixText(fx) {
    return "FIX: " + fx.t + " (about " + fx.m + " min)\n" + (fx.w ? "CAREFUL: " + fx.w + "\n" : "") + "\n" +
      fx.st.map(function (s, i) { return (i + 1) + ". " + s; }).join("\n") + "\n\nIf it's still broken: " + fx.e + "\n\nFrom Ugubhela Simon, PixelProTech Solutions. Works offline.";
  }

  function renderFixes() {
    var q = $("fixQ").value.trim(), list = $("fixList"); list.textContent = "";
    stats = store.get("simon_stats", stats);
    var st = $("fixStats"); st.textContent = "";
    [[FX.list.length, "Fixes"], [stats.fixed, "Fixed by you"], ["R" + (stats.fixed * CALLOUT), "≈ Call-outs saved"]].forEach(function (a) {
      var d = el("div", "stat"); d.appendChild(el("b", "", String(a[0]))); d.appendChild(el("small", "", a[1])); st.appendChild(d);
    });
    var cats = $("fixCats");
    if (!cats.childNodes.length) {
      [{ id: "all", name: "All", ico: "all" }].concat(FX.cats).forEach(function (c) {
        var b = el("button", "chip rip"); b.type = "button"; b.setAttribute("data-cat", c.id); b.innerHTML = icon(c.ico) + "<span>" + c.name + "</span>";
        b.onclick = function () { fixCat = c.id; $("fixQ").value = ""; renderFixes(); }; cats.appendChild(b);
      });
    }
    qa(".chip", cats).forEach(function (b) { b.classList.toggle("on", !q && b.getAttribute("data-cat") === fixCat); });

    var strip = $("caseStrip"); strip.textContent = "";
    var open = cases.filter(function (c) { return c.status === "open" && c.fixId && c.idx > 0; }).slice(0, 3);
    if (open.length && !q) {
      var wrap = el("div", "casestrip"); wrap.appendChild(el("h5", "", "Pick up where you left off"));
      open.forEach(function (c) {
        var fx = FX.byId[c.fixId]; if (!fx) return;
        var b = el("button", "casecard rip"); b.type = "button";
        var tx = el("div"); tx.style.flex = "1"; tx.appendChild(el("b", "", c.title)); tx.appendChild(el("small", "", "Step " + (c.idx + 1) + " of " + fx.st.length + " · " + ago(c.upd)));
        b.appendChild(tx); b.insertAdjacentHTML("beforeend", icon("chev")); b.lastChild.style.cssText = "width:20px;height:20px;color:#b08cff";
        b.onclick = function () { openFix(c.fixId, c); }; wrap.appendChild(b);
      });
      strip.appendChild(wrap);
    }

    var items;
    if (q) { items = B.findFixes(q, FX.list, 12).filter(function (m) { return m.score >= 2; }).map(function (m) { return m.fix; }); }
    else items = FX.list.filter(function (f) { return fixCat === "all" || f.cat === fixCat; });
    if (!items.length) {
      var e = el("div", "empty"); e.appendChild(el("p", "", "Not in the library yet. Describe it in your own words and hand it to the team. Your device details and anything you tried go with it."));
      var b = el("button", "primary rip", "Send to PixelProTech"); b.type = "button";
      b.onclick = function () { rememberUnknown(q); var c = newCase(null, q || "Problem"); c.note = q; c.status = "handover"; stats.handed++; saveStats(); saveCases(); openWA(buildHandover(c, null)); };
      e.appendChild(b); list.appendChild(e); return;
    }
    items.forEach(function (f) {
      var b = el("button", "fix rip"); b.type = "button";
      b.appendChild(thumb(f));
      var tx = el("div"); tx.style.cssText = "flex:1;min-width:0";
      tx.appendChild(el("h4", "", f.t)); tx.appendChild(el("p", "", f.s));
      var tags = el("div", "tags"); tags.appendChild(el("span", "tag", "≈ " + f.m + " min")); tags.appendChild(el("span", "tag l" + f.l, LEVEL[f.l]));
      if (f.w) tags.appendChild(el("span", "tag l2", "careful"));
      tx.appendChild(tags); b.appendChild(tx);
      b.insertAdjacentHTML("beforeend", icon("chev")); b.lastChild.style.cssText = "width:20px;height:20px;color:#5d5d7a;flex:none";
      b.onclick = function () { openFix(f.id); }; list.appendChild(b);
    });
  }
  $("fixQ").addEventListener("input", renderFixes);

  /* ----- the guided runner ----- */
  var run = null;
  function openFix(id, resume) {
    var fx = FX.byId[id]; if (!fx) return;
    var c = resume;
    if (!c) { c = cases.filter(function (x) { return x.fixId === id && x.status === "open"; })[0] || newCase(fx); }
    run = { c: c, fx: fx };
    renderRunner();
    if (!stack.some(function (s) { return s.node === $("fixSheet"); })) {
      pushSheet($("fixSheet"), function () {
        if (run && run.c.status === "open" && !run.c.idx && !run.c.done.some(Boolean)) { cases = cases.filter(function (x) { return x !== run.c; }); }
        saveCases(); run = null; if ($("v-fix").classList.contains("on")) renderFixes();
      });
    }
    $("fixSheet").querySelector(".sheet-in").scrollTop = 0;
  }
  function touch() { run.c.upd = Date.now(); saveCases(); }
  function burst(host) {
    var cols = ["#00d4aa", "#7b2fff", "#b08cff", "#efaa32", "#f0f0f8"];
    for (var i = 0; i < 22; i++) {
      var p = el("i", "burst"), a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 130;
      p.style.setProperty("--dx", Math.cos(a) * r + "px"); p.style.setProperty("--dy", Math.sin(a) * r - 30 + "px");
      p.style.background = cols[i % cols.length]; host.appendChild(p); (function (n) { setTimeout(function () { n.remove(); }, 1100); })(p);
    }
  }
  function shareFix() { shareText(run.fx.t, fixText(run.fx)); }
  function renderRunner() {
    var c = run.c, fx = run.fx, body = $("fixBody"); body.textContent = "";
    var top = el("div", "run-top"); top.appendChild(thumb(fx)); top.appendChild(el("h3", "", fx.t));
    var x = el("button", "xbtn rip"); x.type = "button"; x.innerHTML = icon("close"); x.setAttribute("aria-label", "Close"); x.onclick = closeTop; top.appendChild(x); body.appendChild(top);
    var tags = el("div", "tags"); tags.appendChild(el("span", "tag", "≈ " + fx.m + " min")); tags.appendChild(el("span", "tag l" + fx.l, LEVEL[fx.l])); tags.appendChild(el("span", "tag", fx.st.length + " steps")); body.appendChild(tags);
    if (fx.w) body.appendChild(el("div", "warn-box", fx.w));

    if (c.status === "fixed") {
      var done = el("div", "finish"); done.style.position = "relative";
      done.appendChild(el("h4", "", "Sorted. Lekker."));
      var tried = c.done.filter(Boolean).length;
      done.appendChild(el("p", "lead", "Fixed after " + (tried + 1) + " step" + (tried ? "s" : "") + ". That's about R" + CALLOUT + " of call-out you didn't need. Logged on this device."));
      var rb = el("div", "row-actions");
      var ok = el("button", "primary rip", "Done"); ok.type = "button"; ok.onclick = closeTop;
      var no = el("button", "text rip", "Not actually fixed"); no.type = "button"; no.onclick = function () { c.status = "open"; stats.fixed = Math.max(0, stats.fixed - 1); saveStats(); touch(); renderRunner(); };
      rb.appendChild(ok); rb.appendChild(no); done.appendChild(rb); body.appendChild(done); burst(done); return;
    }

    var lane = el("div", "lane"); lane.setAttribute("aria-hidden", "true");
    fx.st.forEach(function (s, i) { lane.appendChild(el("i", c.done[i] ? "done" : i < c.idx ? "skip" : i === c.idx && c.idx < fx.st.length ? "cur" : "")); });
    body.appendChild(lane);

    if (c.idx >= fx.st.length || c.status === "handover") {
      var f = el("div", "finish");
      f.appendChild(el("h4", "", "Still not sorted?"));
      f.appendChild(el("p", "esc", fx.e));
      f.appendChild(el("p", "lead", "Hand it to PixelProTech. The sheet below lists what you tried, so nobody repeats it."));
      var ta = el("textarea"); ta.placeholder = "Anything else we should know? (optional)"; ta.value = c.note || ""; ta.maxLength = 400; ta.setAttribute("aria-label", "Extra details");
      ta.oninput = function () { c.note = ta.value; };
      f.appendChild(ta);
      var pre = el("p", "note", "Preview: " + short(buildHandover(c, fx).split("\n").slice(0, 3).join(" · "), 140)); f.appendChild(pre);
      var rb2 = el("div", "row-actions");
      var wa = el("button", "primary rip", "Send on WhatsApp"); wa.type = "button";
      wa.onclick = function () { c.note = ta.value; c.status = "handover"; stats.handed++; saveStats(); touch(); openWA(buildHandover(c, fx)); };
      var cp = el("button", "tonal rip", "Copy sheet"); cp.type = "button"; cp.onclick = function () { c.note = ta.value; touch(); copyText(buildHandover(c, fx), "Handover sheet copied"); };
      var bk = el("button", "text rip", "Back to steps"); bk.type = "button"; bk.onclick = function () { c.idx = Math.max(0, fx.st.length - 1); c.status = "open"; touch(); renderRunner(); };
      var fixd = el("button", "text rip", "It's fixed after all"); fixd.type = "button"; fixd.onclick = function () { markFixed(); };
      rb2.appendChild(wa); rb2.appendChild(cp); f.appendChild(rb2);
      var rb3 = el("div", "row-actions"); rb3.appendChild(bk); rb3.appendChild(fixd); f.appendChild(rb3);
      body.appendChild(f); return;
    }

    var card = el("div", "step-card");
    card.appendChild(el("div", "n", "STEP " + (c.idx + 1) + " OF " + fx.st.length));
    card.appendChild(el("p", "", fx.st[c.idx])); body.appendChild(card);
    var rb4 = el("div", "run-btns");
    var fixedBtn = el("button", "primary win rip", "It's fixed"); fixedBtn.type = "button"; fixedBtn.onclick = function () { c.done[c.idx] = true; markFixed(); };
    var nextBtn = el("button", "primary rip", c.idx === fx.st.length - 1 ? "Still broken" : "Tried it, next step"); nextBtn.type = "button";
    nextBtn.onclick = function () { c.done[c.idx] = true; c.idx++; touch(); renderRunner(); $("fixSheet").querySelector(".sheet-in").scrollTop = 0; };
    rb4.appendChild(fixedBtn); rb4.appendChild(nextBtn); body.appendChild(rb4);
    var rb5 = el("div", "run-more");
    if (c.idx > 0) { var back = el("button", "text rip", "Back"); back.type = "button"; back.onclick = function () { c.idx--; touch(); renderRunner(); }; rb5.appendChild(back); }
    if (c.idx > 0) { var so = el("button", "text rip", "Start over"); so.type = "button"; so.onclick = function () { c.idx = 0; c.done = []; touch(); renderRunner(); }; rb5.appendChild(so); }
    var skip = el("button", "text rip", "Skip this step"); skip.type = "button"; skip.onclick = function () { c.done[c.idx] = false; c.idx++; touch(); renderRunner(); }; rb5.appendChild(skip);
    var rem = el("button", "text rip", "Remind me at the PC"); rem.type = "button"; rem.onclick = function () { openTaskSheet(null, { text: "Fix: " + fx.t, due: addDays(0), fix: fx.id }); }; rb5.appendChild(rem);
    var sh = el("button", "text rip", "Share fix"); sh.type = "button"; sh.onclick = shareFix; rb5.appendChild(sh);
    body.appendChild(rb5);

    var det = el("details", "all"); var sm = el("summary", "", "See all steps"); det.appendChild(sm);
    var ol = el("ol"); fx.st.forEach(function (s, i) { ol.appendChild(el("li", c.done[i] ? "d" : "", s)); }); det.appendChild(ol);
    body.appendChild(det);
  }
  function markFixed() {
    var c = run.c; c.status = "fixed"; c.fixedAt = Date.now(); stats.fixed++; saveStats(); touch(); renderRunner(); persist();
    snack("Logged as fixed. ≈ R" + CALLOUT + " call-out avoided.");
  }

  /* ================= POCKET SCAN ================= */
  var scanning = false, lastScan = store.get("simon_scan", null);
  function rowEl(r) {
    var li = el("li", "srow");
    li.appendChild(el("span", "dotp " + r.status)); li.appendChild(el("span", "lbl", r.label)); li.appendChild(el("span", "val", r.value));
    if (r.note) li.appendChild(el("span", "nt", r.note));
    if (r.fix && r.fix.length) {
      var fx = el("div", "fx");
      r.fix.forEach(function (id) { var f = FX.byId[id]; if (!f) return; var b = el("button", "fxchip rip", "Fix: " + f.t); b.type = "button"; b.onclick = function () { go("fix"); openFix(id); }; fx.appendChild(b); });
      li.appendChild(fx);
    }
    return li;
  }
  function showScore(res) {
    var n = $("scoreNum"), arc = $("scoreArc"), lbl = $("scoreLbl");
    if (!res || res.score == null) { n.textContent = "--"; lbl.textContent = "not scanned"; arc.style.strokeDashoffset = "326.7"; return; }
    var s = res.score, col = s >= 80 ? "#00d4aa" : s >= 55 ? "#efaa32" : "#ff6b6b";
    arc.style.stroke = col; arc.style.color = col; arc.style.strokeDashoffset = String(326.7 * (1 - s / 100));
    n.textContent = s; lbl.textContent = s >= 80 ? "healthy" : s >= 55 ? "fair" : "needs work";
  }
  function showScanResult(res, fresh) {
    showScore(res);
    var rows = $("scanRows"); rows.textContent = ""; res.rows.forEach(function (r) { rows.appendChild(rowEl(r)); });
    var bad = res.rows.filter(function (r) { return r.status === "warn" || r.status === "bad"; }).length;
    $("scanLead").textContent = bad ? bad + " thing" + (bad === 1 ? "" : "s") + " worth a look. Tap a fix chip and Simon walks you through it." : "Nothing to worry about on this device right now.";
    $("scanActions").hidden = false; $("scanLast").textContent = (fresh ? "Scanned just now." : "Last scan " + ago(res.ts) + ".") + " Results stay on this device.";
    $("scanGoTxt").textContent = "Scan again";
  }
  function doScan() {
    if (scanning) return; scanning = true;
    var btn = $("scanGo"), hero = qa(".scan-hero")[0]; btn.disabled = true; $("scanGoTxt").textContent = "Scanning…"; hero.classList.add("scanning");
    $("scanRows").textContent = ""; $("scanActions").hidden = true; showScore(null); $("scoreLbl").textContent = "scanning";
    SC.run({ speed: $("scanSpeed").checked }, function (row) { $("scanRows").appendChild(rowEl(row)); }).then(function (res) {
      lastScan = res; store.set("simon_scan", res); scanning = false; btn.disabled = false; hero.classList.remove("scanning");
      showScanResult(res, true);
    });
  }
  $("scanGo").addEventListener("click", doScan);
  $("scanCopy").addEventListener("click", function () { if (lastScan) copyText(SC.report(lastScan), "Report copied"); });
  $("scanWA").addEventListener("click", function () { if (lastScan) openWA("Pocket Scan report from Simon:\n\n" + SC.report(lastScan)); });
  if (navigator.share) { $("scanShare").hidden = false; $("scanShare").addEventListener("click", function () { if (lastScan) shareText("Pocket Scan", SC.report(lastScan)); }); }
  if (lastScan && lastScan.rows) showScanResult(lastScan, false);

  /* ================= TOOLS: install, backup, contact ================= */
  var deferred = null;
  function standalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true; }
  function updateInstallUI() {
    var can = !!deferred && !standalone();
    $("installTop").hidden = !can; $("installBtn").hidden = !can;
    if (standalone()) { $("installTxt").textContent = "Simon is installed. Open him any time, even with no signal."; }
    else if (!deferred) {
      var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      $("installTxt").textContent = ios ? "On iPhone or iPad: tap Share, then Add to Home Screen." : "To install: open the browser menu and choose Install app (or Add to Home screen).";
    }
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; updateInstallUI(); });
  window.addEventListener("appinstalled", function () { deferred = null; updateInstallUI(); snack("Simon is installed"); });
  function doInstall() { if (!deferred) return; deferred.prompt(); deferred.userChoice.then(function () { deferred = null; updateInstallUI(); }); }
  $("installTop").addEventListener("click", doInstall); $("installBtn").addEventListener("click", doInstall);

  $("ctWA").addEventListener("click", function () { openWA("Hi PixelProTech!"); });
  $("bkExport").addEventListener("click", function () {
    var data = { app: "ugubhela-simon", v: 1, saved: new Date().toISOString(), tasks: tasks, cases: cases, unknown: unknown, stats: stats, scan: lastScan };
    var url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    var a = el("a"); a.href = url; a.download = "simon-backup-" + todayISO() + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    snack("Backup saved to your downloads");
  });
  $("bkImport").addEventListener("change", function (e) {
    var f = e.target.files[0]; e.target.value = ""; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (!d || d.app !== "ugubhela-simon" || !Array.isArray(d.tasks)) throw new Error("bad");
        var prev = { tasks: tasks, cases: cases, unknown: unknown, stats: stats, scan: lastScan };
        function apply(x) {
          tasks = Array.isArray(x.tasks) ? x.tasks : []; cases = Array.isArray(x.cases) ? x.cases : []; unknown = Array.isArray(x.unknown) ? x.unknown : [];
          stats = x.stats && typeof x.stats.fixed === "number" ? x.stats : { fixed: 0, handed: 0 }; lastScan = x.scan || null;
          saveTasks(); saveCases(); saveUnknown(); saveStats(); store.set("simon_scan", lastScan); renderTasks(); renderUnknown(); renderFixes();
          if (lastScan && lastScan.rows) showScanResult(lastScan, false);
        }
        apply(d); snack("Backup restored", "Undo", function () { apply(prev); });
      } catch (er) { snack("That isn't a Simon backup file."); }
    };
    r.readAsText(f);
  });

  /* ================= online chip, service worker ================= */
  function netState() { var off = navigator.onLine === false; $("netChip").classList.toggle("off", off); $("netTxt").textContent = off ? "offline · still works" : "offline-ready"; }
  window.addEventListener("online", netState); window.addEventListener("offline", netState); netState();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    var reloading = false, hadCtl = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", function () { if (reloading || !hadCtl) return; reloading = true; location.reload(); });
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      function watch(w) { w.addEventListener("statechange", function () { if (w.state === "installed" && navigator.serviceWorker.controller) snack("Update ready", "Reload", function () { w.postMessage("skip"); }, 15000); }); }
      if (reg.waiting && navigator.serviceWorker.controller) snack("Update ready", "Reload", function () { reg.waiting.postMessage("skip"); }, 15000);
      reg.addEventListener("updatefound", function () { if (reg.installing) watch(reg.installing); });
    }).catch(function () {});
  }

  /* ================= share target (Android: share a PDF or text to Simon) ================= */
  function takeShared() {
    if (!("caches" in window)) return;
    caches.open("simon-share").then(function (cache) {
      return cache.keys().then(function (keys) {
        if (!keys.length) return;
        return Promise.all(keys.map(function (k) { return cache.match(k).then(function (res) { return res.blob().then(function (b) { return { url: k.url, name: res.headers.get("x-name") || "shared.pdf", blob: b, type: res.headers.get("content-type") || "" }; }); }); }))
          .then(function (items) {
            return Promise.all(keys.map(function (k) { return cache.delete(k); })).then(function () {
              var pdf = items.filter(function (i) { return /pdf/i.test(i.type) || /\.pdf$/i.test(i.name); })[0];
              var txt = items.filter(function (i) { return /text\/plain/i.test(i.type) && /shared-text/.test(i.url); })[0];
              if (pdf) { go("tools"); var f = new File([pdf.blob], pdf.name, { type: "application/pdf" }); setTimeout(function () { toolsPdf.run(f); snack("Reading the PDF you shared"); }, 250); }
              else if (txt) { return txt.blob.text().then(function (t) { t = t.trim(); if (t) { go("fix"); $("fixQ").value = t.slice(0, 200); renderFixes(); } }); }
            });
          });
      });
    }).catch(function () {});
  }

  /* ================= boot ================= */
  var params = new URLSearchParams(location.search), first = (location.hash || "").replace("#", "");
  $("heroSub").textContent = FX.list.length + " guided fixes, a real device scan, PDF to text and tasks. All of it works offline.";
  renderTasks(); renderUnknown(); updateBadge(); updateInstallUI();
  var c0 = counts(), hello = "Sharp, bro! Ugubhela Simon here, your IT FAST BRO. Tell me what's broken and I'll walk you through the fix, even with no signal. I can also scan this device, do PDF to text and keep tasks.";
  if (c0.over || c0.today) hello += "\n\nHeads up: " + (c0.over ? c0.over + " overdue" : "") + (c0.over && c0.today ? " and " : "") + (c0.today ? c0.today + " due today" : "") + ".";
  say(hello);

  var goto = params.get("go") || first;
  if (goto === "task") { go("tasks"); setTimeout(function () { openTaskSheet(null); }, 300); }
  else if (VIEWS.indexOf(goto) > -1) go(goto);
  if (params.get("shared")) { takeShared(); try { history.replaceState(null, "", location.pathname + (location.hash || "")); } catch (e) {} }
  window.SimonApp = { go: go, openFix: openFix, handle: handle };
})();
