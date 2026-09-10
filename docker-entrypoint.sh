#!/bin/sh
set -eu

: "${STAMMBAUM_USER:?STAMMBAUM_USER muss gesetzt sein}"

if [ -n "${STAMMBAUM_PASSWORD_FILE:-}" ]; then
  if [ ! -r "$STAMMBAUM_PASSWORD_FILE" ]; then
    echo "STAMMBAUM_PASSWORD_FILE ist nicht lesbar: $STAMMBAUM_PASSWORD_FILE" >&2
    exit 1
  fi
  STAMMBAUM_PASSWORD="$(cat "$STAMMBAUM_PASSWORD_FILE")"
else
  : "${STAMMBAUM_PASSWORD:?STAMMBAUM_PASSWORD oder STAMMBAUM_PASSWORD_FILE muss gesetzt sein}"
fi

if [ -z "$STAMMBAUM_PASSWORD" ]; then
  echo "Das Stammbaum-Passwort darf nicht leer sein." >&2
  exit 1
fi

export STAMMBAUM_PASSWORD_HASH="$(caddy hash-password --plaintext "$STAMMBAUM_PASSWORD")"
unset STAMMBAUM_PASSWORD

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
