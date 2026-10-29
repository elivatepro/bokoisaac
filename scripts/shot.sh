#!/bin/sh
# Screenshot a page with headless Chrome, for comparing against Paper artboards.
# Usage: sh scripts/shot.sh <url> <width> <height> <out.png>
# e.g.   sh scripts/shot.sh http://localhost:4321/ 1665 3000 /tmp/home-desktop.png
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size="$2,$3" --virtual-time-budget=4000 --screenshot="$4" "$1" >/dev/null 2>&1
echo "$4"
