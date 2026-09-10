# Mobile UX

Die App wird smartphone-first weiterentwickelt. Die Desktop-Ansicht bleibt erhalten, ist aber nicht das primäre Interaktionsmodell.

## Leitprinzip

Die App-Führung ist auf drei klare Ziele reduziert:

1. **Start** – den Stammbaum als Ganzes entdecken und persönliche Schnellzugriffe nutzen.
2. **Suche** – jede erfasste Person direkt finden.
3. **Stammbaum** – den neutralen Gesamtbaum ohne vorausgewählte Person öffnen.

Der Primärpfad lautet damit: **erst Stammbaum entdecken, dann bei Interesse eine Person vertiefen**. Der Familienfokus ist kein eigener Haupttab mehr, sondern entsteht erst aus einer konkreten Personenauswahl.

Administrative Funktionen wie Darstellung, Schutzmodus, Installation sowie Export/Import lokaler Korrekturen liegen im Zahnrad-Menü und konkurrieren nicht mit der täglichen Navigation.

## Bottom Navigation

Die Bottom Navigation besitzt auf Smartphones drei feste Ziele:

- **Start**
- **Suche**
- **Stammbaum**

Der frühere separate Punkt **Person** wurde entfernt. Auch **Familie** ist kein Hauptziel mehr: Ein Tipp auf **Stammbaum** öffnet immer die neutrale Gesamtansicht mit fünf Generationen. Erst ein Tipp auf eine Person erzeugt Personenfokus, Details oder den Familienkontext.

Die zusätzliche Suchleiste oberhalb des Baumbereichs wird auf Smartphones ausgeblendet. Die Suche hat mobil genau einen festen Einstieg über **Suche**. Auf Desktop bleibt die kompakte Suchleiste erhalten.

## Startseite

Die Startseite beginnt bewusst nicht mit einer Person. Sie zeigt in dieser Reihenfolge:

1. **Stammbaum entdecken** mit direktem Einstieg in den neutralen Gesamtbaum,
2. gezielte Personensuche,
3. Favoriten,
4. zuletzt angesehene Personen.

Favoriten und Verlauf bleiben damit nützliche persönliche Schnellzugriffe, bestimmen aber nicht mehr den Ausgangspunkt der App. Der Verlauf ist auf zwölf Einträge begrenzt und kann auf der Startseite geleert werden.

## Suche

Die Suchlogik ist für Desktop, Smartphone und Verwandtschafts-Finder vereinheitlicht. Sie durchsucht nummerierte Personen und eigenständige Partnerpersonen.

Ein Treffer auf eine nummerierte Person öffnet deren Familienkontext. Ein Treffer auf eine Partnerperson öffnet **direkt die Partnerdetailansicht** und zeigt im Hintergrund den zugehörigen Familienkontext. Damit entspricht das Ziel der Suche immer dem angezeigten Treffer.

Im Schutzmodus wird bei potenziell lebenden Personen nur der Name durchsucht; Lebensdaten und Orte werden nicht als Suchkriterien verwendet.

Die mobile Suche ist ein Haupttab und wechselt deshalb praktisch sofort. Sie verwendet nur einen kurzen Fade und keine ausgeprägte räumliche Einfahrbewegung.

## Familienfokus

Der Fokusmodus löst das Darstellungsproblem eines grossen Stammbaums auf kleinen Screens: Statt alle Äste gleichzeitig zu verkleinern, wird nach Auswahl einer Person deren unmittelbarer Familienkontext gezeigt.

Der Familienfokus zeigt Elternlinie, ausgewählte Person, Partnerpersonen, Geschwister und Kinder. Ein Tipp auf die ausgewählte Personenkarte öffnet direkt die Personendetails. Partnerkarten öffnen die jeweilige Partnerdetailansicht. Der Verwandtschafts-Finder bleibt als eigenständige Aktion erhalten.

## Gesamtbaum

Der Gesamtbaum ist jetzt selbst ein Hauptziel. Beim Einstieg über Start oder den Tab **Stammbaum** wird er neutral geöffnet:

- alle fünf Generationen,
- keine vorausgewählte Person,
- keine hervorgehobene Abstammungslinie,
- kein ausgewählter Personen-Chip.

Erst nach einer Personenauswahl wird ein Kontext hervorgehoben. Verschieben erfolgt per Drag, Zoomen per Pinch-Geste oder über die Zoom-Schaltflächen.

## Einstellungen

Das Zahnrad-Menü ist als echte Aktion in die App-Kopfzeile integriert. Das Symbol wird als kontrollierbares SVG gerendert und nicht als plattformabhängiges Unicode-Zeichen.

Das Popover öffnet räumlich vom Zahnrad aus mit einer kurzen Ease-out-Bewegung. Es bündelt Hell-/Dunkelmodus, Schutzmodus/Vollansicht, die Erklärung zur öffentlichen GitHub-Pages-Bereitstellung, Export/Import lokaler Korrekturen und die PWA-/Homescreen-Installation.

## Design Engineering

Die Interaktionen orientieren sich an den geprüften Design-Engineering-Prinzipien:

- unmittelbares Press-Feedback auf antippbaren Elementen,
- kurze UI-Übergänge mit gemeinsamer starker Ease-out-Kurve,
- häufig genutzte Hauptnavigation ohne unnötige Animation,
- origin-aware Popover für Einstellungen,
- transparente Materialien nur dort, wo sie Hierarchie schaffen,
- `prefers-reduced-motion`, `prefers-reduced-transparency` und `prefers-contrast` als Accessibility-Fallbacks,
- besser lesbare Sekundärtexte statt 9-Pixel-Mikrotypografie.

## Quellen und Herkunft

Scanbasierte Partnerangaben und nachträglich ergänztes Familienwissen werden unterschieden. Eine Familienangabe kann ein Quellenlabel und ein Ergänzungsdatum tragen. Die Partnerdetailansicht behauptet dadurch nicht mehr pauschal, jede Partnerangabe stamme aus der ursprünglichen Scanseite.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color, Standalone-Metadaten und Service Worker sind für GitHub Pages vorbereitet. Der Service Worker erhält bei jedem neuen Produktions-Build automatisch einen Build-Schlüssel aus dem gehashten JavaScript-Einstiegspunkt. Dadurch werden veraltete App-Caches ohne manuelles Versionshochzählen abgelöst.

`env(safe-area-inset-*)` berücksichtigt Geräte mit Notch oder Gestenleiste. `100dvh` vermeidet Höhenprobleme mit ein- und ausgeblendeter Browser-Chrome.
