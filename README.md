# Stammbaum Villiger

Private, smartphone-first Stammbaum-App auf Basis der bereitgestellten Familienunterlagen «Nachkommen von Sebastian Villiger».

## Aktueller Funktionsumfang

- 104 nummerierte Personen aus den Scans (Sebastian Villiger plus die dokumentierten Nachkommen)
- zusätzlich **eigenständige Partnerpersonen** mit stabilen IDs im Familiengraph
- Eltern-Kind-Verknüpfungen über fünf Generationen
- dokumentierte Ehe-, Partner- und Verlobungsbeziehungen als strukturierte Paarverbindungen
- **eigene Smartphone-Startseite** als mobiler Einstieg in die App
- aktueller Familienfokus, Suche, Gesamtbaum, Datenschutz und lokale Korrekturdaten direkt von der Startseite erreichbar
- **Favoriten** für nummerierte Personen und Partnerpersonen, lokal auf dem Gerät gespeichert
- **Zuletzt angesehen** mit lokalem Verlauf und direktem Wiedereinstieg
- **Familienfokus** für die personenorientierte Navigation auf kleinen Displays
- Elternlinie, Partnerpersonen, Geschwister und Kinder als touch-freundliche Karten
- Partnerpersonen mit eigener Detailansicht und eigener Datenschutzbehandlung
- vollständiger, zoombarer Stammbaum als alternative Gesamtansicht
- im Gesamtbaum werden nummerierte Person und Partnerperson als **verbundene Paar-Karten nebeneinander** dargestellt; Kinder liegen darunter auf der gemeinsamen Familienachse
- kompakte Suche sowie **Vollbildsuche auf kleinen Smartphones**; Partnerpersonen sind dort ebenfalls auffindbar
- **Verwandtschafts-Finder** über Abstammungs- und Partnerschaftsverbindungen inklusive Verbindungspfad
- Personendetails mit Lebensdaten, Beziehungen, Kindern, Abstammungslinie und Quellenhinweisen
- **Schutzmodus für potenziell lebende Personen**, standardmässig aktiv und lokal gespeichert
- **expliziter Lebensstatus** (`living`, `deceased`, `unknown`) als lokale fachliche Korrektur für nummerierte Personen und Partnerpersonen
- **nicht-destruktiver Editiermodus** für Lebensdaten, Orte und Zusatznotizen
- Partnerpersonen können zusätzlich in **Beziehungstyp und Beziehungsstatus** korrigiert werden
- lokale Korrekturen wirken sofort in Baum, Fokus, Suche, Verwandtschafts-Finder und Datenschutzlogik
- **Export und Import lokaler Korrekturen als JSON**, inklusive Partnerkorrekturen und Abwärtskompatibilität zu Version 1
- Bottom-Sheet- und Vollbild-Interaktionen auf kleinen Displays
- vierteilige mobile Bottom Navigation für **Start**, **Familie**, **Suchen** und **Person**
- responsive Gestaltung inklusive Dark Mode
- Web-App-Manifest, Homescreen-Metadaten und kontrollierter Service Worker
- Installationshinweis auf unterstützten Smartphones nach einem sicheren HTTPS-Deployment
- fail-closed **Docker/Caddy-Deployment** mit serverseitiger Basic Authentication und Sicherheitsheadern
- **automatisches privates Deployment nach jedem Push auf `main`**, analog zum Veröffentlichungsprinzip der Essens-Check-App
- automatische Datenvalidierung, Produktions-Build, Container-Build und Authentifizierungs-Smoke-Test in GitHub Actions CI

## Datenmodell

Die ursprünglichen Scans nummerieren Sebastian Villiger und seine dokumentierten Nachkommen. Partnerinnen und Partner wurden deshalb zunächst als Zusatzfelder der jeweiligen Person erfasst. Die App erzeugt daraus einen normalisierten Familiengraph:

