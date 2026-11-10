#!/usr/bin/env bash
# Smoke-test every Web route + VSCode view for uncaught JS errors.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="${SA_CHROME_BIN:-}"
if [ -z "$BIN" ]; then
  BIN="$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell 2>/dev/null | tail -n 1 || true)"
fi
if [ -z "$BIN" ] || [ ! -x "$BIN" ]; then
  echo "Chromium headless shell not found. Set SA_CHROME_BIN or run: npx playwright install chromium" >&2
  exit 1
fi

TMP="${TMPDIR:-/tmp}/sa-smoke-$$.png"
FAIL=0
check() {
  local label="$1" url="$2"
  local out
  out="$("$BIN" --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,900 \
    --virtual-time-budget=1200 --screenshot="$TMP" "$url" 2>&1 \
    | grep -E "CONSOLE.*(Uncaught|TypeError|ReferenceError)" | head -1 || true)"
  if [ -n "$out" ]; then
    echo "  ✗ $label — $out"
    FAIL=1
  else
    echo "  ✓ $label"
  fi
}

ROUTES=(
  /welcome /verify /bind /rebind
  /home "/home?view=it"
  /demands /demands/new
  /demands/R-2041 /demands/R-2041/doc/functional-design /demands/R-2041/doc/tech-design
  /demands/R-2045/release
  /tasks "/tasks?view=it"
  /tools/crq /tools/crq/new /tools/crq/templates
  "/tools/crq/templates?view=it" "/tools/crq/templates?view=it&scope=base"
  "/tools/crq/templates?view=it&edit=1&pull=changeType"
  /tools/charm /ops/queue /ops/agents /knowledge
  /settings "/settings?tab=account" "/settings?tab=notify"
  "/settings?tab=groups" "/settings?tab=integration" "/settings?tab=security"
  /admin "/admin?tab=groups" "/admin?tab=integrations" "/admin?tab=audit"
  "/admin?as=member" "/admin?as=groupadmin"
  "/admin?tab=integrations&maintain=jira"
  "/admin?tab=integrations&sub=params&group=FIN-SH"
  "/admin?tab=integrations&sub=params&group=FIN-SH&edit=helix"
  "/admin?tab=integrations&sub=params&group=SCM-CN&edit=helix"
  "/ops/queue?view=it&collapse=1"
)
echo "Web routes"
for route in "${ROUTES[@]}"; do
  check "$route" "file://$ROOT/app.html?shot=1#${route}"
done

echo "VSCode views"
for view in plan task docs agents charm chat sync states; do
  check "vscode/$view" "file://$ROOT/vscode.html?embed=1#/$view"
done

rm -f "$TMP"
if [ "$FAIL" -ne 0 ]; then
  echo "Smoke test failed." >&2
  exit 1
fi
echo "All routes clean."
