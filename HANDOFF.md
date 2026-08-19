# Projekt
Word Scramble – Tula’s Island

# Zweck
Mehrsprachiges Word-Scramble-Minispiel für Tula’s Island mit Mobile-first UI, Muschel-Belohnungen und Bosskämpfen.

# Aktuelle Version
v1.0.0-migrated-candidate

# Letzte getestete Commit-SHA
Noch nicht final – wird nach bestandenem Pages-/Gameplay-Gate eingetragen.

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
- Boss-HP / Bossrunden
- Tula-Reaktionen
- Boss-Reaktionen
- Pause / Spiel beenden

# Bekannte Fehler / Migrationsstatus
Die eigenständige Asset-Entkopplung wird noch geprüft. Bis alle Freigabeprüfungen bestanden sind, bleibt die alte Kopie in o-some/tulasisland erhalten.

# Nächste Schritte
1. Pages-Deploy prüfen.
2. HTTP 200 und Reload prüfen.
3. Asset-/404-Prüfung.
4. iPhone, Android und Desktop testen.
5. Gameplay inkl. Bosswechsel/Sieg/Niederlage prüfen.
6. Letzte getestete Commit-SHA eintragen.
7. Erst danach Removal-Gate bewerten.

# Wichtige Dateien
- index.html
- .github/workflows/pages.yml
- MIGRATION_SOURCE.txt
- docs/MIGRATION_RECORD.md
- docs/ASSET_MANIFEST.md
- docs/TEST_CHECKLIST.md

# Do-not-touch-Bereiche
Andere Spiele-Repositories und andere Spiele in o-some/tulasisland nicht verändern.

# Assets
Master-Assets: Dropbox. Runtime-Assets: Ziel-Repo bzw. derzeit noch dokumentierte Shared-Asset-Abhängigkeiten bis zur vollständigen Entkopplung.

# Deployment
https://o-some.github.io/word-scramble/
Workflow: .github/workflows/pages.yml

# Letzter erfolgreicher Test
Noch nicht final freigegeben.

# Wichtige Regeln
- Keine funktionierende Funktion ohne Anweisung entfernen.
- Vor jedem Write aktuellen main neu lesen.
- Kein Force-Push.
- Mobile immer mitprüfen.
- Vor großen Änderungen Sicherungs-/Rollback-Punkt setzen.
- Nichts aus tulasisland löschen, solange das Freigabe-Gate nicht vollständig bestanden ist.
