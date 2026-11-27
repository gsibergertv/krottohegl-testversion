(function () {
  var box = document.getElementById("protokoll-inhalt");
  if (!box) return;
  var COLORS = { Paladin: "#f58cba", Schamane: "#0070de", Priester: "#ffffff", Krieger: "#c79c6e", Magier: "#40c7eb", Druide: "#ff7d0a", "Jäger": "#abd473", Schurke: "#fff569" };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function de(iso) { if (!iso) return ""; var p = iso.split("-"); return p[2] + "." + p[1] + "." + p[0]; }
  function kw(iso) { var d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + 4 - (d.getDay() || 7)); var y = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - y) / 864e5 + 1) / 7); }
  function lv(r) { return r.level && r.level[0] != null ? r.level[1] - r.level[0] : 0; }
  function stat(label, value, sub) { var s = el("div", "wp-stat"); s.appendChild(el("span", "wp-stat-label", label)); s.appendChild(el("strong", null, value)); if (sub) s.appendChild(el("small", null, sub)); return s; }
  function chip(text, strong) { var c = el("span", "wp-chip" + (strong ? " wp-chip-strong" : ""), text); return c; }
  function week(w) {
    var wrap = el("div", "wp-week");
    var rows = w.changes || [];
    var levels = rows.reduce(function (n, r) { return n + Math.max(0, lv(r)); }, 0);
    var prof = rows.reduce(function (n, r) { return n + (r.professions || []).reduce(function (a, p) { return a + Math.max(0, p[2] - (p[1] || 0)); }, 0); }, 0);
    var top = rows.slice().sort(function (a, b) { return lv(b) - lv(a); })[0];
    var stats = el("div", "wp-stats");
    stats.appendChild(stat("Aufsteiger der Woche", top && lv(top) > 0 ? top.name : "–", top && lv(top) > 0 ? "+" + lv(top) + " Level" : ""));
    stats.appendChild(stat("Level gesamt", "+" + levels, "über alle Charaktere"));
    stats.appendChild(stat("Berufspunkte", "+" + prof, "Fertigkeit gesammelt"));
    stats.appendChild(stat("Mit Fortschritt", String(rows.length), rows.length === 1 ? "Charakter" : "Charaktere"));
    wrap.appendChild(stats);
    if (!rows.length) { wrap.appendChild(el("p", "wp-empty", "Diese Woche gab es keine Änderungen im Armory.")); return wrap; }
    var list = el("ul", "wp-list");
    rows.forEach(function (r) {
      var li = el("li", "wp-row");
      var n = el("span", "wp-name", r.name); n.style.color = COLORS[r.klass] || ""; li.appendChild(n);
      var chips = el("div", "wp-chips");
      if (r.new) chips.appendChild(chip("Neu in der Gilde", true));
      if (r.level && r.level[0] != null) chips.appendChild(chip("Level " + r.level[0] + " → " + r.level[1] + " (+" + lv(r) + ")", true));
      if (r.ilvl) chips.appendChild(chip("Itemlevel " + r.ilvl[0] + " → " + r.ilvl[1]));
      (r.professions || []).forEach(function (p) { chips.appendChild(chip(p[0] + " " + (p[1] != null ? p[1] + " → " : "") + p[2])); });
      if (r.spec) chips.appendChild(chip("Skillung: " + r.spec));
      li.appendChild(chips); list.appendChild(li);
    });
    wrap.appendChild(list);
    return wrap;
  }
  fetch("wochenprotokoll.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (data) {
    var weeks = data.weeks || [];
    box.textContent = "";
    if (!weeks.length) { box.appendChild(el("p", "wp-empty", "Das erste Wochenprotokoll erscheint am Freitag.")); return; }
    weeks.forEach(function (w, i) {
      var title = "KW " + kw(w.date) + " · " + de(w.from) + " – " + de(w.to);
      if (i === 0) { box.appendChild(el("h3", "wp-title", title)); box.appendChild(week(w)); }
      else { var d = el("details", "wp-old"); d.appendChild(el("summary", null, title)); d.appendChild(week(w)); box.appendChild(d); }
    });
  }).catch(function () { box.textContent = "Wochenprotokoll konnte nicht geladen werden."; });
})();
