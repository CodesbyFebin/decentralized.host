#!/usr/bin/env bash
# Local watchdog for the self-hosted dhost mesh running on this machine.
#
# Exists because Colima (the Docker runtime this mesh runs under) was found
# to silently stop twice in one session on 2026-09-02, taking down every
# container (Traefik, control-plane, dashboard, all shipped apps) while the
# Cloudflare Tunnel itself stayed up -- so requests got a 502 instead of a
# clear "it's down" signal, and nothing noticed until someone happened to
# check by hand.
#
# Deliberately does NOT use `docker compose` here: this repo lives under
# ~/Desktop, which macOS's TCC sandbox blocks a launchd-spawned process
# from reading (confirmed via a real "Operation not permitted" failure when
# this ran as a LaunchAgent) -- so `docker compose ps/up` would fail to
# even read docker-compose.yml. Operating on already-known dhost-* container
# names directly via the docker socket sidesteps that filesystem read
# entirely; the trade-off is this restarts existing containers but can't
# create new ones from a compose file, which is fine for a watchdog (it
# isn't meant to run first-time setup). See scripts/install-mesh-watchdog.sh
# for why this script's *installed* copy also lives outside ~/Desktop.
#
# Restarts only containers already named dhost-* -- never touches DNS,
# Cloudflare, or anything outside this machine. See
# .github/workflows/mesh-health-check.yml for the external, read-only
# counterpart that watches the public hostnames instead.
set -euo pipefail

# launchd does not inherit the interactive shell's PATH, so colima/docker
# (installed via Homebrew at /usr/local/bin) aren't found without this --
# confirmed via a real "colima not found on PATH" failure when this ran as
# a LaunchAgent.
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

LOG_FILE="${MESH_WATCHDOG_LOG:-$HOME/Library/Logs/dhost-mesh-watchdog.log}"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" >>"$LOG_FILE"
}

log "watchdog run starting"

if ! command -v colima >/dev/null 2>&1; then
  log "ERROR colima not found on PATH -- nothing this script can do"
  exit 1
fi

just_started=0
colima_status="$(colima status 2>&1 || true)"
if ! echo "$colima_status" | grep -qi "colima is running"; then
  log "colima is not running -- starting it"
  if colima start >>"$LOG_FILE" 2>&1; then
    log "colima start succeeded"
    just_started=1
  else
    log "ERROR colima start failed -- see log above"
    exit 1
  fi
else
  log "colima already running"
fi

# Give the docker socket a moment to come up after a cold colima start.
for _ in $(seq 1 15); do
  docker info >/dev/null 2>&1 && break
  sleep 2
done

if ! docker info >/dev/null 2>&1; then
  log "ERROR docker daemon still unreachable after waiting -- giving up this run"
  exit 1
fi

stopped="$(docker ps -a --filter "name=^dhost-" --filter "status=exited" --filter "status=created" --filter "status=dead" --format "{{.Names}}" 2>/dev/null || true)"
if [ -n "$stopped" ]; then
  log "found stopped dhost-* containers: $(echo "$stopped" | tr '\n' ' ')"
  while IFS= read -r name; do
    [ -z "$name" ] && continue
    if docker start "$name" >>"$LOG_FILE" 2>&1; then
      log "started $name"
      just_started=1
    else
      log "ERROR failed to start $name -- see log above"
    fi
  done <<<"$stopped"
else
  log "all dhost-* containers already running"
fi

# A container that was just (re)started (cold colima boot or an individual
# container restart) needs a few seconds before its port actually answers --
# avoid a false "still down" warning on every heal.
if [ "$just_started" -eq 1 ]; then
  sleep 8
fi

# Confirm the mesh actually answers locally (not just that containers exist).
# curl's -w already writes "000" on a connection failure, so don't also
# apply a "|| echo 000" fallback on top of it -- that doubles up into
# "000000" and makes the log line unparseable.
fail=0
for check in "http://localhost:80|200|301|302|404" "http://localhost:8000/healthz|200" "http://localhost:4001|401|200"; do
  url="${check%%|*}"
  rest="${check#*|}"
  code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)"
  code="${code:-000}"
  if echo "|$rest|" | grep -q "|$code|"; then
    log "OK   $url -> $code"
  else
    log "WARN $url -> $code (expected one of: $rest)"
    fail=1
  fi
done

if [ "$fail" -eq 1 ]; then
  log "watchdog run finished with warnings"
else
  log "watchdog run finished clean"
fi
