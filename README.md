# Stammbaum Villiger

Private, smartphone-first Stammbaum-App auf Basis der bereitgestellten Familienunterlagen «Nachkommen von Sebastian Villiger».

## Aktueller Funktionsumfang

- 104 nummerierte Nachkommen aus den Scans
- zusätzlich **eigenständige Partnerpersonen** mit stabilen IDs im Familiengraph
- Eltern-Kind-Verknüpfungen über fünf Generationen
- dokumentierte Ehe-, Partner- und Verlobungsbeziehungen als strukturierte Paarverbindungen
- **Familienfokus** als Standardansicht auf Smartphones
- Elternlinie, Partnerpersonen, Geschwister und Kinder als touch-freundliche Karten
- Partnerpersonen mit eigener Detailansicht und eigener Datenschutzbehandlung
- vollständiger, zoombarer Stammbaum als alternative Gesamtansicht
- im Gesamtbaum werden Nachkomme und Partnerperson als **verbundene Paar-Karten nebeneinander** dargestellt; Kinder liegen darunter auf der gemeinsamen Familienachse
- kompakte Suche sowie **Vollbildsuche auf kleinen Smartphones**; Partnerpersonen sind dort ebenfalls auffindbar
- **Verwandtschafts-Finder** über Abstammungs- und Partnerschaftsverbindungen inklusive Verbindungspfad
- Personendetails mit Lebensdaten, Beziehungen, Kindern, Abstammungslinie und Quellenhinweisen
- **Schutzmodus für potenziell lebende Personen**, standardmässig aktiv und lokal gespeichert
- **expliziter Lebensstatus** (`living`, `deceased`, `unknown`) als lokale fachliche Korrektur für nummerierte Nachkommen
- **nicht-destruktiver Editiermodus** für Lebensdaten, Orte und Zusatznotizen
- lokale Korrekturen wirken sofort in Baum, Fokus, Suche und Datenschutzlogik
- **Export und Import lokaler Korrekturen als JSON**, inklusive Validierung bekannter Personen-IDs
- Bottom-Sheet- und Vollbild-Interaktionen auf kleinen Displays
- responsive Gestaltung inklusive Dark Mode
- Web-App-Manifest, Homescreen-Metadaten und kontrollierter Service Worker
- automatische Datenvalidierung inklusive Partnergraph plus Produktions-Build in GitHub Actions CI

## Datenmodell

Die ursprünglichen Scans nummerieren nur die Nachkommen von Sebastian Villiger. Partnerinnen und Partner wurden deshalb zunächst als Zusatzfelder der jeweiligen Person erfasst. Die App erzeugt daraus nun einen normalisierten Familiengraph:

- nummerierte Nachkommen behalten ihre IDs `p001` bis `p104`,
- jede dokumentierte Partnerbeziehung erzeugt eine stabile Partner-ID nach dem Muster `partner:p095:1`,
- Partnerpersonen erhalten Name, Lebensdaten, Quelle und Beziehungstyp aus dem vorhandenen Datensatz,
- Paarverbindungen werden als eigene Relationen modelliert,
- unbekannte Eltern oder Vorfahren von Partnerpersonen werden **nicht** ergänzt.

Damit können Partnerpersonen in Suche, Familienfokus, Gesamtbaum und Verwandtschafts-Finder als eigene Personen behandelt werden, ohne unbelegte Abstammungsinformationen zu erfinden.

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

Das Repository und der Prototyp sind bewusst privat. Zusätzlich startet die Oberfläche standardmässig im Schutzmodus. Für nummerierte Nachkommen kann in der privaten Vollansicht ein expliziter Lebensstatus gesetzt werden. Solange dieser auf `unknown` steht, greift weiterhin die konservative 120-Jahre-Heuristik. Partnerpersonen werden derzeit anhand ihrer vorhandenen Geburts-/Sterbedaten mit derselben konservativen Heuristik geschützt.

Lokale Korrekturen werden nur im Browser des jeweiligen Geräts gespeichert. Sie überschreiben weder die Scanquelle noch die im Repository erfassten Ausgangsdaten. Für Sicherung oder Gerätewechsel können sie als JSON exportiert und wieder importiert werden. Exportdateien können personenbezogene Daten enthalten und sind entsprechend privat zu behandeln. Details stehen in `docs/PRIVACY.md`.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept ist in `docs/MOBILE_UX.md` beschrieben.

Der Verwandtschafts-Finder unterscheidet zwischen Blutsverwandtschaft und Verbindungen über Ehe/Partnerschaft. Bei Partnerpersonen wird nur die belegte Paarverbindung in den Graph aufgenommen. Eine Abstammung auf der Partnerseite wird erst ergänzt, wenn dafür eine Quelle vorhanden ist.

## Nächste Schritte

1. strukturierte Bearbeitung von Partnerdaten und zusätzlichen Beziehungen
2. fachliche Verifikation schwer lesbarer Scanstellen
3. Freigabeprozess für bestätigte lokale Korrekturen in den zentralen Datensatz
4. privates/authentifiziertes Deployment mit installierbarer PWA
5. später optional Fotos und Dokumente pro Person

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
