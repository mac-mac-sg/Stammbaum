# Mobile UX

Die App wird smartphone-first weiterentwickelt. Die Desktop-Ansicht bleibt erhalten, ist aber nicht das primäre Interaktionsmodell.

## Bedienkonzept auf Smartphones

- Standardansicht auf kleinen Displays ist der **Familienfokus** statt des vollständigen Stammbaums.
- Der Familienfokus zeigt zur gewählten Person die Elternlinie, **Partnerpersonen**, Geschwister und Kinder in touch-freundlichen Karten.
- Partnerinnen und Partner sind keine reine Textzeile mehr, sondern eigenständige Personenknoten mit eigener Detailansicht.
- Die Abstammungslinie zu Sebastian Villiger bleibt als horizontal scrollbarer Pfad erreichbar.
- Ein Umschalter erlaubt jederzeit den Wechsel zwischen **Fokus** und **Gesamt**.
- In der Gesamtansicht belegt der Stammbaum den verfügbaren Bildschirm zwischen Kopfzeile und unterer Navigation.
- In der Gesamtansicht werden Partnerinnen und Partner als **eigene Karten direkt neben der nummerierten Person** dargestellt. Eine Paarlinie verbindet die Karten; der Kinderast setzt unter der gemeinsamen Familienachse an.
- Verschieben erfolgt per Drag, Zoomen per Pinch-Geste oder über die drei Zoom-Schaltflächen. Weil Paar-Karten mehr Breite benötigen, startet die Gesamtansicht etwas weiter herausgezoomt und erlaubt einen kleineren Minimalzoom.
- Auf sehr kleinen Displays wird die kompakte Suchleiste ausgeblendet; «Suchen» in der Bottom Navigation öffnet stattdessen eine Vollbildsuche.
- Die mobile Vollbildsuche durchsucht nummerierte Personen und Partnerpersonen. Ein Partner-Treffer führt in den zugehörigen Familienfokus, wo dessen eigene Karte geöffnet werden kann.
- Unten befindet sich eine dauerhaft erreichbare Navigation für Ansichtswechsel, «Suchen» und «Person».
- Personendetails öffnen auf kleinen Displays als Bottom Sheet und blockieren nicht dauerhaft die Baumansicht.
- Partnerdetails öffnen ebenfalls als mobile Vollbild-/Sheet-Ansicht und zeigen nur tatsächlich belegte Angaben. Auch Partnerkarten in der Gesamtansicht sind direkt antippbar.
- Die Editiermodi öffnen auf Smartphones als eigene Vollbildansichten mit grossen Eingabefeldern und fixierter Speicheraktion.
- Interaktive Elemente haben für Touch-Bedienung vergrösserte Trefferflächen.
- `env(safe-area-inset-*)` berücksichtigt Geräte mit Notch, Dynamic Island oder Gestenleiste.
- `100dvh` statt statischem `100vh` vermeidet Höhenprobleme mit ein- und ausgeblendeter Browser-Chrome.

## Familienfokus

Der Fokusmodus löst das zentrale Darstellungsproblem eines grossen Stammbaums auf kleinen Screens: Statt alle Äste gleichzeitig zu verkleinern, wird die Navigation personenorientiert. Ein Tipp auf Elternlinie, Partnerperson, Geschwister oder Kind verschiebt bzw. vertieft den Familienkontext. Die vollständigen Lebens- und Quellenangaben bleiben über die Detailansichten erreichbar.

Die nummerierten Personen basieren auf den erfassten Eltern-Kind-Beziehungen. Dokumentierte Ehe-, Lebens- und Verlobungspartner werden zusätzlich als eigenständige Knoten modelliert. Für Partnerpersonen werden keine Eltern oder Vorfahren ergänzt, wenn diese in den Unterlagen nicht belegt sind.

## Gesamtbaum und Paar-Karten

Der vollständige Stammbaum bleibt für Orientierung, Überblick und grössere Displays verfügbar. Ein Familienknoten besteht nun nicht mehr nur aus einer Personenkarte mit Partnertext, sondern aus einer horizontalen Familieneinheit:

- links bzw. zuerst die nummerierte Person,
- daneben eine oder mehrere dokumentierte Partnerpersonen als eigene Karten,
- dazwischen eine sichtbare Paarverbindung,
- darunter der gemeinsame Kinderast des erfassten Nachkommenzweigs.

