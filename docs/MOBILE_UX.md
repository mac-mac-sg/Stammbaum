# Mobile UX

Die App wird smartphone-first weiterentwickelt. Die Desktop-Ansicht bleibt erhalten, ist aber nicht das primäre Interaktionsmodell.

## Bedienkonzept auf Smartphones

- Standardansicht auf kleinen Displays ist der **Familienfokus** statt des vollständigen Stammbaums.
- Der Familienfokus zeigt zur gewählten Person die Elternlinie, Geschwister und Kinder in touch-freundlichen Karten.
- Die Abstammungslinie zu Sebastian Villiger bleibt als horizontal scrollbarer Pfad erreichbar.
- Ein Umschalter erlaubt jederzeit den Wechsel zwischen **Fokus** und **Gesamt**.
- In der Gesamtansicht belegt der Stammbaum den verfügbaren Bildschirm zwischen Kopfzeile und unterer Navigation.
- Verschieben erfolgt per Drag, Zoomen per Pinch-Geste oder über die drei Zoom-Schaltflächen.
- Die Suche bleibt jederzeit oben erreichbar und verwendet 16px Schriftgrösse, damit mobile Browser beim Fokussieren nicht unerwünscht hineinzoomen.
- Die Generationstiefe 3 bis 5 ist in der Gesamtansicht direkt neben der Suche erreichbar; Generation 2 bleibt auf grösseren Displays verfügbar.
- Unten befindet sich eine dauerhaft erreichbare Navigation für Ansichtswechsel, «Suchen» und «Person».
- Die aktuell gewählte Person wird in der Gesamtansicht als kompakter Chip angezeigt.
- Personendetails öffnen auf kleinen Displays als Bottom Sheet und blockieren nicht dauerhaft die Baumansicht.
- Interaktive Elemente haben für Touch-Bedienung vergrösserte Trefferflächen.
- `env(safe-area-inset-*)` berücksichtigt Geräte mit Notch, Dynamic Island oder Gestenleiste.
- `100dvh` statt statischem `100vh` vermeidet Höhenprobleme mit ein- und ausgeblendeter Browser-Chrome.

## Familienfokus

Der Fokusmodus löst das zentrale Darstellungsproblem eines grossen Stammbaums auf kleinen Screens: Statt alle Äste gleichzeitig zu verkleinern, wird die Navigation personenorientiert. Ein Tipp auf Elternlinie, Geschwister oder Kind verschiebt den Fokus auf diese Person. Die vollständigen Lebens- und Quellenangaben bleiben über das Bottom Sheet erreichbar.

Die Darstellung basiert ausschliesslich auf den bereits erfassten Eltern-Kind-Beziehungen. Wo die Quelle nur eine Person der Abstammungslinie als strukturierte Person enthält, wird kein zweiter Elternteil erfunden. Ein dokumentierter Ehe- oder Lebenspartner wird auf der Personenkarte separat angezeigt.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color und Standalone-Metadaten sind vorbereitet. Damit kann die App nach einem späteren HTTPS-Deployment app-ähnlich vom Homescreen genutzt werden. Offline-Caching wird bewusst erst zusammen mit dem Deployment ergänzt, damit keine veralteten genealogischen Daten im Browser-Cache festhängen.

## Nächste mobile Ausbaustufen

1. Verwandtschafts-Finder zwischen zwei Personen
2. Datenschutzmodus für lebende Personen
3. optionale Vollbildsuche bei sehr kleinen Displays
4. echte Installierbarkeit inklusive kontrolliertem Service-Worker nach Festlegung des Deployments
