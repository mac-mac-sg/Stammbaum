# Privates Deployment

Die App enthält personenbezogene Familiendaten. Ein Deployment darf deshalb **nicht als öffentlich erreichbare statische Website** erfolgen. Das Repository bleibt privat und auch die ausgelieferten HTML-/JavaScript-Dateien müssen vor anonymem Zugriff geschützt werden.

## Zielbild

Das Deployment folgt demselben Grundprinzip wie bei Essens-Check: Änderungen werden im Pull Request geprüft und eine Version auf `main` wird automatisch veröffentlicht. Der Unterschied liegt nur im Zielsystem: Statt GitHub Pages wird ein privater HTTPS-Server verwendet.

Ablauf:

1. Pull Request wird durch `.github/workflows/ci.yml` geprüft.
2. Datenvalidierung, TypeScript/Vite-Build, Container-Build und Authentifizierungs-Smoke-Test müssen erfolgreich sein.
3. Nach einem Merge auf `main` startet `.github/workflows/deploy-private.yml` automatisch.
4. GitHub Actions baut den geprüften Produktionscontainer und überträgt ihn verschlüsselt per SSH auf den privaten Server.
5. Das App-Passwort wird als separate Datei übertragen und nicht als Docker-Environment-Variable gespeichert.
6. Caddy startet mit dem konfigurierten Hostnamen und beschafft bzw. erneuert das HTTPS-Zertifikat automatisch.
7. Der Workflow prüft danach, dass anonymer Zugriff `401` liefert und authentifizierter Zugriff sowie `/sw.js` `200` liefern.

Die genealogischen Daten liegen im JavaScript-Bundle. Ein rein clientseitiger Login in React wäre daher nicht ausreichend. Der Zugriffsschutz greift **vor dem Download** von HTML, JavaScript, Manifest, Service Worker und Assets.

## Einmalige Server-Voraussetzungen

Benötigt wird ein kleiner Linux-Server/VPS mit:

- öffentlicher IPv4-Adresse oder DNS-Hostname für SSH,
- installiertem Docker,
- SSH-Zugang,
- freien Ports 80 und 443,
- einem Benutzer, der Docker ohne interaktive Passwortabfrage ausführen darf.

Für den gewünschten Hostnamen, beispielsweise `familie.example.ch`, muss ein DNS-A/AAAA-Eintrag auf diesen Server zeigen. Port 80 und 443 müssen von aussen erreichbar sein, damit Caddy HTTPS automatisch einrichten kann.

## Einmalige GitHub-Secrets

Im Repository unter **Settings → Secrets and variables → Actions** werden folgende Repository- oder Environment-Secrets benötigt:

| Secret | Inhalt |
| --- | --- |
| `STAMMBAUM_DEPLOY_HOST` | IPv4-Adresse oder SSH-Hostname des Servers, ohne Protokoll |
| `STAMMBAUM_DEPLOY_USER` | SSH-Benutzer auf dem Server |
| `STAMMBAUM_DEPLOY_SSH_KEY` | privater SSH-Key für diesen Deployment-Benutzer |
| `STAMMBAUM_DEPLOY_KNOWN_HOSTS` | vertrauenswürdiger `known_hosts`-Eintrag des Servers |
| `STAMMBAUM_DOMAIN` | öffentlicher Hostname **ohne** `https://`, z. B. `familie.example.ch` |
| `STAMMBAUM_USER` | Benutzername für den Zugriff auf die Stammbaum-App |
| `STAMMBAUM_PASSWORD` | langes, einmaliges Passwort für die Stammbaum-App |

Der `known_hosts`-Eintrag sollte auf einem vertrauenswürdigen eigenen Rechner erzeugt und der Host-Key geprüft werden; er wird bewusst nicht während des Deployments mit einem ungeprüften `ssh-keyscan` erzeugt.

Das Workflow-Environment heisst `production`. Optional können dort später Approval-Regeln oder weitere Deployment-Schutzregeln eingerichtet werden.

## Automatisches Deployment

Nach Einrichtung der Secrets genügt der normale Entwicklungsablauf:

