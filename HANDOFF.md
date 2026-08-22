# Projekt
Word Scramble – Tula’s Island

# Zweck
Mehrsprachiges Word-Scramble-Minispiel für Tula’s Island mit Mobile-first UI, Muschel-Belohnungen, Wort-Wertigkeiten und Bosskämpfen.

# Aktuelle Runtime-Architektur
- Produktions-Entrypoint: `index.html` im Repository `o-some/word-scramble`.
- Autoritative Basis-State-Machine: `runtime/base.html` im selben Repository.
- Keine Abhängigkeit mehr von `o-some/tulasisland/word-scramble-preview/` als Gameplay-Runtime.
- Gemeinsame Tula-/Background-Assets dürfen übergangsweise weiterhin aus Tula’s Island geladen werden; sie besitzen keine Gameplay-State-Ownership.
- Erweiterungen werden deterministisch über die lokale Patch-Pipeline geladen.

# Autoritative Gameplay-Regeln
- normaler Modus: DE → EN Word Scramble
- Bossübergang nach 3 abgeschlossenen normalen Runden im aktuellen Test-/Preview-Tuning
- der Normal→Boss-Übergang wird ausschließlich von `runtime/base.html` entschieden
- Bosskämpfe verwenden vollständige Übersetzungssätze
- 10 Boss-Level mit eigenen Mechaniken und Sprites
- Wort-Wertigkeiten: Standard, Bronze, Silber, Gold, Episch
- Bosskampagne / Sterne / Hilfen / Loot / Tula-Reaktionen bleiben aktiv

# Runtime-Verträge
Kritische Marker:
- `window.__WS_BASE_RUNTIME__`
- `window.__WS_VARIABLE_BOSS_WORDS__`
- `window.__WS_BOSS_ABILITIES_4_6__`
- `window.__WS_BOSS_ABILITIES_7_10__`
- `window.__WS_WORD_RARITIES__`
- Boss-Ability-Runtime 1–3

Ein unvollständiger kritischer Boot darf nicht still auf eine alte `PIRATE`-/Preview-Runtime zurückfallen.

# Wichtige Dateien
- `index.html` – Produktions-Shell
- `runtime/base.html` – autoritative Gameplay-State-Machine
- `assets/patches/boss-progression-core.js` – eindeutige Boss-Level-Progression
- `assets/patches/variable-boss-words.js` – Boss-Satzmodus
- `assets/patches/word-rarities.js` – Wort-Wertigkeiten
- `assets/patches/boss-abilities-1-3.js` – Runtime-Bootstrap + Bosse 1–3
- `assets/patches/boss-abilities-4-6.js`
- `assets/patches/boss-abilities-7-10.js`
- `assets/patches/boss-ux-final-regression.js`
- `tests/runtime-contract.mjs`
- `.github/workflows/runtime-contract.yml`
- `.github/workflows/pages.yml`
- `.github/workflows/finalize-runtime.yml` – nur noch Validierung, kein Rewrite des Produktions-Entrypoints

# Release-Gates
Vor Freigabe:
1. `node tests/runtime-contract.mjs` muss bestehen.
2. Fresh/Cold Start prüfen: Wort-Wertigkeit sichtbar, kein Legacy-`PIRATE`.
3. Nach 3 normalen abgeschlossenen Runden muss Bosszustand starten.
4. Boss zeigt vollständigen Satz und passende Mechanik.
5. Ability-Badge bleibt über Tile-Taps layoutstabil.
6. Boss-Info-CTA funktioniert.
7. Boss-Sieg schreitet zum nächsten Boss fort.
8. iPhone Safari, Android Chrome und Desktop prüfen, soweit technisch verfügbar.
9. GitHub-Pages-Deploy nur mit echter Run-/Live-Evidence als erfolgreich melden.

# Do-not-touch
Andere Spiele-Repositories und andere Spiele in `o-some/tulasisland` nicht verändern.

# Deployment
https://o-some.github.io/word-scramble/

Workflow: `.github/workflows/pages.yml`
