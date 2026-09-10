# Mobile UX

Die App wird smartphone-first weiterentwickelt. Die Desktop-Ansicht bleibt erhalten, ist aber nicht das primäre Interaktionsmodell.

## Bedienkonzept auf Smartphones

- Standardansicht auf kleinen Displays ist der **Familienfokus** statt des vollständigen Stammbaums.
- Der Familienfokus zeigt zur gewählten Person die Elternlinie, Geschwister und Kinder in touch-freundlichen Karten.
- Die Abstammungslinie zu Sebastian Villiger bleibt als horizontal scrollbarer Pfad erreichbar.
- Ein Umschalter erlaubt jederzeit den Wechsel zwischen **Fokus** und **Gesamt**.
- In der Gesamtansicht belegt der Stammbaum den verfügbaren Bildschirm zwischen Kopfzeile und unterer Navigation.
- Verschieben erfolgt per Drag, Zoomen per Pinch-Geste oder über die drei Zoom-Schaltflächen.
- Auf sehr kleinen Displays wird die kompakte Suchleiste ausgeblendet; «Suchen» in der Bottom Navigation öffnet stattdessen eine Vollbildsuche.
- Die mobile Vollbildsuche verwendet 16px Schriftgrösse, grosse Trefferflächen und springt direkt in den Familienfokus der ausgewählten Person.
- Unten befindet sich eine dauerhaft erreichbare Navigation für Ansichtswechsel, «Suchen» und «Person».
- Personendetails öffnen auf kleinen Displays als Bottom Sheet und blockieren nicht dauerhaft die Baumansicht.
- Der Editiermodus öffnet auf Smartphones als eigene Vollbildansicht mit grossen Eingabefeldern und fixierter Speicheraktion.
- Interaktive Elemente haben für Touch-Bedienung vergrösserte Trefferflächen.
- `env(safe-area-inset-*)` berücksichtigt Geräte mit Notch, Dynamic Island oder Gestenleiste.
- `100dvh` statt statischem `100vh` vermeidet Höhenprobleme mit ein- und ausgeblendeter Browser-Chrome.

## Familienfokus

Der Fokusmodus löst das zentrale Darstellungsproblem eines grossen Stammbaums auf kleinen Screens: Statt alle Äste gleichzeitig zu verkleinern, wird die Navigation personenorientiert. Ein Tipp auf Elternlinie, Geschwister oder Kind verschiebt den Fokus auf diese Person. Die vollständigen Lebens- und Quellenangaben bleiben über das Bottom Sheet erreichbar.

Die Darstellung basiert ausschliesslich auf den bereits erfassten Eltern-Kind-Beziehungen. Wo die Quelle nur eine Person der Abstammungslinie als strukturierte Person enthält, wird kein zweiter Elternteil erfunden. Ein dokumentierter Ehe- oder Lebenspartner wird auf der Personenkarte separat angezeigt.

## Verwandtschafts-Finder

Vom Familienfokus aus kann für die aktuell gewählte Person eine zweite erfasste Person gesucht werden. Die App berechnet den gemeinsamen Vorfahren bzw. die gemeinsame Bezugsperson, einen verständlichen Verwandtschaftsbegriff und den Verbindungspfad im strukturierten Nachkommenbaum.

Die Berechnung nutzt nur die erfassten Eltern-Kind-Kanten. Ehe- und Lebenspartner sind aktuell Zusatzdaten und deshalb nicht Teil des Verwandtschaftsgraphen. Diese Einschränkung wird in der Oberfläche angezeigt.

## Datenschutzmodus

Der **Schutzmodus** ist beim ersten Öffnen standardmässig aktiv und bleibt danach lokal im Browser gespeichert. Er kann über die Schaltfläche in der Kopfzeile jederzeit in die private Vollansicht umgeschaltet werden.

Für eine Person kann in der privaten Vollansicht neu ein expliziter Lebensstatus gesetzt werden: `living`, `deceased` oder `unknown`. Dieser Status hat Vorrang vor der Heuristik. Bei `unknown` gilt weiterhin die konservative 120-Jahre-Regel.

Im Schutzmodus werden für geschützte Personen Geburts- und Sterbedaten, Orte sowie Zusatznotizen ausgeblendet. Datum und Ort werden dort auch nicht als Suchkriterien verwendet. Namen und genealogische Beziehungen bleiben sichtbar, damit Stammbaum und Verwandtschafts-Finder weiterhin funktionieren.

## Lokaler Editiermodus

Der Editiermodus ist bewusst nicht-destruktiv. Er ist nur in der privaten Vollansicht verfügbar und erlaubt aktuell die Pflege von:

- Lebensstatus
- Geburtsdatum und Geburtsort
- Sterbedatum und Sterbeort
- Zusatznotiz bzw. Korrekturhinweis

Die Änderung wird lokal auf dem Gerät gespeichert und sofort in Baum, Fokus, Suche und Datenschutzlogik verwendet. Die Ausgangsdaten aus den Scans bleiben unverändert. Eine lokale Korrektur ist visuell markiert und kann pro Person wieder vollständig verworfen werden.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color, Standalone-Metadaten und ein kontrollierter Service Worker sind vorbereitet. Damit kann die App nach einem HTTPS-Deployment app-ähnlich vom Homescreen genutzt werden. Die genealogischen Ausgangsdaten bleiben versioniert im Repository; lokale Korrekturen werden separat im Browser gehalten.

## Nächste mobile Ausbaustufen

1. Export/Import und Freigabe lokaler Korrekturen
2. strukturierte Pflege von Partnern und zusätzlichen Beziehungen
3. privates/authentifiziertes Deployment
4. später optional Fotos und Dokumente pro Person

## Umgesetzt am 10. September 2026

Familienfokus, Verwandtschafts-Finder, Schutzmodus, mobile Vollbildsuche, expliziter Lebensstatus und lokaler Editiermodus sind im Branch `initial-app` umgesetzt. Der vollständige Stammbaum bleibt als alternative Gesamtansicht erhalten.
