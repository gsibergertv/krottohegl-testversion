#!/usr/bin/env python3
"""Erstellt den Wochenprotokoll-Eintrag: vergleicht site/members.json mit dem Stand der Vorwoche."""
import json, re, sys, time, datetime
from pathlib import Path

SITE = Path(__file__).parent / "site"
SNAP = SITE / "weekly-snapshot.json"
LOG = SITE / "wochenprotokoll.json"
MIN_LEVEL = 20

def profs(s):
    return {m.group(1).strip(): int(m.group(2)) for m in re.finditer(r"([^/\d]+?)\s+(\d+)", s or "")}

def main(since=None):
    old_path = Path(since) if since else SNAP
    old = {m["name"]: m for m in json.loads(old_path.read_text(encoding="utf-8"))["members"]}
    cur = json.loads((SITE / "members.json").read_text(encoding="utf-8"))
    rows = []
    for m in cur["members"]:
        if m.get("level", 0) < MIN_LEVEL: continue
        o = old.get(m["name"])
        if not o: rows.append({"name": m["name"], "klass": m.get("klass"), "new": True, "level": [None, m["level"]], "notes": ["Neu in der Gilde"]}); continue
        r = {"name": m["name"], "klass": m.get("klass"), "notes": []}
        if m.get("level") != o.get("level"): r["level"] = [o.get("level"), m.get("level")]
        if m.get("ilvl") and o.get("ilvl") and m["ilvl"] != o["ilvl"]: r["ilvl"] = [o["ilvl"], m["ilvl"]]
        po, pn = profs(o.get("profession")), profs(m.get("profession"))
        pd = [[k, po.get(k), v] for k, v in pn.items() if po.get(k) != v]
        if pd: r["professions"] = pd
        if m.get("spec") and o.get("spec") and m.get("spec") != o.get("spec"): r["spec"] = m["spec"]
        if len(r) > 3 or r["notes"]: rows.append(r)
    rows.sort(key=lambda r: -((r.get("level") or [0, 0])[1] - ((r.get("level") or [0, 0])[0] or 0)))
    today = datetime.date.today()
    start = (old_path.stat().st_mtime and json.loads(old_path.read_text(encoding="utf-8")).get("updated")) or ""
    entry = {"date": today.isoformat(), "from": start, "to": cur.get("updated", today.isoformat()), "changes": rows}
    log = json.loads(LOG.read_text(encoding="utf-8")) if LOG.exists() else {"weeks": []}
    log["weeks"] = [w for w in log["weeks"] if w["date"] != entry["date"]]
    log["weeks"].insert(0, entry)
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SNAP.write_text(json.dumps(cur, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for r in rows: print(r)
    print(f"{len(rows)} Charaktere mit Fortschritt.")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
