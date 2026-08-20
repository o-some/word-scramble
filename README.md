# Word Scramble

Sprachlern-Minispiel für Tula’s Island. Spieler setzen die englische Übersetzung eines deutschen Wortes aus gemischten Buchstaben zusammen. Nach jeweils 10 normalen Wörtern startet ein Bosskampf.

## Stack
- Standalone HTML/CSS/JavaScript (stabile Migrationsfassung)
- Mobile-first
- GitHub Pages

## Live
https://o-some.github.io/word-scramble/

## Repository
`o-some/word-scramble`

## Gameplay
- Deutsch → Englisch
- Schwierigkeitsstufen Leicht / Mittel / Schwer
- Punkte, Combo, Leben und Muscheln
- Tipp setzt den nächsten korrekten Buchstaben
- Bosskampf nach 10 normalen Wörtern
- 10 Boss-Level mit eigenen Sprites
- Tula- und Boss-Reaktionen bei richtig/falsch
- Pause und Spiel beenden

## Entwicklung
Die aktuelle Migrationsfassung ist bewusst als eigenständige `index.html` stabilisiert. Ein späteres Refactoring auf Astro/TypeScript darf erst erfolgen, wenn die bestehende Funktionalität vollständig abgesichert ist.

## Deployment
GitHub Pages wird über `.github/workflows/pages.yml` auf jedem Push nach `main` deployed.

## Migration
Source Repo: `o-some/tulasisland`

Dokumentierter Source Commit: `892f676fbcef77ab49373aef7865d60afba0ebb7`

Weitere Details:
- `HANDOFF.md`
- `docs/MIGRATION_RECORD.md`
- `docs/ASSET_MANIFEST.md`
- `docs/TEST_CHECKLIST.md`

## Sicherheitsregel
Die alte Word-Scramble-Kopie in `o-some/tulasisland` darf erst entfernt werden, wenn das vollständige Migrations- und Freigabe-Gate bestanden ist. Bei offenen Mobile-/Asset-/Deployment-Prüfungen bleibt sie als Rollback erhalten.
