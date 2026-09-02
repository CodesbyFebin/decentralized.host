"""Automated failover: reschedules a deployment off a node that's gone
offline onto a healthy one, without operator intervention. This is Phase 4
on the public roadmap (https://decentralized.host/roadmap/) -- previously
tracked as planned, not built; this is that.

How it actually works, and why it doesn't need to rebuild anything: every
successful build already gets pushed to the mesh's shared Docker registry
(node-agent/agent.py's build_and_run() pushes to REGISTRY_HOST, e.g.
registry:5000) before it's run. So rescheduling a deployment is just:
reassign it to a different healthy node and mark it "pending" -- that
node's own existing poll_loop()/run_deployment() (node-agent/agent.py)
picks it up on its normal cadence, pulls the already-built image straight
from the registry, and starts it. No new node-agent code needed; this
reuses the exact same pull-and-run path create_deployment() already relies
on for its API-driven deploys.

Explicit non-goals, so this doesn't overstate what it does:
- Single point of state loss: any in-container state (an app's local disk
  writes, an in-memory cache) is gone -- this restarts the image fresh,
  it doesn't migrate a running container's state.
- No DNS/traffic draining: Traefik's dynamic config is rewritten to the
  new node the moment the new container is up; there's a real gap between
  the old node going offline and the new container being ready where the
  subdomain 502s. This is automated recovery, not zero-downtime failover.
- A single-node mesh (the default local dev setup) has nowhere to
  reschedule to -- pick_node() returning None here is the expected,
  correctly-handled case, not a bug.
"""
import json
import logging

from sqlalchemy.orm import Session

from .config import settings
from .models import Deployment, Node, Release
from .scheduler import pick_node, refresh_node_statuses

logger = logging.getLogger("dhost.control-plane.failover")


def check_and_reschedule(db: Session) -> list[str]:
    """Runs one failover check pass. Returns the names of deployments that
    were rescheduled, for tests/logging -- callers that don't care can
    ignore the return value."""
    refresh_node_statuses(db)

    offline_node_ids = {
        n.id for n in db.query(Node).filter(Node.status == "offline").all()
    }
    if not offline_node_ids:
        return []

    stranded = (
        db.query(Deployment)
        .filter(Deployment.status == "running", Deployment.node_id.in_(offline_node_ids))
        .all()
    )
    if not stranded:
        return []

    rescheduled: list[str] = []
    for deployment in stranded:
        old_node = db.get(Node, deployment.node_id)
        old_node_name = old_node.name if old_node else deployment.node_id

        new_node = pick_node(db)  # already excludes non-healthy nodes, incl. the offline one
        if new_node is None:
            logger.warning(
                f"'{deployment.name}' is stranded on offline node '{old_node_name}' "
                "but no other healthy node is available to reschedule to"
            )
            continue

        deployment.node_id = new_node.id
        deployment.container_id = None
        deployment.status = "pending"  # picked up by new_node's own poll_loop
        deployment.error = None

        db.add(Release(
            deployment_id=deployment.id,
            deployment_name=deployment.name,
            message=(
                f"Automated failover: node '{old_node_name}' went offline "
                f"(no heartbeat for {settings.NODE_OFFLINE_SECONDS}s+), "
                f"rescheduling to '{new_node.name}'"
            ),
            image=deployment.image,
            status="rescheduling",
            engine_report=json.dumps([{
                "agent": "automated-failover",
                "status": "rescheduling",
                "summary": f"'{old_node_name}' -> '{new_node.name}'",
                "details": [],
            }]),
        ))

        logger.info(
            f"Rescheduling '{deployment.name}' from offline node '{old_node_name}' "
            f"to '{new_node.name}'"
        )
        rescheduled.append(deployment.name)

    db.commit()
    return rescheduled