Die Partnerkarten sind interaktiv und öffnen ihre eigene Detailansicht. Bei mehreren dokumentierten Beziehungen werden die Partnerkarten nebeneinander angeordnet. Damit bleibt die Quelle vollständig sichtbar, ohne mehrere unbelegte Eltern-Kind-Kanten zu erzeugen.

## Verwandtschafts-Finder

Vom Familienfokus aus kann für die aktuell gewählte Person eine zweite erfasste Person gesucht werden. Die Suche umfasst auch Partnerpersonen.

Der Finder unterscheidet:

- **Blutsverwandtschaft** über die strukturierten Eltern-Kind-Kanten,
- **direkte Paarbeziehungen** wie Ehe, Partnerschaft oder Verlobung,
- **gemischte Verbindungen** über eine Partnerperson und den bekannten Nachkommenbaum.

Bei einer gemischten Verbindung wird transparent erklärt, über welche Paarbeziehung und welche Blutsverwandtschaft der Pfad zustande kommt. Unbekannte Abstammung auf der Partnerseite wird nicht konstruiert. Lokale Änderungen am Beziehungstyp wirken unmittelbar im Finder.

## Datenschutzmodus

Der **Schutzmodus** ist beim ersten Öffnen standardmässig aktiv und bleibt danach lokal im Browser gespeichert. Er kann über die Schaltfläche in der Kopfzeile jederzeit in die private Vollansicht umgeschaltet werden.

Für nummerierte Personen und Partnerpersonen kann in der privaten Vollansicht ein expliziter Lebensstatus gesetzt werden: `living`, `deceased` oder `unknown`. Dieser Status hat Vorrang vor der Heuristik. Bei `unknown` gilt weiterhin die konservative 120-Jahre-Regel.

Im Schutzmodus werden für geschützte Personen Geburts- und Sterbedaten, Orte sowie Zusatznotizen ausgeblendet. Datum und Ort werden dort auch nicht als Suchkriterien verwendet. Namen und genealogische Beziehungen bleiben sichtbar, damit Stammbaum und Verwandtschafts-Finder weiterhin funktionieren.

## Lokaler Editiermodus

Der Editiermodus ist bewusst nicht-destruktiv und nur in der privaten Vollansicht verfügbar.

Für nummerierte Personen können gepflegt werden:

- Lebensstatus
- Geburtsdatum und Geburtsort
- Sterbedatum und Sterbeort
- Zusatznotiz bzw. Korrekturhinweis

Für Partnerpersonen kommen hinzu:

- Beziehungstyp: Ehe, Partnerschaft oder Verlobung
- Beziehungsstatus: keiner, geschieden oder annulliert

Änderungen werden lokal auf dem Gerät gespeichert und sofort in Gesamtbaum, Familienfokus, Suche, Partnerdetail, Verwandtschafts-Finder und Datenschutzlogik verwendet. Die Ausgangsdaten aus den Scans bleiben unverändert. Eine lokale Korrektur ist visuell markiert und kann pro Person oder Partnerperson wieder vollständig verworfen werden.

Lokale Personen- und Partnerkorrekturen können gemeinsam als private JSON-Sicherung exportiert und auf einem anderen Gerät wieder importiert werden. Das Exportformat Version 2 bleibt beim Import kompatibel mit älteren Version-1-Sicherungen.

## Web-App-Verhalten

`manifest.webmanifest`, Theme-Color, Standalone-Metadaten und ein kontrollierter Service Worker sind vorbereitet. Damit kann die App nach einem HTTPS-Deployment app-ähnlich vom Homescreen genutzt werden. Die genealogischen Ausgangsdaten bleiben versioniert im Repository; lokale Korrekturen werden separat im Browser gehalten.

## Nächste mobile Ausbaustufen

1. privates/authentifiziertes Deployment
2. optionaler Freigabeprozess für bestätigte Korrekturen
3. zusätzliche Quellen und Partnerlinien
4. später optional Fotos und Dokumente pro Person

## Umgesetzt am 10. September 2026

Familienfokus, eigenständige Partnerpersonen, Paar-Karten in der Gesamtansicht, Verwandtschafts-Finder über Bluts- und Paarbeziehungen, Schutzmodus, mobile Vollbildsuche, Editiermodus für nummerierte Personen und Partnerpersonen sowie Export/Import sind im Branch `initial-app` umgesetzt.
