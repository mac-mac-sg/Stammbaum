# Partnergraph

## Zweck

Die Familienunterlagen nummerieren die Nachkommen von Sebastian Villiger, führen Ehe-, Lebens- und Verlobungspartner jedoch als Zusatzangaben. Für die App werden diese Partnerangaben zusätzlich in eigenständige Personenknoten und Paarrelationen überführt.

## Stabile IDs

Ein Partnerknoten erhält eine deterministische ID aus der nummerierten Person und der Reihenfolge ihrer dokumentierten Beziehungen:

- `partner:p059:1`
- `partner:p093:1`
- bei mehreren Beziehungen entsprechend `partner:p007:1`, `partner:p007:2` usw.

Die ID ist technisch stabil, solange die Reihenfolge der Beziehungen im Quelldatensatz nicht verändert wird.

## Datenübernahme

Ein Partnerknoten übernimmt ausschliesslich Angaben, die bereits in der Quelle bzw. im erfassten Beziehungsfeld vorhanden sind:

- Name
- Geburtsdatum und -ort
- Sterbedatum und -ort
- Beziehungstyp (`Ehe`, `Partnerschaft`, `Verlobung`)
- Status wie `geschieden` oder `annulliert`
- Notiz bei unvollständigen Angaben
- Quellenseite

Unbekannte Eltern, Geschwister, Kinder oder Vorfahren werden nicht ergänzt.

## Paarrelation

Jede bisherige Partnerangabe erzeugt eine eigene Relation zwischen dem nummerierten Nachkommen und dem Partnerknoten. Dadurch können beide Datensätze im Familiengraph separat adressiert werden.

Im vollständigen Stammbaum wird diese Relation nun auch visuell abgebildet: Der nummerierte Nachkomme und seine dokumentierten Partnerpersonen erscheinen als nebeneinanderliegende Karten. Eine horizontale Paarlinie verbindet die Karten. Der Kinderast setzt unter der gemeinsamen Familieneinheit an, ohne zusätzliche oder unbelegte Eltern-Kind-Kanten zu erzeugen.

## Suche und Navigation

Die mobile Personensuche durchsucht sowohl nummerierte Nachkommen als auch Partnerpersonen. Ein Treffer auf eine Partnerperson führt in den Familienfokus der verknüpften nummerierten Person. Dort kann der Partner als eigene Karte geöffnet werden.

Im Gesamtbaum ist die Partnerkarte direkt antippbar und öffnet dieselbe Partnerdetailansicht.

## Verwandtschafts-Finder

Der Verwandtschafts-Finder behandelt Paarrelationen als eigene Graphkanten. Damit lassen sich direkte Beziehungen wie Ehe/Partnerschaft sowie gemischte Pfade wie «Ehepartner einer Cousine» darstellen.

Die Anwendung unterscheidet deshalb zwischen:

- reiner Blutsverwandtschaft,
- direkter Paarbeziehung,
- gemischten Verbindungen aus Paar- und Abstammungskanten.

Bei gemischten Verbindungen wird nicht behauptet, dass eine Partnerperson blutsverwandt ist. Die Erklärung weist die Verbindung über die Partnerschaft ausdrücklich aus.

## Datenschutz

Partnerpersonen werden im Schutzmodus ebenfalls konservativ behandelt. Ohne erfasstes Sterbedatum gelten sie bei plausiblem Geburtsjahr bzw. vollständig fehlendem Geburtsjahr als potenziell lebend. Lebensdaten werden dann ausgeblendet und nicht als Suchkriterien verwendet.

Ein expliziter lokaler Lebensstatus ist derzeit nur für die nummerierten Nachkommen umgesetzt. Die strukturierte Pflege von Partnerpersonen ist eine nächste Ausbaustufe.
