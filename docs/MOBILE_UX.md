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

## Verwandtschafts-Finder

Vom Familienfokus aus kann für die aktuell gewählte Person eine zweite erfasste Person gesucht werden. Die App berechnet den gemeinsamen Vorfahren bzw. die gemeinsame Bezugsperson, einen verständlichen Verwandtschaftsbegriff und den Verbindungspfad im strukturierten Nachkommenbaum.

Die Berechnung nutzt nur die erfassten Eltern-Kind-Kanten. Ehe- und Lebenspartner sind aktuell Zusatzdaten und deshalb nicht Teil des Verwandtschaftsgraphen. Diese Einschränkung wird in der Oberfläche angezeigt.

## Datenschutzmodus

Der **Schutzmodus** ist beim ersten Öffnen standardmässig aktiv und bleibt danach lokal im Browser gespeichert. Er kann über die Schaltfläche in der Kopfzeile jederzeit in die private Vollansicht umgeschaltet werden.

Als potenziell lebend gilt technisch ein Datensatz ohne erfasstes Sterbedatum, dessen Geburtsjahr höchstens 120 Jahre zurückliegt. Fehlt zusätzlich ein Geburtsdatum, wird der Datensatz vorsichtshalber ebenfalls geschützt. Diese Regel ist bewusst konservativ und ersetzt keine fachliche Kennzeichnung «lebend/verstorben» im Datenbestand.

Im Schutzmodus werden für potenziell lebende Personen:

- Geburts- und Sterbedaten sowie Orte ausgeblendet,
- Zusatznotizen ausgeblendet,
- Lebensdaten auf Baum- und Fokuskarten durch «Lebensdaten geschützt» ersetzt,
- Datum und Ort nicht als Suchkriterien verwendet,
- entsprechende Lebensdaten von dokumentierten Partnern ebenfalls verborgen.

Namen und genealogische Beziehungen bleiben sichtbar, damit der Stammbaum und der Verwandtschafts-Finder weiterhin funktionieren.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color und Standalone-Metadaten sind vorbereitet. Damit kann die App nach einem späteren HTTPS-Deployment app-ähnlich vom Homescreen genutzt werden. Offline-Caching wird bewusst erst zusammen mit dem Deployment ergänzt, damit keine veralteten genealogischen Daten im Browser-Cache festhängen.

## Nächste mobile Ausbaustufen

1. fachliche Kennzeichnung des Lebensstatus statt ausschliesslicher Heuristik
2. echte Installierbarkeit inklusive kontrolliertem Service-Worker nach Festlegung des Deployments
3. optionaler Editiermodus für Ergänzungen und Korrekturen

## Umgesetzt am 9. September 2026

Familienfokus, Verwandtschafts-Finder, Schutzmodus und mobile Vollbildsuche sind im Branch `initial-app` umgesetzt. Der vollständige Stammbaum bleibt als alternative Gesamtansicht erhalten.
