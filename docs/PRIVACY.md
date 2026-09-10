# Datenschutzlogik

## Zweck

Die Familienunterlagen enthalten personenbezogene Angaben zu möglicherweise noch lebenden Personen. Die App besitzt deshalb zwei Darstellungsmodi:

- **Schutzmodus**: Standard beim ersten Öffnen. Lebensdaten potenziell lebender Personen werden verborgen.
- **Private Vollansicht**: Alle aus den Unterlagen erfassten Angaben sowie lokale Korrekturen werden angezeigt.

Die Wahl wird nur lokal im Browser unter `stammbaum-privacy-mode` gespeichert.

## Lebensstatus und Heuristik

Der Schutzmodus berücksichtigt einen expliziten Lebensstatus pro Person:

- `living`: Die Person wird im Schutzmodus immer geschützt.
- `deceased`: Die vorhandenen Lebensdaten dürfen im Schutzmodus angezeigt werden.
- `unknown`: Die konservative Heuristik entscheidet weiterhin.

Solange kein Lebensstatus fachlich festgelegt ist, wird ein Datensatz geschützt, wenn kein Sterbedatum erfasst ist und mindestens eine der folgenden Bedingungen gilt:

1. Das erfasste Geburtsjahr liegt höchstens 120 Jahre zurück.
2. Es ist kein Geburtsjahr erfasst; dann wird vorsichtshalber von einem potenziell lebenden Menschen ausgegangen.

Ein erfasstes Sterbedatum hebt die heuristische Einstufung auf. Ein explizit gesetzter Lebensstatus hat Vorrang vor der Heuristik.

## Lokale Korrekturen

In der privaten Vollansicht können Lebensstatus, Geburts- und Sterbedaten, Orte sowie Zusatznotizen pro Person korrigiert oder ergänzt werden. Diese Korrekturen:

- werden ausschliesslich im Browser des verwendeten Geräts gespeichert,
- verändern weder die ursprünglichen Scanangaben noch die Quelldateien im Repository,
- sind in Baum, Familienfokus, Suche und Verwandtschafts-Finder sofort wirksam,
- können pro Person vollständig verworfen werden.

Die lokalen Änderungen werden unter `stammbaum-person-edits-v1` gespeichert. Sie sind bewusst als nicht-destruktive Arbeitsebene ausgelegt, bis ein späteres fachliches Freigabe- und Persistenzmodell definiert ist.

## Export und Import

Lokale Korrekturen können als versionierte JSON-Datei exportiert und auf einem anderen Gerät wieder importiert werden. Beim Import werden nur bekannte Personen-IDs und formal gültige Korrektureinträge übernommen; andere Einträge werden übersprungen. Importierte Korrekturen werden mit bereits vorhandenen lokalen Korrekturen zusammengeführt.

Die Exportdatei kann vollständige personenbezogene Angaben enthalten. Sie ist deshalb wie eine private Familiendatei zu behandeln und sollte nicht öffentlich geteilt oder ungeschützt abgelegt werden.

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

Der explizite Lebensstatus ist aktuell eine lokale Korrektur und noch kein freigegebener Bestandteil des zentralen genealogischen Datensatzes. Für einen langfristig belastbaren Familienbestand sollte der Status später mit Herkunft, Änderungsdatum und fachlicher Freigabe zentral gespeichert werden. Bis dahin verhindert die Kombination aus Status und 120-Jahre-Heuristik, dass fehlende Sterbedaten automatisch als Freigabe sensibler Lebensdaten interpretiert werden.
