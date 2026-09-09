# Stammbaum Villiger

Private, smartphone-first Stammbaum-App auf Basis der bereitgestellten Familienunterlagen «Nachkommen von Sebastian Villiger».

## Aktueller Funktionsumfang

- 104 nummerierte Personen aus den Scans
- Eltern-Kind-Verknüpfungen über fünf Generationen
- dokumentierte Ehe-, Partner- und Verlobungsbeziehungen
- **Familienfokus** als Standardansicht auf Smartphones
- Elternlinie, Geschwister und Kinder als touch-freundliche Karten
- vollständiger, zoombarer Stammbaum als alternative Gesamtansicht
- Suche nach Name, Ort, Jahr und Partnername
- Personendetails mit Lebensdaten, Beziehungen, Kindern, Abstammungslinie und Quellenhinweisen
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

Das Repository und der Prototyp sind bewusst privat. Die Daten enthalten Angaben zu möglicherweise noch lebenden Personen. Eine öffentliche Bereitstellung ist erst sinnvoll, wenn ein Datenschutzmodus für lebende Personen umgesetzt ist.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept ist in `docs/MOBILE_UX.md` beschrieben.

## Nächste Schritte

1. Verwandtschafts-Finder zwischen zwei Personen
2. Datenschutzmodus für lebende Personen
3. weitere fachliche Verifikation schwer lesbarer Scanstellen
4. optionaler Deployment-/Installationspfad als PWA

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
