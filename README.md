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
- **Verwandtschafts-Finder** zwischen zwei erfassten Personen inklusive Verbindungspfad und gemeinsamer Bezugsperson
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

Der Verwandtschafts-Finder berechnet Beziehungen nur über die strukturierten Eltern-Kind-Verknüpfungen des erfassten Nachkommenbaums. Ehe- und Lebenspartner sind derzeit Zusatzdaten und nicht als eigene Knoten im Beziehungsgraphen verknüpft.

## Nächste Schritte

1. Datenschutzmodus für lebende Personen
2. weitere fachliche Verifikation schwer lesbarer Scanstellen
3. optionale Vollbildsuche bei sehr kleinen Displays
4. optionaler Deployment-/Installationspfad als PWA

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
