# PWA und Offline-Nutzung

Die App ist für die Installation auf Smartphones als Progressive Web App vorbereitet und wird über GitHub Pages unter dem Projektpfad `/Stammbaum/` ausgeliefert.

## Bereits umgesetzt

- `manifest.webmanifest` mit Standalone-Darstellung und Portrait-Orientierung
- eigenes App-Icon
- Service Worker unter `public/sw.js`
- Registrierung nur bei HTTPS und nicht auf `localhost`
- automatische Cache-Versionierung anhand des jeweils gebauten JavaScript-Bundles
- automatisches Entfernen älterer App-Caches beim Aktivieren eines neuen Builds
- Network-first für Navigationen mit Offline-Fallback
- Cache-first mit Hintergrundaktualisierung für bereits geladene statische Ressourcen
- ausschliesslich Same-Origin-Caching
- Pages-kompatibler Vite-Basispfad `/Stammbaum/`

## Öffentliche Bereitstellung

Die App wird bewusst öffentlich über GitHub Pages bereitgestellt. Der Schutzmodus reduziert die sichtbaren Angaben in der Bedienoberfläche, ist aber **keine Zugriffskontrolle**. Da die genealogischen Ausgangsdaten Teil des ausgelieferten Frontend-Bundles sind, können sie technisch von einem Besucher der öffentlichen Website abgerufen werden.

Lokale Korrekturen, Favoriten und Verlauf werden dagegen nur im Browser des jeweiligen Geräts gespeichert und nicht automatisch an GitHub Pages übertragen.

## Offline-Daten auf dem Gerät

Der Service Worker speichert Ressourcen lokal, die für die Offline-Nutzung benötigt werden. Damit können auch Teile des öffentlich ausgelieferten genealogischen Datenbestands im Browser-Cache des Geräts verbleiben.

Bei einem Gerätewechsel oder wenn lokale Daten entfernt werden sollen, müssen die Website-/App-Daten des Browsers gelöscht werden. JSON-Korrekturexporte können zusätzliche personenbezogene Daten enthalten und sollten nicht unbeabsichtigt veröffentlicht werden.

## Deployment-Voraussetzung

GitHub Pages liefert die Anwendung automatisch per HTTPS aus. Dadurch stehen Service Worker und PWA-Funktionen auf der produktiven Pages-URL zur Verfügung. In der lokalen Vite-Entwicklung wird kein Service Worker registriert, damit keine veralteten Entwicklungsdateien im Cache verbleiben.

## Cache-Strategie

Die Service-Worker-Registrierung leitet aus dem Dateinamen des gebauten, gehashten JavaScript-Einstiegspunkts einen Build-Schlüssel ab und hängt ihn an die Service-Worker-URL. Dadurch erkennt der Browser nach jedem neuen Produktions-Build einen aktualisierten Worker. Der Worker verwendet denselben Build-Schlüssel für seinen Cache und entfernt beim Aktivieren ältere Caches mit dem Präfix `stammbaum-villiger-`.

Damit ist kein manuelles Hochzählen einer `CACHE_VERSION` mehr nötig und alte Build-Ressourcen werden bei regulären App-Updates automatisch abgelöst.
