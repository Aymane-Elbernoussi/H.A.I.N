(function () {
  "use strict";
  var D = window.HAIN_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var label = function (s) { return String(s).replace(/_/g, " "); };
  var ago = function (m) {
    if (m < 1) return "now";
    if (m < 60) return m + "m ago";
    var h = Math.floor(m / 60);
    return h < 24 ? h + "h ago" : Math.floor(h / 24) + "d ago";
  };
  var URG = { critical: 0, high: 1, medium: 2, low: 3 };
  var caseById = {};
  D.cases.forEach(function (c) { caseById[c.id] = c; });

  var state = { caseFilter: "all", ledgerFilter: "all", agentFilter: "all" };

  /* ---------- helpers ---------- */
  function chips(el, options, key, onChange) {
    el.innerHTML = options.map(function (o) {
      return '<button class="chip' + (state[key] === o.v ? " on" : "") + '" data-v="' + esc(o.v) + '">' + esc(o.l) + "</button>";
    }).join("");
    el.onclick = function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      state[key] = b.getAttribute("data-v");
      onChange();
    };
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var open = D.cases.filter(function (c) { return c.status !== "resolved"; });
    var crit = open.filter(function (c) { return c.urgency === "critical"; });
    var pending = D.ledger.filter(function (l) { return l.status === "pending"; });
    var week = D.daily.reduce(function (s, d) { return s + d.refund + d.comp + d.loss; }, 0);
    var pendingSum = pending.reduce(function (s, l) { return s + l.amount; }, 0);
    var kpis = [
      { l: "Open cases", v: open.length, h: D.cases.length + " total today", c: "" },
      { l: "Critical open", v: crit.length, h: "Health and safety first", c: crit.length ? "alert" : "" },
      { l: "Awaiting manager", v: pending.length, h: money(pendingSum) + " pending approval", c: pending.length ? "warn" : "" },
      { l: "7-day spend", v: money(week), h: "Refunds, comps and losses approved", c: "" }
    ];
    $("kpis").innerHTML = kpis.map(function (k) {
      return '<div class="kpi ' + k.c + '"><div class="label">' + esc(k.l) + '</div><div class="value">' + esc(k.v) +
        '</div><div class="hint">' + esc(k.h) + "</div></div>";
    }).join("");
  }

  /* ---------- cases ---------- */
  function renderCases() {
    var cats = ["all", "critical", "high", "medium", "low"];
    chips($("case-filters"), cats.map(function (c) { return { v: c, l: c === "all" ? "All" : c[0].toUpperCase() + c.slice(1) }; }), "caseFilter", renderCases);
    var rows = D.cases.filter(function (c) { return state.caseFilter === "all" || c.urgency === state.caseFilter; })
      .sort(function (a, b) {
        var ar = a.status === "resolved" ? 1 : 0, br = b.status === "resolved" ? 1 : 0;
        return ar - br || URG[a.urgency] - URG[b.urgency] || a.ago - b.ago;
      });
    $("case-rows").innerHTML = rows.length ? rows.map(function (c) {
      return '<tr tabindex="0" data-case="' + esc(c.id) + '">' +
        '<td><span class="badge u-' + esc(c.urgency) + '">' + esc(c.urgency) + "</span></td>" +
        '<td><div class="case-id">' + esc(c.id) + '</div><div class="summary">' + esc(c.summary) + "</div></td>" +
        '<td class="guest">' + esc(c.guest) + "</td>" +
        "<td>" + esc(c.room) + "</td>" +
        '<td class="cat">' + esc(c.category) + "</td>" +
        '<td><span class="badge s-' + esc(c.status) + '">' + esc(label(c.status)) + "</span></td>" +
        '<td class="num muted">' + esc(ago(c.ago)) + "</td></tr>";
    }).join("") : '<tr><td colspan="7" class="empty">No cases match this filter.</td></tr>';
  }

  /* ---------- ledger ---------- */
  function renderChart() {
    var max = Math.max.apply(null, D.daily.map(function (d) { return d.refund + d.comp + d.loss; })) || 1;
    var el = $("chart");
    el.className = "chart";
    el.innerHTML = D.daily.map(function (d, i) {
      var total = d.refund + d.comp + d.loss;
      return '<div class="bar-col' + (i === D.daily.length - 1 ? " today" : "") + '" title="' +
        esc(d.label + ": refund " + money(d.refund) + ", comp " + money(d.comp) + ", loss " + money(d.loss)) + '">' +
        '<div class="bar-total">' + money(total) + "</div>" +
        '<div class="stack" style="height:' + (total / max * 118) + 'px">' +
        '<i class="refund" style="flex:' + d.refund + '"></i>' +
        '<i class="comp" style="flex:' + d.comp + '"></i>' +
        '<i class="loss" style="flex:' + d.loss + '"></i></div>' +
        '<div class="bar-label">' + esc(d.label) + "</div></div>";
    }).join("");
  }

  function renderLedger() {
    var opts = [["all", "All"], ["refund", "Refunds"], ["comp", "Comps"], ["loss", "Losses"], ["pending", "Pending"]];
    chips($("ledger-filters"), opts.map(function (o) { return { v: o[0], l: o[1] }; }), "ledgerFilter", renderLedger);
    var f = state.ledgerFilter;
    var rows = D.ledger.filter(function (l) {
      return f === "all" || (f === "pending" ? l.status === "pending" : l.type === f);
    }).sort(function (a, b) { return a.ago - b.ago; });
    var total = rows.reduce(function (s, l) { return s + l.amount; }, 0);
    $("ledger-rows").innerHTML = rows.map(function (l) {
      var approval = l.status === "pending"
        ? '<span class="badge s-awaiting_approval">Needs manager</span>'
        : '<span class="muted">' + esc(l.approved_by.replace("-", " ")) + "</span>";
      return '<tr class="' + (l.status === "pending" ? "pending-row" : "") + '">' +
        '<td class="mono">' + esc(l.id) + '<div class="muted">' + esc(ago(l.ago)) + "</div></td>" +
        '<td><a class="case-id link" href="#cases" data-case="' + esc(l.case) + '">' + esc(l.case) + "</a></td>" +
        '<td class="type t-' + esc(l.type) + '">' + esc(l.type) + "</td>" +
        "<td>" + esc(l.reason) + (l.flag ? '<span class="anomaly">&#9873; ' + esc(l.flag) + "</span>" : "") + "</td>" +
        "<td>" + approval + "</td>" +
        '<td class="num amount">' + money(l.amount) + "</td></tr>";
    }).join("") + '<tr class="ledger-foot"><td colspan="5">' + rows.length + ' entries</td><td class="num">' + money(total) + "</td></tr>";
  }

  /* ---------- agents ---------- */
  function renderAgents() {
    $("agent-cards").innerHTML = D.agents.map(function (a) {
      return '<div class="agent"><div class="agent-top"><div class="avatar a-' + esc(a.id) + '">' + esc(a.name[0]) + "</div>" +
        '<div class="agent-name">' + esc(a.name) + '</div><span class="state ' + esc(a.status) + '">' + esc(a.status) + "</span></div>" +
        '<div class="agent-role">' + esc(a.role) + "</div>" +
        '<div class="task">' + esc(a.task) + "</div>" +
        '<div class="stats">' +
        '<div class="stat"><div class="v">' + a.handled + '</div><div class="k">Handled</div></div>' +
        '<div class="stat"><div class="v">' + esc(a.latency) + '</div><div class="k">Avg time</div></div>' +
        '<div class="stat"><div class="v">' + a.accuracy + '%</div><div class="k">Policy pass</div></div></div>' +
        '<div class="muted mono">' + esc(a.model) + "</div></div>";
    }).join("");

    var opts = [{ v: "all", l: "All" }].concat(D.agents.map(function (a) { return { v: a.id, l: a.name }; }));
    chips($("agent-filters"), opts, "agentFilter", renderAgents);
    var names = {};
    D.agents.forEach(function (a) { names[a.id] = a.name; });
    var ev = D.activity.filter(function (e) { return state.agentFilter === "all" || e.agent === state.agentFilter; })
      .sort(function (a, b) { return a.ago - b.ago; });
    $("stream").innerHTML = ev.length ? ev.map(function (e) {
      return '<li class="ev"><time>' + esc(ago(e.ago)) + "</time>" +
        '<span class="who"><span class="avatar a-' + esc(e.agent) + '">' + esc(names[e.agent][0]) + "</span>" + esc(names[e.agent]) + "</span>" +
        "<span>" + esc(e.text) + ' <span class="kind ' + esc(e.kind) + '">' + esc(e.kind) + "</span></span>" +
        '<a data-case="' + esc(e.case) + '">' + esc(e.case) + "</a></li>";
    }).join("") : '<li class="empty">No activity yet.</li>';
  }

  /* ---------- drawer ---------- */
  var lastFocus = null;
  function openCase(id) {
    var c = caseById[id];
    if (!c) return;
    lastFocus = document.activeElement;
    $("drawer-title").innerHTML = '<div class="case-id">' + esc(c.id) + '</div><h2>' + esc(c.guest) + " · Room " + esc(c.room) + "</h2>";
    var entries = D.ledger.filter(function (l) { return l.case === id; });
    var author = function (a) { return a === "guest" ? "Guest" : a.replace("agent:", ""); };
    $("drawer-body").innerHTML =
      '<div class="meta"><span class="badge u-' + esc(c.urgency) + '">' + esc(c.urgency) + '</span>' +
      '<span class="badge s-' + esc(c.status) + '">' + esc(label(c.status)) + '</span>' +
      '<span class="badge s-open">' + esc(c.category) + '</span><span class="badge s-open">' + esc(c.channel) + "</span></div>" +
      '<div><h3>Thread · BAND room</h3></div><div class="thread">' +
      c.messages.map(function (m) {
        return '<div class="msg ' + (m.author === "guest" ? "guest" : "") + '"><div class="msg-head"><b>' + esc(author(m.author)) +
          "</b><span>" + esc(ago(m.ago)) + "</span></div>" + esc(m.body) + "</div>";
      }).join("") + "</div>" +
      '<div><h3>Ledger entries</h3></div>' +
      (entries.length ? '<div class="mini-ledger">' + entries.map(function (l) {
        return '<div class="row"><span><span class="type t-' + esc(l.type) + '">' + esc(l.type) + "</span> · " + esc(l.reason) +
          (l.status === "pending" ? ' <span class="badge s-awaiting_approval">pending</span>' : "") + '</span><span class="amount">' + money(l.amount) + "</span></div>";
      }).join("") + "</div>" : '<div class="muted">No money attached to this case.</div>');
    $("drawer").classList.add("on");
    $("scrim").classList.add("on");
    $("drawer").setAttribute("aria-hidden", "false");
    $("drawer-close").focus();
  }
  function closeDrawer() {
    $("drawer").classList.remove("on");
    $("scrim").classList.remove("on");
    $("drawer").setAttribute("aria-hidden", "true");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- wiring ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-case]");
    if (t) { e.preventDefault(); openCase(t.getAttribute("data-case")); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("tr[data-case]")) {
      e.preventDefault(); openCase(e.target.getAttribute("data-case"));
    }
  });
  $("drawer-close").onclick = closeDrawer;
  $("scrim").onclick = closeDrawer;

  // active nav link follows scroll
  var links = [].slice.call(document.querySelectorAll(".nav a"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["cases", "ledger", "agents"].forEach(function (id) { io.observe($(id)); });
  }

  function tick() {
    $("clock").textContent = new Date().toLocaleString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }

  $("hotel").textContent = D.hotel;
  tick(); setInterval(tick, 30000);
  renderKpis(); renderCases(); renderChart(); renderLedger(); renderAgents();
})();
