#!/bin/bash
set -euo pipefail

CONTROL_PLANE_URL="${CONTROL_PLANE_URL:-http://control-plane:8000}"
DEPLOY_API_KEY="${DEPLOY_API_KEY:-dev-deploy-key}"

# Persisted host keys (mounted volume) so restarting this container doesn't
# make every client's SSH client complain about a changed host key.
if [ ! -f /etc/ssh/ssh_host_ed25519_key ]; then
  ssh-keygen -A
fi

# Render the post-receive hook template with real values -- every repo's
# hooks/post-receive is a copy of this file (see opengit-shell.sh).
mkdir -p /usr/local/share/opengit
sed \
  -e "s#__CONTROL_PLANE_URL__#${CONTROL_PLANE_URL}#g" \
  -e "s#__DEPLOY_API_KEY__#${DEPLOY_API_KEY}#g" \
  /usr/local/share/opengit/post-receive.template > /usr/local/share/opengit/post-receive
chmod +x /usr/local/share/opengit/post-receive

mkdir -p /home/git/.ssh /repos
chown -R git:git /home/git /repos
chmod 700 /home/git/.ssh

sync_authorized_keys() {
  curl -s -H "Authorization: Bearer ${DEPLOY_API_KEY}" \
    "${CONTROL_PLANE_URL}/git/keys/authorized_keys" \
    -o /home/git/.ssh/authorized_keys.tmp 2>/dev/null \
    && mv /home/git/.ssh/authorized_keys.tmp /home/git/.ssh/authorized_keys \
    && chown git:git /home/git/.ssh/authorized_keys \
    && chmod 600 /home/git/.ssh/authorized_keys
}

sync_authorized_keys || echo "opengit: initial authorized_keys sync failed (control plane not up yet?) -- will retry"

# Keep picking up newly-registered keys (dhost keys add) without a restart.
(
  while true; do
    sleep 30
    sync_authorized_keys || true
  done
) &

echo "opengit git-server ready. Repos live under /repos. SSH on :22 (git user only)."
exec /usr/sbin/sshd -D -e
