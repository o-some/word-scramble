# Projekt
Word Scramble – Tula’s Island

# Zweck
Mehrsprachiges Word-Scramble-Minispiel für Tula’s Island mit Mobile-first UI, Muschel-Belohnungen und Bosskämpfen.

# Aktuelle Version
v1.0.0-migrated-candidate

# Letzte getestete Commit-SHA
`d9d5be5d645a82cfcde4bbfeb623eedaf9617d65` – Standalone-Runtime nach automatischer Assembly geprüft.

# Framework
Übergangsstruktur: Standalone HTML/CSS/JavaScript. Erst stabile Trennung, danach optional Astro-Refactoring.

# Plattformen
- iOS Safari
- Android Chrome
- Desktop Chrome/Safari

# Designregeln
Deep-Navy/Türkis, Gold/Creme, Tula’s-Island Adventure-/Anime-Stil, Mobile-first, keine Layout-Sprünge durch Feedback.

# Aktueller Funktionsstand
- Word Scramble DE→EN
- Schwierigkeitsumschaltung
- Punkte, Combo, Leben, Muscheln
- Tipp-Funktion
- Bossfight nach 10 normalen Wörtern
- 10 Boss-Level mit eigenen Sprites
- Boss-HP / Bossrunden
- Tula-Reaktionen
- Boss-Reaktionen: Treffer = verärgert/getroffen; Spielerfehler = freut/lacht
- Pause / Spiel beenden
- `[object Object]`-Slotfehler behoben: Slots rendern ausschließlich `selected.letter`
- Eigenständige `index.html` ohne iframe-Wrapper

# Bekannte Fehler / Migrationsstatus
- Die sichtbare Runtime-Reparatur ist im Ziel-Repo umgesetzt.
- Alle 10 Boss-Sprites liegen im Ziel-Repo unter `assets/bosses/`.
- Tula- und einige Hintergrundassets werden als Übergang noch von der bestehenden Tula’s-Island-Pages-URL geladen. Daher ist die vollständige Asset-Entkopplung noch nicht freigegeben.
- Physischer iPhone-/Android-Endtest der neuesten Runtime ist noch ausstehend.
- Bis alle Freigabeprüfungen bestanden sind, bleibt die alte Kopie in `o-some/tulasisland` erhalten.

# Nächste Schritte
1. Neuesten GitHub-Pages-Deploy auf physischem iPhone prüfen.
2. Android Chrome prüfen.
3. Live-Asset-/404-Prüfung vervollständigen.
4. Gameplay inkl. Bosswechsel/Sieg/Niederlage vollständig prüfen.
5. Gemeinsame Tula-/Background-Assets in das Ziel-Repo lokalisieren.
6. Danach Removal-Gate erneut bewerten.

# Wichtige Dateien
- `index.html`
- `.github/workflows/pages.yml`
- `.github/workflows/finalize-runtime.yml`
- `MIGRATION_SOURCE.txt`
- `docs/MIGRATION_RECORD.md`
- `docs/ASSET_MANIFEST.md`
- `docs/TEST_CHECKLIST.md`

# Do-not-touch-Bereiche
Andere Spiele-Repositories und andere Spiele in `o-some/tulasisland` nicht verändern.

# Assets
Master-Assets: Dropbox. Runtime-Bossassets: dieses Ziel-Repo. Gemeinsame Tula-/Background-Assets sind bis zur finalen Entkopplung als Übergangsabhängigkeit dokumentiert.

# Deployment
https://o-some.github.io/word-scramble/

Workflow: `.github/workflows/pages.yml`

# Letzter erfolgreicher Test
20.08.2026 – Repository-/Runtime-Prüfung:
- Standalone `index.html` vorhanden
- kein iframe
- Slotrenderer verwendet `sel.letter`
- Antwortprüfung verwendet `state.selected.map(x=>x.letter)`
- 10 Boss-Dateien im Ziel-Repo vorhanden
- Bossnamen und Spritepfade Level 1–10 in der Runtime verdrahtet

Physische Gerätefreigabe: noch ausstehend.

# Wichtige Regeln
- Keine funktionierende Funktion ohne Anweisung entfernen.
- Vor jedem Write aktuellen `main` neu lesen.
- Kein Force-Push.
- Mobile immer mitprüfen.
- Vor großen Änderungen Sicherungs-/Rollback-Punkt setzen.
- Nichts aus `tulasisland` löschen, solange das Freigabe-Gate nicht vollständig bestanden ist.
