#!/bin/bash
# Login shell for the 'git' user. Standing in for plain git-shell so we can
# auto-create a bare repo on first push (real git-shell just errors out if
# the repo doesn't exist yet) -- everything else is exactly git-shell's
# usual restriction: only the three git-over-ssh service commands are
# allowed, nothing else, no arbitrary command execution.
set -euo pipefail

# As a *login shell* (not a ForceCommand), sshd invokes us as
# `opengit-shell -c "<command>"` -- the command arrives as $2, not via
# $SSH_ORIGINAL_COMMAND (that variable is only set for ForceCommand /
# authorized_keys "command=" setups). Handle both, since git-shell itself
# supports being used either way.
if [ "${1:-}" = "-c" ]; then
  CMD="${2:-}"
else
  CMD="${SSH_ORIGINAL_COMMAND:-}"
fi

case "$CMD" in
  git-upload-pack\ *|git-receive-pack\ *|git-upload-archive\ *)
    ;;
  *)
    echo "opengit: only 'git clone/fetch/push' is allowed over this connection." >&2
    exit 1
    ;;
esac

SERVICE="${CMD%% *}"
# The remaining arg is the quoted repo path, e.g. git-receive-pack 'myapp.git'
RAW_PATH="${CMD#* }"
RAW_PATH="${RAW_PATH#\'}"
RAW_PATH="${RAW_PATH%\'}"

REPO_NAME="$(basename "$RAW_PATH" .git)"
# Reject anything that isn't a plain name -- no path traversal, no nesting.
if [[ "$REPO_NAME" != "$(basename "$REPO_NAME")" ]] || [[ "$REPO_NAME" == *".."* ]] || [[ -z "$REPO_NAME" ]]; then
  echo "opengit: invalid repository name '$RAW_PATH'" >&2
  exit 1
fi

FULL_PATH="/repos/${REPO_NAME}.git"

if [[ "$SERVICE" == "git-receive-pack" && ! -d "$FULL_PATH" ]]; then
  git init --quiet --bare "$FULL_PATH"
  mkdir -p "$FULL_PATH/hooks"
  cp /usr/local/share/opengit/post-receive "$FULL_PATH/hooks/post-receive"
  chmod +x "$FULL_PATH/hooks/post-receive"
  echo "opengit: created new repository '${REPO_NAME}.git'" >&2
fi

if [[ ! -d "$FULL_PATH" ]]; then
  echo "opengit: repository '${REPO_NAME}.git' does not exist (only git push creates a new one)" >&2
  exit 1
fi

exec git-shell -c "${SERVICE} '${FULL_PATH}'"
