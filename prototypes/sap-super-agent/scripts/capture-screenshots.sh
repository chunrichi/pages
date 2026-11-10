#!/usr/bin/env bash
# Regenerate the 39 screenshots used by index.html and docs/.
# Requires a Chromium headless shell (Playwright cache) or override with SA_CHROME_BIN.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/screenshots"
mkdir -p "$OUT"

BIN="${SA_CHROME_BIN:-}"
if [ -z "$BIN" ]; then
  BIN="$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell 2>/dev/null | tail -n 1 || true)"
fi
if [ -z "$BIN" ] || [ ! -x "$BIN" ]; then
  echo "Chromium headless shell not found." >&2
  echo "Install with: npx playwright install chromium" >&2
  echo "Or set SA_CHROME_BIN=/path/to/chrome-headless-shell" >&2
  exit 1
fi

# settings-groups 已被 admin-groups 取代，清掉旧图以保证目录与清单一致（45 张）。
rm -f "$OUT/settings-groups.png"

shoot() {
  local file="$1" url="$2" width="${3:-1440}" height="${4:-900}"
  "$BIN" --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$width,$height" --virtual-time-budget=2500 \
    --screenshot="$OUT/$file.png" "$url" 2>/dev/null
  echo "  ✓ $file.png"
}

app() { shoot "$1" "file://$ROOT/app.html?shot=1#$2" "${3:-1440}" "${4:-900}"; }
app_extra() { shoot "$1" "file://$ROOT/app.html?shot=1&$2#$3"; }

echo "Capturing Web prototype screenshots…"
app auth-welcome "/welcome"
app auth-bind "/bind"
app home "/home"
app home-it "/home?view=it"
app demands-list "/demands"
app demands-kanban "/demands?view=kanban"
app demands-backlog "/demands?view=backlog"
app new-demand-1 "/demands/new"
app new-demand-2 "/demands/new?step=1"
app new-demand-3 "/demands/new?step=2"
app demand-detail "/demands/R-2041"
app doc-review "/demands/R-2041/doc/functional-design"
app release "/demands/R-2045/release"
app tasks-business "/tasks"
app tasks "/tasks?view=it"
app crq-list "/tools/crq?view=it"
app crq-new "/tools/crq/new?view=it"
app crq-templates "/tools/crq/templates?view=it"
app crq-templates-base "/tools/crq/templates?view=it&scope=base"
app crq-template-options "/tools/crq/templates?view=it&edit=1&pull=changeType"
app charm "/tools/charm?view=it"
app queue "/ops/queue?view=it"
app sidebar-collapsed "/ops/queue?view=it&collapse=1"
app agents "/ops/agents?view=it"
app knowledge "/knowledge?view=it"
app settings "/settings"
app admin-groups "/admin?tab=groups"
app admin-integrations "/admin?tab=integrations"
app admin-integration-params "/admin?tab=integrations&sub=params&group=FIN-SH"
app admin-integration-params-edit "/admin?tab=integrations&sub=params&group=FIN-SH&edit=helix"
app admin-integration-params-delegate "/admin?tab=integrations&sub=params&group=SCM-CN&edit=helix"
app admin-maintain "/admin?tab=integrations&maintain=jira"
app admin-audit "/admin?tab=audit"
app admin-denied "/admin?as=member"

echo "Capturing global overlays…"
app_extra notifications "notif=1" "/home"
app_extra command-palette "cmd=1" "/home"

echo "Capturing VSCode prototype screenshots (embedded window)…"
for view in plan task docs agents charm chat sync states; do
  shoot "vscode-$view" "file://$ROOT/vscode.html?embed=1#/$view"
done

echo "Capturing showcase hero…"
shoot showcase "file://$ROOT/index.html?shot=1" 1440 1000

echo "Done: $(ls "$OUT"/*.png | wc -l | tr -d ' ') screenshots in $OUT"
