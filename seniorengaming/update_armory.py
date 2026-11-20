#!/usr/bin/env python3
"""Aktualisiert site/members.json aus dem WoW-Forever-Armory (Level, Itemlevel, Rasse, Klasse, Berufe, Bild)."""
import json, sys, time, urllib.request
from pathlib import Path

BASE = "https://worldofwarcraft.blizzard.com/de-de/forever/eu/armory/character/"
MARK = "var characterProfileInitialState = "
PROF = {"Alchemy": "Alchemie", "Blacksmithing": "Schmiedekunst", "Enchanting": "Verzauberkunst",
        "Engineering": "Ingenieurskunst", "Herbalism": "Kräuterkunde", "Leatherworking": "Lederverarbeitung",
        "Mining": "Bergbau", "Skinning": "Kürschnerei", "Tailoring": "Schneiderei",
        "Jewelcrafting": "Juwelierskunst", "Inscription": "Inschriftenkunde"}
CLASS_DE = {"Magierin": "Magier", "Priesterin": "Priester", "Kriegerin": "Krieger", "Schurkin": "Schurke",
            "Jägerin": "Jäger", "Druidin": "Druide", "Schamanin": "Schamane", "Hexenmeisterin": "Hexenmeister"}

def slug(name): return name.lower().replace(" ", "-")

def fetch(name):
    req = urllib.request.Request(BASE + urllib.request.quote(slug(name)), headers={"User-Agent": "Mozilla/5.0"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    i = html.index(MARK) + len(MARK)
    return json.JSONDecoder().raw_decode(html[i:])[0]["character"]

def main(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    changes = []
    for m in data["members"]:
        try:
            c = fetch(m["name"])
        except Exception as e:
            print(f"! {m['name']}: nicht abrufbar ({e})"); continue
        new = {"level": c.get("level"), "ilvl": c.get("averageItemLevel"),
               "race": (c.get("race") or {}).get("name"),
               "klass": CLASS_DE.get((c.get("class") or {}).get("name"), (c.get("class") or {}).get("name"))}
        profs = []
        for p in (c.get("professions") or {}).get("primaries", []):
            t = (p.get("tiers") or [{}])[0]
            profs.append(f"{PROF.get(p.get('name'), p.get('name'))} {t.get('skillPoints', '')}".strip())
        if profs: new["profession"] = " / ".join(profs)
        img = ((c.get("media") or {}).get("main-raw") or {}).get("url")
        if img: new["render"] = img
        upd = (c.get("lastUpdatedTimestamp") or {}).get("iso8601")
        if upd: new["armoryUpdated"] = upd
        for k, v in new.items():
            if v in (None, ""): continue
            if m.get(k) != v:
                if k not in ("render", "armoryUpdated"): changes.append(f"{m['name']}: {k} {m.get(k)} -> {v}")
                m[k] = v
        time.sleep(1)
    data["updated"] = time.strftime("%Y-%m-%d")
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("\n".join(changes) if changes else "Keine Änderungen.")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(Path(__file__).parent / "site" / "members.json"))
