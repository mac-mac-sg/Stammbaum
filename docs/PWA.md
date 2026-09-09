# PWA und Offline-Nutzung

Die App ist für eine spätere Installation auf Smartphones als Progressive Web App vorbereitet.

## Bereits umgesetzt

- `manifest.webmanifest` mit Standalone-Darstellung und Portrait-Orientierung
- eigenes App-Icon
- Service Worker unter `public/sw.js`
- Registrierung nur bei HTTPS und nicht auf `localhost`
- versionsbezogener Cache mit automatischem Entfernen älterer App-Caches
- Network-first für Navigationen mit Offline-Fallback
- Cache-first mit Hintergrundaktualisierung für bereits geladene statische Ressourcen
- ausschliesslich Same-Origin-Caching

## Datenschutz

Der Service Worker speichert lokal auf dem Gerät Ressourcen, die für die Offline-Nutzung benötigt werden. Da die genealogischen Daten derzeit Teil des ausgelieferten Frontend-Bundles sind, können diese bei installierter bzw. offline genutzter App im Browser-Cache des Geräts liegen.

Deshalb gilt für ein späteres Deployment:

1. Die Anwendung sollte nur über einen privaten bzw. authentifizierten Zugang bereitgestellt werden.
2. Auf gemeinsam genutzten Geräten sollte die App nicht dauerhaft installiert werden.
3. Browser-/Website-Daten müssen gelöscht werden, wenn lokale Offline-Daten entfernt werden sollen.
4. Der Schutzmodus reduziert die sichtbaren Angaben, ersetzt aber keine Zugriffskontrolle auf das ausgelieferte Datenpaket.

## Deployment-Voraussetzung

Service Worker benötigen ausser auf `localhost` eine HTTPS-Verbindung. Die App registriert den Worker deshalb erst nach einem echten sicheren Deployment. In der lokalen Vite-Entwicklung wird kein Service Worker registriert, um veraltete Entwicklungsdateien im Cache zu vermeiden.

## Cache-Strategie

Der Cache heisst aktuell `stammbaum-villiger-v1`. Bei einer Änderung der Offline-Strategie oder einer bewusst erzwungenen Neuverteilung kann `CACHE_VERSION` in `public/sw.js` erhöht werden. Beim Aktivieren des neuen Workers werden ältere Caches mit dem Präfix `stammbaum-villiger-` entfernt.
