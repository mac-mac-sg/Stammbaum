# Datenschutzlogik

## Zweck

Die Familienunterlagen enthalten personenbezogene Angaben zu möglicherweise noch lebenden Personen. Die App wird bewusst öffentlich über GitHub Pages bereitgestellt. Der Datenschutzmodus dient deshalb ausschliesslich dazu, in der normalen Bedienoberfläche unnötige Detailangaben auszublenden; er ist **keine technische Zugriffskontrolle**.

Die App besitzt zwei Darstellungsmodi:

- **Schutzmodus**: Standard beim ersten Öffnen. Lebensdaten potenziell lebender Personen werden in der Oberfläche verborgen.
- **Vollansicht**: Alle aus den Unterlagen erfassten Angaben sowie lokale Korrekturen werden angezeigt.

Die Wahl wird nur lokal im Browser unter `stammbaum-privacy-mode` gespeichert.

## Öffentliche Datenbasis

Die genealogischen Ausgangsdaten sind Bestandteil des ausgelieferten Frontend-Bundles. Bei einem öffentlichen GitHub-Pages-Deployment können diese Dateien technisch von jedem Besucher heruntergeladen und analysiert werden, unabhängig davon, welcher Darstellungsmodus in der Oberfläche aktiv ist.

Der Schutzmodus darf daher nicht als Zugriffsschutz oder Vertraulichkeitsgarantie verstanden werden. Die öffentliche Bereitstellung dieser Ausgangsdaten wurde für dieses Projekt bewusst akzeptiert.

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

In der Vollansicht können für nummerierte Personen Lebensstatus, Geburts- und Sterbedaten, Orte sowie Zusatznotizen korrigiert oder ergänzt werden. Für Partnerpersonen können zusätzlich Beziehungstyp und Beziehungsstatus gepflegt werden.

Diese Korrekturen:

- werden ausschliesslich im Browser des verwendeten Geräts gespeichert,
- verändern weder die ursprünglichen Scanangaben noch die Quelldateien im Repository,
- sind in Baum, Familienfokus, Suche, Verwandtschafts-Finder und Datenschutzlogik sofort wirksam,
- können pro Person bzw. Partnerperson vollständig verworfen werden.

Korrekturen nummerierter Personen werden unter `stammbaum-person-edits-v1` gespeichert, Partnerkorrekturen unter `stammbaum-partner-edits-v1`.

## Favoriten und Verlauf

Für den Smartphone-Schnellzugriff werden zwei weitere rein lokale Navigationsspeicher verwendet:

- `stammbaum-favorite-members-v1` für Favoriten,
- `stammbaum-recent-members-v1` für zuletzt angesehene Personen.

Dort werden nur stabile interne IDs gespeichert. Namen, Geburtsdaten, Orte oder andere Lebensdaten werden für diese Funktion nicht zusätzlich dupliziert.

## Export und Import

Lokale Korrekturen können als versionierte JSON-Datei exportiert und auf einem anderen Gerät wieder importiert werden. Das aktuelle Exportformat Version 2 trennt `personEdits` und `partnerEdits`; ältere Version-1-Sicherungen bleiben importierbar.

Favoriten und Verlauf sind bewusst nicht Bestandteil des Korrekturexports. Exportdateien können vollständige personenbezogene Angaben enthalten und sollten nicht unbeabsichtigt veröffentlicht oder in das öffentliche Repository eingecheckt werden.

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
- Favoriten- und Verlaufseinträge als Navigationsziele

## Fachliche Grenze

Der explizite Lebensstatus und lokale Korrekturen sind noch kein freigegebener Bestandteil des zentralen genealogischen Datensatzes. Für einen langfristig belastbaren Familienbestand sollten Änderungen später mit Herkunft, Änderungsdatum und fachlicher Freigabe zentral gespeichert werden.
