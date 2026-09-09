# Mobile UX

Die App wird smartphone-first weiterentwickelt. Die Desktop-Ansicht bleibt erhalten, ist aber nicht das primäre Interaktionsmodell.

## Bedienkonzept auf Smartphones

- Der Stammbaum belegt den verfügbaren Bildschirm zwischen Kopfzeile und unterer Navigation.
- Verschieben erfolgt per Drag, Zoomen per Pinch-Geste oder über die drei Zoom-Schaltflächen.
- Die Suche bleibt jederzeit oben erreichbar und verwendet 16px Schriftgrösse, damit mobile Browser beim Fokussieren nicht unerwünscht hineinzoomen.
- Die Generationstiefe 3 bis 5 ist direkt neben der Suche erreichbar; Generation 2 bleibt auf grösseren Displays verfügbar.
- Unten befindet sich eine dauerhaft erreichbare Navigation für «Im Baum», «Suchen» und «Person».
- Die aktuell gewählte Person wird im Baum als kompakter Chip angezeigt.
- Personendetails öffnen auf kleinen Displays als Bottom Sheet und blockieren nicht dauerhaft die Baumansicht.
- Interaktive Elemente haben für Touch-Bedienung vergrösserte Trefferflächen.
- `env(safe-area-inset-*)` berücksichtigt Geräte mit Notch, Dynamic Island oder Gestenleiste.
- `100dvh` statt statischem `100vh` vermeidet Höhenprobleme mit ein- und ausgeblendeter Browser-Chrome.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color und Standalone-Metadaten sind vorbereitet. Damit kann die App nach einem späteren HTTPS-Deployment app-ähnlich vom Homescreen genutzt werden. Offline-Caching wird bewusst erst zusammen mit dem Deployment ergänzt, damit keine veralteten genealogischen Daten im Browser-Cache festhängen.

## Nächste mobile Ausbaustufen

1. fokussierter Familienmodus für sehr grosse Äste
2. Verwandtschafts-Finder zwischen zwei Personen
3. Datenschutzmodus für lebende Personen
4. optionale Vollbildsuche bei sehr kleinen Displays
5. echte Installierbarkeit inklusive kontrolliertem Service-Worker nach Festlegung des Deployments
