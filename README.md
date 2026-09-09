# Stammbaum

Interaktive, private Stammbaum-App auf Basis der eingescannten Familienunterlagen **«Nachkommen von Sebastian Villiger»**.

## Stand

Der erste Prototyp enthält:

- 104 nummerierte Nachkommen über fünf Generationen
- 48 in den Scans genannte Ehe-, Partner- oder Verlobungsbeziehungen
- Eltern-Kind-Verknüpfungen gemäss der Nummerierung der Vorlage
- zoombaren und verschiebbaren Stammbaum
- Suche nach Name, Ort, Jahr und Partnername
- Personendetails mit Lebensdaten, Familie, Beziehungen und Quellenhinweis
- Hervorhebung der Abstammungslinie zur ausgewählten Person
- responsive Darstellung inklusive Dark Mode
- explizite Kennzeichnung unklarer oder unvollständiger Angaben

Die App ist aktuell bewusst als **privater Prototyp** angelegt. Die Quelldokumente enthalten personenbezogene Angaben zu vermutlich noch lebenden Personen und sollen nicht ungeprüft öffentlich publiziert werden.

## Lokal starten

```bash
npm install
npm run dev
```

Produktions-Build:

```bash
npm run build
```

## Datenmodell

Die nummerierten Nachkommen aus der Quelle befinden sich in `src/data/`. Jeder Datensatz enthält u. a.:

- Quellennummer
- Generation
- Geburts-/Sterbedaten und Orte
- Verknüpfung zum Elternteil
- Kinder
- in der Quelle genannte Beziehungen
- Quellseite
- Hinweise zu unsicheren Angaben

Die aktuelle Struktur orientiert sich bewusst an der Nummerierung der historischen Vorlage. Für spätere Funktionen wie einen universellen Verwandtschafts-Finder oder mehrere unabhängige Stammlinien kann das Modell in vollständig normalisierte Personen- und Beziehungsobjekte überführt werden.

## Datenqualität

Offene bzw. schwer lesbare Angaben werden nicht geraten. Sie sind in `docs/DATA_QUALITY.md` dokumentiert.

## Nächste Schritte

1. Datenabgleich gegen die Originalscans
2. Fotos und Dokumentquellen pro Person
3. normalisiertes Beziehungsmodell
4. Verwandtschafts-Finder
5. Editiermodus mit Änderungsprotokoll
6. Datenschutzmodus für lebende Personen
