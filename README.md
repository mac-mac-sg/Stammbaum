# Stammbaum Villiger

Smartphone-first Stammbaum-App auf Basis der Familienunterlagen «Nachkommen von Sebastian Villiger».

> **Hinweis zur Veröffentlichung:** Die App wird bewusst öffentlich über GitHub Pages bereitgestellt. Der Schutzmodus ist eine Darstellungsfunktion und **keine Zugriffskontrolle**. Die im Frontend-Bundle enthaltenen genealogischen Ausgangsdaten können technisch öffentlich abgerufen werden.

## Aktueller Funktionsumfang

- 104 nummerierte Personen aus den Scans plus eigenständige Partnerpersonen
- Eltern-Kind- und Paarbeziehungen über fünf Generationen
- Smartphone-Startseite mit Favoriten und Verlauf
- Familienfokus für personenorientierte Navigation
- vollständiger, zoombarer Gesamtbaum mit Paar-Karten
- Vollbildsuche auf kleinen Smartphones
- Verwandtschafts-Finder über Abstammungs- und Partnerschaftsverbindungen
- Detailansichten mit Lebensdaten, Beziehungen und Quellenhinweisen
- standardmässig aktiver Schutzmodus für potenziell lebende Personen
- expliziter Lebensstatus (`living`, `deceased`, `unknown`) als lokale Korrektur
- nicht-destruktiver Editiermodus für Personen und Partnerpersonen
- Export und Import lokaler Korrekturen als JSON
- PWA-Manifest, Service Worker und Homescreen-Installation
- automatische Datenvalidierung und Produktions-Build in GitHub Actions
- automatische Veröffentlichung über GitHub Pages nach Änderungen auf `main`

## Öffentliche App

Nach aktiviertem GitHub-Pages-Deployment ist die App unter folgendem Projektpfad vorgesehen:

```text
https://mac-mac-sg.github.io/Stammbaum/
```

Der Vite-Build verwendet dafür fest den Basispfad `/Stammbaum/`. Manifest, App-Icon und Service Worker verwenden Pages-kompatible Pfade.

## Veröffentlichung

Der Ablauf entspricht der Essens-Check-App:

```text
Feature Branch / Pull Request
        ↓
Datenprüfung + Produktions-Build
        ↓
Merge nach main
        ↓
GitHub Pages
        ↓
https://mac-mac-sg.github.io/Stammbaum/
```

Der Workflow `.github/workflows/deploy.yml` veröffentlicht ausschliesslich bei einem Push auf `main`. Pull Requests führen nur die Prüfungen und den Build aus.

## Entwicklung

```bash
npm install
npm run dev
```

Datenprüfung:

```bash
npm run validate:data
```

Produktions-Build:

```bash
npm run build
```

## Datenmodell

Die ursprünglichen Scans nummerieren Sebastian Villiger und seine dokumentierten Nachkommen. Partnerinnen und Partner werden zusätzlich als eigenständige Knoten mit stabilen IDs nach dem Muster `partner:p095:1` in den Familiengraph eingebunden. Unbekannte Eltern oder Vorfahren von Partnerpersonen werden nicht ergänzt, solange dafür keine Quelle vorhanden ist.

## Datenschutzmodus

Die öffentliche Bereitstellung wurde bewusst gewählt. Der Schutzmodus bleibt trotzdem standardmässig aktiv, damit potenziell lebende Personen in der normalen Bedienoberfläche nicht unnötig mit Lebensdaten dargestellt werden. Er verhindert jedoch nicht den technischen Zugriff auf die bereits öffentlich ausgelieferten Frontend-Dateien.

Lokale Korrekturen, Favoriten und Verlauf bleiben im Browser des jeweiligen Geräts gespeichert. Korrekturexporte können personenbezogene Daten enthalten und sollten entsprechend behandelt werden. Details stehen in `docs/PRIVACY.md`.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept steht in `docs/MOBILE_UX.md`, die Normalisierung der Partnerdaten in `docs/PARTNER_GRAPH.md` und die Offline-/PWA-Logik in `docs/PWA.md`.

## Nächste Schritte

1. GitHub Pages für das Repository aktivieren und die Erstveröffentlichung durchführen
2. Smartphone/PWA unter der Pages-URL testen
3. fachliche Verifikation schwer lesbarer Scanstellen
4. Freigabeprozess für bestätigte lokale Korrekturen in den zentralen Datensatz
5. zusätzliche Familienquellen sowie später optional Fotos und Dokumente

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
