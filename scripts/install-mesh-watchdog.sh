#!/usr/bin/env bash
# Installs the mesh watchdog as a per-user LaunchAgent so it runs on a
# schedule without a terminal open. User-level (~/Library/LaunchAgents),
# not a system LaunchDaemon -- no sudo, and it only runs while this user
# is logged in, which matches how Colima itself runs (per-user).
#
# The actual runtime copy of the script is installed to
# ~/Library/Application Support/dhost-mesh-watchdog/, NOT run in place from
# this repo: launchd-spawned processes can't read files under ~/Desktop on
# this Mac (confirmed via a real "Operation not permitted" failure), so a
# script invoked directly from a repo checked out there would fail before
# it even started. Re-run this installer after editing
# scripts/mesh-watchdog.sh to sync the change to the installed copy.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$HOME/Library/Application Support/dhost-mesh-watchdog"
RUNTIME_SCRIPT="$RUNTIME_DIR/mesh-watchdog.sh"
PLIST_DEST="$HOME/Library/LaunchAgents/host.decentralized.mesh-watchdog.plist"

mkdir -p "$RUNTIME_DIR"
cp "$REPO_DIR/scripts/mesh-watchdog.sh" "$RUNTIME_SCRIPT"
chmod +x "$RUNTIME_SCRIPT"

mkdir -p "$HOME/Library/LaunchAgents"
sed -e "s|__RUNTIME_DIR__|$RUNTIME_DIR|g" -e "s|__HOME__|$HOME|g" \
  "$REPO_DIR/scripts/mesh-watchdog.plist" >"$PLIST_DEST"

launchctl unload "$PLIST_DEST" >/dev/null 2>&1 || true
launchctl load "$PLIST_DEST"

echo "Installed runtime script: $RUNTIME_SCRIPT"
echo "Installed and loaded: $PLIST_DEST"
echo "Runs every 15 minutes, plus once now."
echo "Logs: ~/Library/Logs/dhost-mesh-watchdog.log"
echo "To remove: launchctl unload \"$PLIST_DEST\" && rm \"$PLIST_DEST\" \"$RUNTIME_SCRIPT\""
