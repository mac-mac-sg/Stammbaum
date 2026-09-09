# Stammbaum Villiger

Private, smartphone-first Stammbaum-App auf Basis der bereitgestellten Familienunterlagen «Nachkommen von Sebastian Villiger».

## Aktueller Funktionsumfang

- 104 nummerierte Personen aus den Scans
- Eltern-Kind-Verknüpfungen über fünf Generationen
- dokumentierte Ehe-, Partner- und Verlobungsbeziehungen
- **Familienfokus** als Standardansicht auf Smartphones
- Elternlinie, Geschwister und Kinder als touch-freundliche Karten
- vollständiger, zoombarer Stammbaum als alternative Gesamtansicht
- kompakte Suche sowie **Vollbildsuche auf kleinen Smartphones**
- **Verwandtschafts-Finder** zwischen zwei erfassten Personen inklusive Verbindungspfad und gemeinsamer Bezugsperson
- Personendetails mit Lebensdaten, Beziehungen, Kindern, Abstammungslinie und Quellenhinweisen
- **Schutzmodus für potenziell lebende Personen**, standardmässig aktiv und lokal gespeichert
- Bottom-Sheet-Details auf kleinen Displays
- responsive Gestaltung inklusive Dark Mode
- Web-App-Manifest und Homescreen-Metadaten
- GitHub Actions CI für den Produktions-Build

## Entwicklung

```bash
npm install
npm run dev
```

Produktions-Build:

```bash
npm run build
```

## Datenschutz

Das Repository und der Prototyp sind bewusst privat. Zusätzlich startet die Oberfläche standardmässig im Schutzmodus. Für Datensätze ohne erfasstes Sterbedatum werden Lebensdaten verborgen, wenn das Geburtsjahr höchstens 120 Jahre zurückliegt; bei vollständig fehlendem Geburtsdatum wird vorsichtshalber ebenfalls geschützt. Die private Vollansicht kann bewusst zugeschaltet werden.

Diese Heuristik ist eine Schutzmassnahme, aber kein Ersatz für einen fachlich gepflegten Lebensstatus pro Person. Namen und genealogische Beziehungen bleiben im Schutzmodus sichtbar.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept inklusive Datenschutzlogik ist in `docs/MOBILE_UX.md` beschrieben.

Der Verwandtschafts-Finder berechnet Beziehungen nur über die strukturierten Eltern-Kind-Verknüpfungen des erfassten Nachkommenbaums. Ehe- und Lebenspartner sind derzeit Zusatzdaten und nicht als eigene Knoten im Beziehungsgraphen verknüpft.

## Nächste Schritte

1. fachliche Kennzeichnung des Lebensstatus statt ausschliesslicher Heuristik
2. weitere fachliche Verifikation schwer lesbarer Scanstellen
3. optionaler Editiermodus für Ergänzungen und Korrekturen
4. optionaler Deployment-/Installationspfad als PWA mit kontrolliertem Service Worker

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
