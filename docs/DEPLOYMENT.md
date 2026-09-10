# Privates Deployment

Die App enthält personenbezogene Familiendaten. Ein Deployment darf deshalb **nicht als öffentlich erreichbare statische Website** erfolgen. Das Repository bleibt privat und auch die ausgelieferten HTML-/JavaScript-Dateien müssen vor anonymem Zugriff geschützt werden.

## Empfohlenes Zielbild

Die Anwendung wird als kleiner Container betrieben:

1. Vite erzeugt den statischen Produktions-Build.
2. Caddy liefert ausschliesslich den fertigen `dist`-Ordner aus.
3. Der Container startet nur, wenn `STAMMBAUM_USER` und `STAMMBAUM_PASSWORD` gesetzt sind.
4. Caddy schützt **jede Route und jedes Asset** mit HTTP Basic Authentication.
5. Vor dem Container liegt ein HTTPS-Endpunkt des gewählten Hosters bzw. Reverse Proxys.
6. Optional kann später zusätzlich ein Identity-Aware Proxy mit individuellen Familien-Logins vorgeschaltet werden.

Wichtig: Ein rein clientseitiger Login in React wäre für diesen Anwendungsfall nicht ausreichend. Die genealogischen Daten befinden sich im ausgelieferten JavaScript-Bundle und müssen deshalb bereits **vor dem Download der App-Dateien** geschützt werden.

## Container lokal bauen

```bash
docker build -t stammbaum-villiger .
```

Lokal starten:

```bash
docker run --rm -p 8080:8080 \
  -e STAMMBAUM_USER="familie" \
  -e STAMMBAUM_PASSWORD="ein-langes-einmaliges-passwort" \
  stammbaum-villiger
```

Danach ist die App unter `http://localhost:8080` erreichbar. Für ein echtes Smartphone-Deployment muss der externe Zugriff über **HTTPS** erfolgen, damit Service Worker und PWA-Funktionen zuverlässig verfügbar sind.

## Secrets

`STAMMBAUM_USER` und `STAMMBAUM_PASSWORD` gehören ausschliesslich in die Secret-/Environment-Verwaltung des Hosting-Systems. Sie dürfen nicht in Git, `.env`-Dateien im Repository, Screenshots oder Dokumentation mit echten Werten geschrieben werden.

Der Container erzeugt beim Start aus dem Passwort einen Caddy-kompatiblen Hash. Das Klartextpasswort wird nicht in die Caddy-Konfiguration geschrieben.

## Sicherheitsheader

Die mitgelieferte Caddy-Konfiguration setzt unter anderem:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- eine restriktive `Permissions-Policy`

App-Shell und Service Worker werden nicht langfristig durch den Server gecacht; gehashte Build-Assets dürfen privat langfristig gecacht werden.

## PWA und lokale Daten

Nach erfolgreichem HTTPS-Login kann die App vom Browser lokal gecacht und auf unterstützten Smartphones zum Homescreen hinzugefügt werden. Das bedeutet zugleich: Auf einem bereits autorisierten Gerät können Familiendaten im Browser-Cache, im Service-Worker-Cache und in `localStorage` verbleiben.

Daher gelten zusätzlich folgende Betriebsregeln:

- nur auf persönlichen, gesperrten Geräten installieren,
- keine Installation auf gemeinsam verwendeten Geräten,
- bei Geräteverlust Browser-/App-Daten remote löschen, sofern das Betriebssystem dies unterstützt,
- Zugangsdaten bei Verdacht auf Kompromittierung sofort ändern,
- lokale JSON-Korrekturexporte wie private Familiendokumente behandeln.

## Deployment-Checkliste

Vor Freigabe an Familienmitglieder prüfen:

- Repository ist weiterhin privat.
- Die öffentliche URL liefert ohne Authentifizierung **keine** App-Datei aus.
- HTTPS ist aktiv und ohne Zertifikatswarnung erreichbar.
- Ein anonymer Aufruf von `/`, `/assets/...`, `/sw.js` und `/manifest.webmanifest` wird abgewehrt.
- Schutzmodus ist beim Erststart aktiv.
- PWA-Installation wurde auf mindestens einem Android- und einem iOS-Gerät geprüft.
- Abmelden/Entzug des Serverzugangs und Löschen lokaler Browserdaten wurden getestet.

## Spätere Ausbaustufe

Für mehrere Familienmitglieder ist ein vorgelagerter Identity-Aware Proxy mit individuellen Benutzerkonten die bessere Dauerlösung als ein gemeinsam genutztes Passwort. Der Caddy-Schutz kann bis dahin als fail-closed Basisschutz dienen. Ein Wechsel auf individuelle Authentifizierung sollte erst erfolgen, wenn das konkrete Hosting-Ziel feststeht.
