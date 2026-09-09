# Stammbaum

Private, interaktive Stammbaum-App auf Basis der Familienunterlagen «Nachkommen von Sebastian Villiger».

## Aktueller Stand

- 104 nummerierte Personen aus den bereitgestellten Scans erfasst
- fünf Generationen mit Eltern-Kind-Verknüpfungen
- Ehe-, Partner- und Verlobungsbeziehungen als Zusatzdaten
- Suche nach Name, Ort, Jahr und Partnername
- zoombarer und verschiebbarer Stammbaum
- Detailansicht mit Lebensdaten, Familie, Abstammungslinie und Quellenhinweis
- Smartphone-optimierte Bedienung mit Pinch-Zoom, grossen Touch-Flächen und Bottom Navigation
- Personendetails auf kleinen Displays als Bottom Sheet mit antippbarem Hintergrund zum Schliessen
- Safe-Area-Unterstützung für Geräte mit Displayausschnitt bzw. Gestenleiste
- Web-App-Manifest und App-Icon für eine spätere Nutzung vom Homescreen
- responsive Desktop-/Tablet-Darstellung und Dark-Mode-Unterstützung

## Entwicklung

```bash
npm install
npm run dev
```

Produktions-Build:

```bash
npm run build
```

## Datenqualität

Die Daten wurden aus den vom Eigentümer bereitgestellten Familienunterlagen übertragen. Unsichere, unvollständige oder schwer lesbare Angaben werden nicht geraten. Bekannte Unklarheiten sind unter `docs/DATA_QUALITY.md` dokumentiert.

Die Anwendung ist derzeit als **privater Prototyp** vorgesehen. Die Unterlagen enthalten personenbezogene Daten lebender Personen und sollen nicht ungeprüft öffentlich bereitgestellt werden.

## Mobile UX

Das Smartphone-Bedienkonzept und die nächsten Ausbaustufen sind unter `docs/MOBILE_UX.md` dokumentiert.

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
