(function () {
  var grid = document.getElementById("charaktere");
  if (!grid) return;
  var COLORS = { Paladin: "#f58cba", Schamane: "#0070de", Priester: "#ffffff", Krieger: "#c79c6e", Magier: "#40c7eb", Druide: "#ff7d0a", "Jäger": "#abd473", Schurke: "#fff569" };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  fetch("members.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (data) {
    var list = data.members.slice().sort(function (a, b) { return b.level - a.level; });
    grid.textContent = "";
    list.forEach(function (m) {
      var card = el("article", "member-card arm-card");
      var head = el("div", "arm-head");
      var crest = el("span", "arm-crest", "🛡"); crest.setAttribute("aria-hidden", "true");
      head.appendChild(crest);
      var box = el("div", "arm-title");
      var name = el("h3", "arm-name", m.name);
      name.style.color = COLORS[m.klass] || "";
      box.appendChild(name);
      var meta = el("p", "arm-meta");
      meta.appendChild(document.createTextNode((m.race || m.klass ? m.level + " " + [m.race, m.klass].filter(Boolean).join(" ") : "Level " + m.level) + " "));
      meta.appendChild(el("span", "arm-guild", "‹Senioren Gaming›"));
      box.appendChild(meta);
      head.appendChild(box);
      if (m.ilvl) { var il = el("div", "arm-ilvl"); il.appendChild(el("span", null, "⚔ ")); il.appendChild(document.createTextNode(m.ilvl + " ILVL")); head.appendChild(il); }
      card.appendChild(head);
      var slug = m.name.toLowerCase().replace(/ /g, "-");
      var pic = el("div", "arm-pic");
      var img = document.createElement("img");
      img.src = "assets/chars/" + slug + ".jpg"; img.alt = "Charakter " + m.name; img.loading = "lazy"; img.width = 390; img.height = 500;
      img.onerror = function () {
        if (m.render && img.src !== m.render) { img.src = m.render; pic.classList.add("arm-pic-render"); return; }
        pic.className = "arm-pic arm-pic-empty"; pic.textContent = "Bild folgt";
      };
      pic.appendChild(img); card.appendChild(pic);
      var dl = el("dl", "arm-info");
      [["Rang", m.rank]].concat(m.profession ? [["Beruf", m.profession]] : []).forEach(function (p) {
        var d = el("div"); d.appendChild(el("dt", null, p[0])); d.appendChild(el("dd", null, p[1])); dl.appendChild(d);
      });
      card.appendChild(dl);
      var a = el("a", "arm-link", "Ausrüstung im Armory ansehen");
      a.href = data.armoryBase + encodeURIComponent(m.name.toLowerCase().replace(/ /g, "-"));
      a.target = "_blank"; a.rel = "noopener"; card.appendChild(a);
      grid.appendChild(card);
    });
    var facts = document.getElementById("gilden-fakten");
    if (facts) {
      var master = list.filter(function (x) { return /meister/i.test(x.rank); })[0];
      var avg = Math.round(list.reduce(function (n, x) { return n + x.level; }, 0) / list.length);
      var top = list[0];
      [["Fraktion", "Allianz"], ["Mitglieder", String(list.length)], ["Gildenmeister", master ? master.name : "–"], ["Höchstes Level", top.name + " (" + top.level + ")"], ["Ø Level", String(avg)], ["Gegründet", "2026"]].forEach(function (p) {
        var d = el("div"); d.appendChild(el("dt", null, p[0])); d.appendChild(el("dd", null, p[1])); facts.appendChild(d);
      });
    }
    var cl = document.getElementById("gilden-klassen");
    if (cl) {
      var counts = {};
      list.forEach(function (x) { if (x.klass) counts[x.klass] = (counts[x.klass] || 0) + 1; });
      var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }).concat([1]));
      Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).forEach(function (k) {
        var r = el("div", "gc-row"); r.appendChild(el("span", "gc-name", k));
        var bar = el("span", "gc-bar"); var fill = el("i"); fill.style.width = (counts[k] / max * 100) + "%"; fill.style.background = COLORS[k] || "#d9a441"; bar.appendChild(fill); r.appendChild(bar);
        r.appendChild(el("span", "gc-num", String(counts[k]))); cl.appendChild(r);
      });
    }
    var stand = document.getElementById("armory-stand");
    if (stand && data.updated) { var p = data.updated.split("-"); stand.textContent = "Daten aus dem Armory, Stand " + p[2] + "." + p[1] + "." + p[0]; }
    var c = document.querySelector(".group-count strong"); if (c) c.textContent = list.length;
  }).catch(function () { grid.textContent = "Mitgliederliste konnte nicht geladen werden."; });
})();
