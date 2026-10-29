#!/usr/bin/env bash
# Corporate TLS proxies (e.g. Zscaler) re-sign HTTPS with their own root CA.
# curl/browsers trust it via the macOS keychain, but Node ships its own CA
# store and doesn't — so server-side fetch() to Supabase fails with
# UNABLE_TO_GET_ISSUER_CERT_LOCALLY. This exports the proxy's root CA(s) so
# `npm run dev` can point NODE_EXTRA_CA_CERTS at them.
#
# Run once on a corporate network:  npm run setup:ca
set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/certs/local-ca.pem"
mkdir -p "$(dirname "$OUT")"
: > "$OUT"

# Grab common corporate proxy roots + any admin-installed roots from the
# System keychain. Adjust the -c filter if your proxy isn't Zscaler.
for NAME in "Zscaler"; do
  security find-certificate -a -c "$NAME" -p \
    /Library/Keychains/System.keychain >> "$OUT" 2>/dev/null || true
  security find-certificate -a -c "$NAME" -p \
    /System/Library/Keychains/SystemRootCertificates.keychain >> "$OUT" 2>/dev/null || true
done

COUNT=$(grep -c "BEGIN CERTIFICATE" "$OUT" || true)
if [ "$COUNT" -eq 0 ]; then
  echo "No corporate CA found. If you're not behind a TLS proxy you don't need this."
  echo "Otherwise edit scripts/setup-ca.sh and set the right certificate name."
  rm -f "$OUT"
  exit 0
fi
echo "Wrote $COUNT certificate(s) to $OUT"
echo "npm run dev will now trust them via NODE_EXTRA_CA_CERTS."
