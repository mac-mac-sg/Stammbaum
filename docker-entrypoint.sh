#!/bin/sh
set -eu

: "${STAMMBAUM_USER:?STAMMBAUM_USER muss gesetzt sein}"
: "${STAMMBAUM_PASSWORD:?STAMMBAUM_PASSWORD muss gesetzt sein}"

export STAMMBAUM_PASSWORD_HASH="$(caddy hash-password --plaintext "$STAMMBAUM_PASSWORD")"
unset STAMMBAUM_PASSWORD

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
