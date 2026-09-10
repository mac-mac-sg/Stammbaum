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
- **expliziter Lebensstatus** (`living`, `deceased`, `unknown`) als lokale fachliche Korrektur
- **nicht-destruktiver Editiermodus** für Lebensdaten, Orte und Zusatznotizen
- lokale Korrekturen wirken sofort in Baum, Fokus, Suche und Datenschutzlogik
- Bottom-Sheet- und Vollbild-Interaktionen auf kleinen Displays
- responsive Gestaltung inklusive Dark Mode
- Web-App-Manifest, Homescreen-Metadaten und kontrollierter Service Worker
- automatische Datenvalidierung plus Produktions-Build in GitHub Actions CI

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

## Datenschutz

Das Repository und der Prototyp sind bewusst privat. Zusätzlich startet die Oberfläche standardmässig im Schutzmodus. Für Personen kann in der privaten Vollansicht ein expliziter Lebensstatus gesetzt werden. Solange dieser auf `unknown` steht, greift weiterhin die konservative 120-Jahre-Heuristik.

Lokale Korrekturen werden nur im Browser des jeweiligen Geräts gespeichert. Sie überschreiben weder die Scanquelle noch die im Repository erfassten Ausgangsdaten. Details stehen in `docs/PRIVACY.md`.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept ist in `docs/MOBILE_UX.md` beschrieben.

Der Verwandtschafts-Finder berechnet Beziehungen nur über die strukturierten Eltern-Kind-Verknüpfungen des erfassten Nachkommenbaums. Ehe- und Lebenspartner sind derzeit Zusatzdaten und nicht als eigene Knoten im Beziehungsgraphen verknüpft.

## Nächste Schritte

1. Export/Import und fachliche Freigabe lokaler Korrekturen
2. weitere fachliche Verifikation schwer lesbarer Scanstellen
3. strukturierte Pflege von Partnern und zusätzlichen Beziehungen
4. Festlegung eines privaten/authentifizierten Deployment-Ziels

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
