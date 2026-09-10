# Mobile UX

Die App wird smartphone-first weiterentwickelt. Die Desktop-Ansicht bleibt erhalten, ist aber nicht das primäre Interaktionsmodell.

## Leitprinzip

Die App-Führung ist auf drei Kernaufgaben reduziert:

1. **Start** – schnell wieder einsteigen.
2. **Suche** – jede erfasste Person direkt finden.
3. **Familie** – im Familienkontext navigieren und bei Bedarf den Gesamtbaum öffnen.

Administrative Funktionen wie Darstellung, Schutzmodus, Installation sowie Export/Import lokaler Korrekturen liegen im Zahnrad-Menü und konkurrieren nicht mit der täglichen Navigation.

## Bottom Navigation

Die Bottom Navigation besitzt auf Smartphones drei feste Ziele:

- **Start**
- **Suche**
- **Familie**

Der frühere separate Punkt **Person** wurde entfernt, weil die aktuell fokussierte Person bereits direkt über ihre Karte geöffnet werden kann. Damit gibt es nur noch einen klaren Weg zu den Personendetails.

Die zusätzliche Suchleiste oberhalb des Familienbereichs wird auf Smartphones ausgeblendet. Die Suche hat mobil genau einen festen Einstieg über **Suche**. Auf Desktop bleibt die kompakte Suchleiste erhalten.

## Startseite

Die Startseite ist bewusst kurz. Sie zeigt in dieser Reihenfolge:

1. einen grossen Sucheinstieg,
2. **Weiter bei** mit dem zuletzt verwendeten Familienfokus,
3. Favoriten,
4. zuletzt angesehene Personen.

Der zuletzt verwendete Familienfokus wird lokal als stabile Personen-ID gespeichert. Beim allerersten Start dient `p095` weiterhin als Fallback.

Favoriten und Verlauf werden ebenfalls lokal im Browser gespeichert. Persistiert werden nur stabile interne IDs; Lebensdaten werden für diese Navigationsfunktionen nicht zusätzlich dupliziert. Der Verlauf ist auf zwölf Einträge begrenzt und kann auf der Startseite geleert werden.

## Suche

Die Suchlogik ist für Desktop, Smartphone und Verwandtschafts-Finder vereinheitlicht. Sie durchsucht nummerierte Personen und eigenständige Partnerpersonen.

Ein Treffer auf eine nummerierte Person öffnet deren Familienkontext. Ein Treffer auf eine Partnerperson öffnet **direkt die Partnerdetailansicht** und zeigt im Hintergrund den zugehörigen Familienkontext. Damit entspricht das Ziel der Suche immer dem angezeigten Treffer.

Im Schutzmodus wird bei potenziell lebenden Personen nur der Name durchsucht; Lebensdaten und Orte werden nicht als Suchkriterien verwendet.

## Familienfokus

Der Fokusmodus löst das zentrale Darstellungsproblem eines grossen Stammbaums auf kleinen Screens: Statt alle Äste gleichzeitig zu verkleinern, wird die Navigation personenorientiert.

Der Familienfokus zeigt:

- Elternlinie,
- ausgewählte Person,
- Partnerpersonen,
- Geschwister,
- Kinder.

Ein Tipp auf die ausgewählte Personenkarte öffnet direkt die Personendetails. Der separate, redundante Button **Personendetails** wurde entfernt. Der Verwandtschafts-Finder bleibt als eigenständige Aktion erhalten.

Partnerkarten öffnen die jeweilige Partnerdetailansicht. Beziehungskarten innerhalb der Personendetails sind ebenfalls direkt antippbar und führen zur gleichen Partnerdetailansicht.

## Gesamtbaum

Innerhalb des Familienbereichs kann zwischen **Familie** und **Gesamtbaum** gewechselt werden. Der Gesamtbaum bleibt für Orientierung und Überblick verfügbar, ist aber kein eigener Hauptnavigationspunkt.

In der Gesamtansicht werden Partnerinnen und Partner als eigene Karten direkt neben der nummerierten Person dargestellt. Eine Paarlinie verbindet die Karten; der Kinderast setzt unter der gemeinsamen Familienachse an. Verschieben erfolgt per Drag, Zoomen per Pinch-Geste oder über die Zoom-Schaltflächen.

## Verwandtschafts-Finder

Vom Familienfokus aus kann für die aktuell gewählte Person eine zweite erfasste Person gesucht werden. Die Suche umfasst auch Partnerpersonen und verwendet dieselbe Suchlogik wie die übrige App.

Der Finder unterscheidet Blutsverwandtschaft, direkte Paarbeziehungen und gemischte Verbindungen. Falls keine Verbindung berechnet werden kann, steht unmittelbar **Andere Person vergleichen** zur Verfügung; die Nutzerführung endet nicht mehr in einer Sackgasse.

## Einstellungen

Das Zahnrad-Menü bündelt Funktionen, die nicht zur täglichen Familiennavigation gehören:

- Hell-/Dunkelmodus,
- Schutzmodus/Vollansicht,
- transparente Erklärung, dass der Schutzmodus nur die Darstellung verändert und keine Zugriffskontrolle für die öffentliche GitHub-Pages-App ist,
- Export/Import lokaler Korrekturen,
- PWA-/Homescreen-Installation, sofern vom Browser unterstützt.

## Quellen und Herkunft

Scanbasierte Partnerangaben und nachträglich ergänztes Familienwissen werden unterschieden. Eine Familienangabe kann ein Quellenlabel und ein Ergänzungsdatum tragen. Die Partnerdetailansicht behauptet dadurch nicht mehr pauschal, jede Partnerangabe stamme aus der ursprünglichen Scanseite.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color, Standalone-Metadaten und Service Worker sind für GitHub Pages vorbereitet. Der Service Worker erhält bei jedem neuen Produktions-Build automatisch einen Build-Schlüssel aus dem gehashten JavaScript-Einstiegspunkt. Dadurch werden veraltete App-Caches ohne manuelles Versionshochzählen abgelöst.

`env(safe-area-inset-*)` berücksichtigt Geräte mit Notch oder Gestenleiste. `100dvh` vermeidet Höhenprobleme mit ein- und ausgeblendeter Browser-Chrome.
