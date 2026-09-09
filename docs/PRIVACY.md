# Datenschutzlogik

## Zweck

Die Familienunterlagen enthalten personenbezogene Angaben zu möglicherweise noch lebenden Personen. Die App besitzt deshalb zwei Darstellungsmodi:

- **Schutzmodus**: Standard beim ersten Öffnen. Lebensdaten potenziell lebender Personen werden verborgen.
- **Private Vollansicht**: Alle aus den Unterlagen erfassten Angaben werden angezeigt.

Die Wahl wird nur lokal im Browser unter `stammbaum-privacy-mode` gespeichert.

## Technische Einstufung «potenziell lebend»

Ein Datensatz wird geschützt, wenn kein Sterbedatum erfasst ist und mindestens eine der folgenden Bedingungen gilt:

1. Das erfasste Geburtsjahr liegt höchstens 120 Jahre zurück.
2. Es ist kein Geburtsjahr erfasst; dann wird vorsichtshalber von einem potenziell lebenden Menschen ausgegangen.

Ein erfasstes Sterbedatum hebt den Schutz unabhängig vom Geburtsjahr auf.

## Im Schutzmodus verborgen

- Geburtsdatum
- Geburtsort
- Sterbedatum bzw. fehlendes Sterbedatum
- Sterbeort
- freie Zusatznotizen der Person
- entsprechende Lebensdaten dokumentierter Partner
- Suche über Datum und Ort bei geschützten Personen

## Im Schutzmodus weiterhin sichtbar

- Name
- Nummer aus der Quelle
- Generation
- Eltern-Kind-Beziehungen
- Partnername und Beziehungstyp
- Abstammungslinie
- Verwandtschaftsberechnung
- Quellen-Seitennummer

## Fachliche Grenze

Die 120-Jahre-Regel ist eine konservative technische Heuristik. Für einen langfristig belastbaren Datenbestand sollte jede Person später einen expliziten Lebensstatus erhalten, zum Beispiel `living`, `deceased` oder `unknown`. Bis dahin verhindert die Heuristik, dass fehlende Sterbedaten automatisch als Freigabe sensibler Lebensdaten interpretiert werden.
