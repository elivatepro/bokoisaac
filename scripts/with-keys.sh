#!/bin/sh
# Runs a command with API keys loaded from the macOS Keychain, so no key is stored in a file.
# On Cloudflare the same variables come from the project's encrypted secrets instead.
# Usage: sh scripts/with-keys.sh astro dev

key() { security find-generic-password -s "$1" -w 2>/dev/null; }

if [ -z "$NOTION_TOKEN" ] && command -v security >/dev/null 2>&1; then
  NOTION_TOKEN=$(key notion_api)
  BUTTONDOWN_API_KEY=$(key buttondown_api)
  RESEND_API_KEY=$(key resend_api)
  export NOTION_TOKEN BUTTONDOWN_API_KEY RESEND_API_KEY
fi

exec "$@"