```text
initial-app / Feature Branch
        ↓
Pull Request + CI
        ↓
Merge nach main
        ↓
Privat veröffentlichen
        ↓
https://STAMMBAUM_DOMAIN
```

Das Deployment kann zusätzlich über **Actions → Privat veröffentlichen → Run workflow** manuell erneut gestartet werden.

GitHub Actions überträgt kein Repository auf den Server. Übertragen wird nur das fertig gebaute Container-Image sowie die Laufzeit-Passwortdatei. Der Server benötigt deshalb keinen GitHub-Zugriff und keinen Registry-Token.

## Laufzeit auf dem Server

Die Anwendung läuft als Container `stammbaum-villiger` mit `--restart unless-stopped`. Caddy-Daten und Zertifikate liegen in den persistenten Docker-Volumes:

- `stammbaum-caddy-data`
- `stammbaum-caddy-config`

Das Passwort liegt im Home-Verzeichnis des Deployment-Benutzers unter `stammbaum-production/secrets/password` mit restriktiven Dateirechten und wird read-only in den Container gemountet. Im Container wird daraus beim Start nur ein Caddy-kompatibler Passwort-Hash erzeugt.

## Lokaler Container-Test

Der Container kann weiterhin ohne Domain lokal getestet werden:

```bash
docker build -t stammbaum-villiger .

docker run --rm -p 8080:8080 \
  -e STAMMBAUM_USER="familie" \
  -e STAMMBAUM_PASSWORD="ein-langes-einmaliges-passwort" \
  stammbaum-villiger
```

Ohne `STAMMBAUM_SITE_ADDRESS` hört Caddy standardmässig auf Port 8080. Im Produktionsworkflow wird stattdessen `STAMMBAUM_SITE_ADDRESS` auf den konfigurierten Domainnamen gesetzt; dadurch übernimmt Caddy HTTPS direkt auf Port 443.

## Sicherheitsheader

Die mitgelieferte Caddy-Konfiguration setzt unter anderem:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- eine restriktive `Permissions-Policy`

App-Shell und Service Worker werden nicht langfristig durch den Server gecacht; gehashte Build-Assets dürfen privat langfristig gecacht werden.

## PWA und lokale Daten

Nach erfolgreichem HTTPS-Login kann die App vom Browser lokal gecacht und auf unterstützten Smartphones zum Homescreen hinzugefügt werden. Auf einem bereits autorisierten Gerät können Familiendaten daher im Browser-Cache, im Service-Worker-Cache und in `localStorage` verbleiben.

Daher gelten zusätzlich folgende Betriebsregeln:

- nur auf persönlichen, gesperrten Geräten installieren,
- keine Installation auf gemeinsam verwendeten Geräten,
- bei Geräteverlust Browser-/App-Daten remote löschen, sofern das Betriebssystem dies unterstützt,
- Zugangsdaten bei Verdacht auf Kompromittierung sofort ändern,
- lokale JSON-Korrekturexporte wie private Familiendokumente behandeln.

## Deployment-Checkliste

Vor Freigabe an Familienmitglieder prüfen:

- Repository ist weiterhin privat.
- DNS zeigt auf den vorgesehenen privaten Server.
- GitHub-Production-Secrets sind vollständig gesetzt.
- Der GitHub-Workflow `Privat veröffentlichen` ist erfolgreich.
- Die öffentliche URL liefert ohne Authentifizierung `401`.
- HTTPS ist ohne Zertifikatswarnung erreichbar.
- `/`, `/assets/...`, `/sw.js` und `/manifest.webmanifest` sind anonym nicht abrufbar.
- Schutzmodus ist beim Erststart aktiv.
- PWA-Installation wurde auf den tatsächlich verwendeten Smartphone-Plattformen geprüft.
- Zugangsentzug und Löschen lokaler Browserdaten wurden getestet.

## Spätere Ausbaustufe

Für mehrere Familienmitglieder ist ein vorgelagerter Identity-Aware Proxy mit individuellen Benutzerkonten langfristig besser als ein gemeinsam genutztes Passwort. Der aktuelle serverseitige Caddy-Schutz ist bewusst als einfache, fail-closed Baseline umgesetzt und kann später ersetzt werden, ohne das React-Datenmodell ändern zu müssen.
