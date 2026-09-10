# Stammbaum Villiger

Smartphone-first Stammbaum-App auf Basis der Familienunterlagen «Nachkommen von Sebastian Villiger» und ergänzender Familienangaben.

> **Hinweis zur Veröffentlichung:** Die App wird bewusst öffentlich über GitHub Pages bereitgestellt. Der Schutzmodus ist eine Darstellungsfunktion und **keine Zugriffskontrolle**. Die im Frontend-Bundle enthaltenen genealogischen Ausgangsdaten können technisch öffentlich abgerufen werden.

## Aktueller Funktionsumfang

- 104 nummerierte Personen aus den Scans plus eigenständige Partnerpersonen
- Eltern-Kind- und Paarbeziehungen über fünf Generationen
- reduzierte Smartphone-Navigation mit **Start**, **Suche** und **Familie**
- Startseite mit Suche, letztem Familienfokus, Favoriten und Verlauf
- Familienfokus für personenorientierte Navigation
- vollständiger, zoombarer Gesamtbaum mit Paar-Karten
- einheitliche Suche nach nummerierten Personen und Partnerpersonen
- Partner-Suchergebnisse öffnen direkt die jeweilige Partnerdetailansicht
- Verwandtschafts-Finder über Abstammungs- und Partnerschaftsverbindungen
- Detailansichten mit Lebensdaten, Beziehungen und Quellenhinweisen
- direkte Navigation von Beziehungskarten in Partnerdetails
- standardmässig aktiver Schutzmodus für potenziell lebende Personen
- expliziter Lebensstatus (`living`, `deceased`, `unknown`) als lokale Korrektur
- nicht-destruktiver Editiermodus für Personen und Partnerpersonen
- Export und Import lokaler Korrekturen als JSON
- nachvollziehbare Herkunft von Scanangaben und nachträglichen Familienangaben
- PWA-Manifest, automatisch versionierter Service Worker und Homescreen-Installation
- automatische Daten-, UX- und Build-Prüfung in GitHub Actions
- automatische Veröffentlichung über GitHub Pages nach Änderungen auf `main`

## Öffentliche App

Die App ist unter folgendem Projektpfad veröffentlicht:

```text
https://mac-mac-sg.github.io/Stammbaum/
```

Der Vite-Build verwendet dafür fest den Basispfad `/Stammbaum/`. Manifest, App-Icon und Service Worker verwenden Pages-kompatible Pfade.

## Veröffentlichung

```text
Feature Branch / Pull Request
        ↓
Datenprüfung + UX-Regressionsprüfung + Produktions-Build
        ↓
Merge nach main
        ↓
GitHub Pages
        ↓
https://mac-mac-sg.github.io/Stammbaum/
```

Der Workflow `.github/workflows/deploy.yml` veröffentlicht ausschliesslich bei einem Push auf `main`. Pull Requests führen die Prüfungen und den Build aus.

## Entwicklung

```bash
npm install
npm run dev
```

Komplette Prüfung:

```bash
npm run validate
```

Einzeln stehen `npm run validate:data`, `npm run validate:ux` und `npm run build` zur Verfügung.

## Datenmodell

Die ursprünglichen Scans nummerieren Sebastian Villiger und seine dokumentierten Nachkommen. Partnerinnen und Partner werden zusätzlich als eigenständige Knoten mit stabilen IDs nach dem Muster `partner:p095:1` in den Familiengraph eingebunden. Unbekannte Eltern oder Vorfahren von Partnerpersonen werden nicht ergänzt, solange dafür keine Quelle oder Familienangabe vorhanden ist.

Partnerangaben aus den Scans übernehmen standardmässig die Scanseite der verknüpften Person als Herkunft. Nachträglich ergänzte Informationen können mit `sourceType: "family"`, einem Quellenlabel und einem Ergänzungsdatum separat gekennzeichnet werden. Damit wird Familienwissen nicht fälschlich als Scaninhalt ausgegeben.

## Datenschutzmodus

Die öffentliche Bereitstellung wurde bewusst gewählt. Der Schutzmodus bleibt trotzdem standardmässig aktiv, damit potenziell lebende Personen in der normalen Bedienoberfläche nicht unnötig mit Lebensdaten dargestellt werden. Er verhindert jedoch nicht den technischen Zugriff auf die bereits öffentlich ausgelieferten Frontend-Dateien.

Lokale Korrekturen, Favoriten, Verlauf und der zuletzt verwendete Familienfokus bleiben im Browser des jeweiligen Geräts gespeichert. Korrekturexporte können personenbezogene Daten enthalten und sollten entsprechend behandelt werden. Details stehen in `docs/PRIVACY.md`.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept steht in `docs/MOBILE_UX.md`, die Normalisierung der Partnerdaten in `docs/PARTNER_GRAPH.md` und die Offline-/PWA-Logik in `docs/PWA.md`.

## Nächste fachliche Schritte

- schwer lesbare Scanstellen mit Familienwissen oder weiteren Quellen verifizieren
- bestätigte Korrekturen kontrolliert in den zentralen Datensatz übernehmen
- weitere Familienangaben mit expliziter Herkunft ergänzen
- später optional Fotos und Dokumente pro Person hinzufügen