- nummerierte Personen behalten ihre IDs `p001` bis `p104`,
- jede dokumentierte Partnerbeziehung erzeugt eine stabile Partner-ID nach dem Muster `partner:p095:1`,
- Partnerpersonen erhalten Name, Lebensdaten, Quelle und Beziehungstyp aus dem vorhandenen Datensatz,
- Paarverbindungen werden als eigene Relationen modelliert,
- unbekannte Eltern oder Vorfahren von Partnerpersonen werden **nicht** ergänzt.

Damit können Partnerpersonen in Suche, Familienfokus, Gesamtbaum, Favoriten, Verlauf und Verwandtschafts-Finder als eigene Personen behandelt werden, ohne unbelegte Abstammungsinformationen zu erfinden.

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

Privaten Container bauen:

```bash
docker build -t stammbaum-villiger .
```

## Privates Deployment

Der normale Ablauf entspricht jetzt funktional der Essens-Check-App:

```text
Pull Request → CI → Merge nach main → automatisches Deployment
```

Statt GitHub Pages wird der geprüfte Container per SSH auf einen privaten Linux-Server übertragen. Caddy übernimmt dort HTTPS und schützt sämtliche App-Dateien mit serverseitiger Authentifizierung. Der Deployment-Workflow prüft nach der Veröffentlichung automatisch, dass anonymer Zugriff abgewiesen und authentifizierter Zugriff akzeptiert wird.

Für die einmalige Inbetriebnahme werden ein kleiner Docker-fähiger Server, ein Domainname sowie sieben GitHub-Secrets benötigt. Danach genügt ein Merge auf `main`, um eine neue Version automatisch bereitzustellen. Die genaue Einrichtung steht in `docs/DEPLOYMENT.md`.

## Datenschutz

Das Repository und der Prototyp sind bewusst privat. Zusätzlich startet die Oberfläche standardmässig im Schutzmodus. Für nummerierte Personen und Partnerpersonen kann in der privaten Vollansicht ein expliziter Lebensstatus gesetzt werden. Solange dieser auf `unknown` steht, greift die konservative 120-Jahre-Heuristik.

Lokale Korrekturen werden nur im Browser des jeweiligen Geräts gespeichert. Sie überschreiben weder die Scanquelle noch die im Repository erfassten Ausgangsdaten. Für Sicherung oder Gerätewechsel können Personen- und Partnerkorrekturen gemeinsam als JSON exportiert und wieder importiert werden. Exportdateien können personenbezogene Daten enthalten und sind entsprechend privat zu behandeln. Details stehen in `docs/PRIVACY.md`.

Favoriten und Verlauf werden ebenfalls nur lokal im Browser gespeichert. Dabei werden stabile interne Personen-IDs, nicht zusätzliche Kopien der Lebensdaten, persistiert.

Ein öffentliches statisches Deployment ist ausdrücklich nicht vorgesehen. Der Produktionscontainer startet nur mit gesetzten Zugangsdaten; die App-Dateien selbst liegen hinter der serverseitigen Authentifizierung.

## Datenqualität

Unklare oder unvollständige Angaben aus den Scans werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert. Das Smartphone-Bedienkonzept ist in `docs/MOBILE_UX.md` beschrieben; die Normalisierung von Partnerdaten in `docs/PARTNER_GRAPH.md`.

Der Verwandtschafts-Finder unterscheidet zwischen Blutsverwandtschaft und Verbindungen über Ehe/Partnerschaft. Bei Partnerpersonen wird nur die belegte Paarverbindung in den Graph aufgenommen. Eine Abstammung auf der Partnerseite wird erst ergänzt, wenn dafür eine Quelle vorhanden ist.

## Nächste Schritte

1. einmalig privaten Server, Domain/DNS und GitHub-Production-Secrets einrichten
2. erstes automatisches HTTPS-Deployment ausführen und auf Smartphone testen
3. fachliche Verifikation schwer lesbarer Scanstellen
4. Freigabeprozess für bestätigte lokale Korrekturen in den zentralen Datensatz
5. zusätzliche Familienquellen sowie später optional Fotos und Dokumente

## Branch

Die laufende Erstentwicklung findet im Branch `initial-app` und in Pull Request #1 statt.
