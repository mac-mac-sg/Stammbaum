# Datenschutzlogik

## Zweck

Die Familienunterlagen enthalten personenbezogene Angaben zu möglicherweise noch lebenden Personen. Die App besitzt deshalb zwei Darstellungsmodi:

- **Schutzmodus**: Standard beim ersten Öffnen. Lebensdaten potenziell lebender Personen werden verborgen.
- **Private Vollansicht**: Alle aus den Unterlagen erfassten Angaben sowie lokale Korrekturen werden angezeigt.

Die Wahl wird nur lokal im Browser unter `stammbaum-privacy-mode` gespeichert.

## Lebensstatus und Heuristik

Der Schutzmodus berücksichtigt einen expliziten Lebensstatus für nummerierte Personen und Partnerpersonen:

- `living`: Die Person wird im Schutzmodus immer geschützt.
- `deceased`: Die vorhandenen Lebensdaten dürfen im Schutzmodus angezeigt werden.
- `unknown`: Die konservative Heuristik entscheidet weiterhin.

Solange kein Lebensstatus fachlich festgelegt ist, wird ein Datensatz geschützt, wenn kein Sterbedatum erfasst ist und mindestens eine der folgenden Bedingungen gilt:

1. Das erfasste Geburtsjahr liegt höchstens 120 Jahre zurück.
2. Es ist kein Geburtsjahr erfasst; dann wird vorsichtshalber von einem potenziell lebenden Menschen ausgegangen.

Ein erfasstes Sterbedatum hebt die heuristische Einstufung auf. Ein explizit gesetzter Lebensstatus hat Vorrang vor der Heuristik.

## Lokale Korrekturen

In der privaten Vollansicht können für nummerierte Personen Lebensstatus, Geburts- und Sterbedaten, Orte sowie Zusatznotizen korrigiert oder ergänzt werden. Für Partnerpersonen können zusätzlich Beziehungstyp und Beziehungsstatus gepflegt werden.

Diese Korrekturen:

- werden ausschliesslich im Browser des verwendeten Geräts gespeichert,
- verändern weder die ursprünglichen Scanangaben noch die Quelldateien im Repository,
- sind in Baum, Familienfokus, Suche, Verwandtschafts-Finder und Datenschutzlogik sofort wirksam,
- können pro Person bzw. Partnerperson vollständig verworfen werden.

Korrekturen nummerierter Personen werden unter `stammbaum-person-edits-v1` gespeichert, Partnerkorrekturen unter `stammbaum-partner-edits-v1`. Beide Speicherbereiche bilden eine nicht-destruktive Arbeitsebene, bis ein fachliches Freigabe- und Persistenzmodell definiert ist.

## Export und Import

Lokale Korrekturen können als versionierte JSON-Datei exportiert und auf einem anderen Gerät wieder importiert werden. Das aktuelle Exportformat Version 2 trennt `personEdits` und `partnerEdits`; ältere Version-1-Sicherungen mit dem Feld `edits` bleiben importierbar.

Beim Import werden nur bekannte Personen- bzw. Partner-IDs und formal gültige Korrektureinträge übernommen; andere Einträge werden übersprungen. Importierte Korrekturen werden mit bereits vorhandenen lokalen Korrekturen zusammengeführt.

Die Exportdatei kann vollständige personenbezogene Angaben enthalten. Sie ist deshalb wie eine private Familiendatei zu behandeln und sollte nicht öffentlich geteilt oder ungeschützt abgelegt werden.

## Im Schutzmodus verborgen

- Geburtsdatum
- Geburtsort
- Sterbedatum bzw. fehlendes Sterbedatum
- Sterbeort
- freie Zusatznotizen der Person
- entsprechende Lebensdaten dokumentierter Partnerpersonen
- Suche über Datum und Ort bei geschützten Personen

## Im Schutzmodus weiterhin sichtbar

- Name
- Nummer aus der Quelle, sofern vorhanden
- Generation
- Eltern-Kind-Beziehungen
- Partnername und Beziehungstyp
- Abstammungslinie
- Verwandtschaftsberechnung
- Quellen-Seitennummer

## Fachliche Grenze

Der explizite Lebensstatus und weitere lokale Korrekturen sind noch kein freigegebener Bestandteil des zentralen genealogischen Datensatzes. Für einen langfristig belastbaren Familienbestand sollten Änderungen später mit Herkunft, Änderungsdatum und fachlicher Freigabe zentral gespeichert werden. Bis dahin verhindert die Kombination aus explizitem Status und 120-Jahre-Heuristik, dass fehlende Sterbedaten automatisch als Freigabe sensibler Lebensdaten interpretiert werden.
