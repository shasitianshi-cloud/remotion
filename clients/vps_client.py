#!/usr/bin/env python3
"""Reference VPS client for the GitHub-hosted Remotion runtime.

Credentials are read from REMOTION_GITHUB_TOKEN or GITHUB_TOKEN and are never
written to disk. This file is a reference client only; it is not a daemon.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.github.com"
DEFAULT_REPO = "shasitianshi-cloud/remotion"
WORKFLOW = "render.yml"


def token() -> str:
    value = os.getenv("REMOTION_GITHUB_TOKEN") or os.getenv("GITHUB_TOKEN")
    if not value:
        raise SystemExit("Set REMOTION_GITHUB_TOKEN or GITHUB_TOKEN")
    return value


def api_request(url: str, *, method: str = "GET", payload: dict | None = None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token()}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        return urllib.request.urlopen(req, timeout=60)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"GitHub API {exc.code}: {body}") from exc


def dispatch(repo: str, ref: str, request_path: Path) -> tuple[str, float]:
    raw = request_path.read_bytes()
    obj = json.loads(raw)
    request_id = obj["request_id"]
    sha = hashlib.sha256(raw).hexdigest()
    b64 = base64.b64encode(raw).decode("ascii")
    payload = {
        "ref": ref,
        "inputs": {
            "request_id": request_id,
            "request_b64": b64,
            "request_sha256": sha,
        },
    }
    url = f"{API}/repos/{repo}/actions/workflows/{WORKFLOW}/dispatches"
    api_request(url, method="POST", payload=payload).read()
    print(f"DISPATCHED request_id={request_id} request_sha256={sha}")
    return request_id, time.time()


def find_run(repo: str, ref: str, request_id: str, not_before: float) -> dict | None:
    query = urllib.parse.urlencode({"event": "workflow_dispatch", "branch": ref, "per_page": 50})
    url = f"{API}/repos/{repo}/actions/workflows/{WORKFLOW}/runs?{query}"
    payload = json.load(api_request(url))
    title = f"render-{request_id}"
    for run in payload.get("workflow_runs", []):
        if run.get("display_title") != title:
            continue
        created = run.get("created_at", "")
        if created:
            from datetime import datetime, timezone
            created_ts = datetime.fromisoformat(created.replace("Z", "+00:00")).timestamp()
            if created_ts + 5 < not_before:
                continue
        return run
    return None


def wait_for_run(repo: str, ref: str, request_id: str, not_before: float, timeout: int) -> dict:
    deadline = time.time() + timeout
    run = None
    while time.time() < deadline:
        run = find_run(repo, ref, request_id, not_before) or run
        if run:
            run_id = run["id"]
            run = json.load(api_request(f"{API}/repos/{repo}/actions/runs/{run_id}"))
            print(f"RUN id={run_id} status={run['status']} conclusion={run.get('conclusion')}")
            if run["status"] == "completed":
                return run
        time.sleep(8)
    raise SystemExit("Timed out waiting for workflow run")


def download_artifact(repo: str, run_id: int, destination: Path) -> None:
    payload = json.load(api_request(f"{API}/repos/{repo}/actions/runs/{run_id}/artifacts"))
    artifacts = [a for a in payload.get("artifacts", []) if not a.get("expired")]
    if not artifacts:
        raise SystemExit("No non-expired artifact found")
    artifact = artifacts[0]
    req = urllib.request.Request(artifact["archive_download_url"])
    req.add_header("Authorization", f"Bearer {token()}")
    req.add_header("Accept", "application/vnd.github+json")
    class StripAuthOnRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, original, fp, code, msg, headers, newurl):
            return urllib.request.Request(newurl, method="GET")
    with urllib.request.build_opener(StripAuthOnRedirect).open(req, timeout=120) as response:
        destination.write_bytes(response.read())
    print(f"ARTIFACT_DOWNLOADED id={artifact['id']} path={destination}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("request", type=Path)
    parser.add_argument("--repo", default=DEFAULT_REPO)
    parser.add_argument("--ref", default="main")
    parser.add_argument("--wait", action="store_true")
    parser.add_argument("--timeout", type=int, default=1800)
    parser.add_argument("--artifact", type=Path, default=Path("remotion-artifact.zip"))
    args = parser.parse_args()

    request_id, started = dispatch(args.repo, args.ref, args.request)
    if not args.wait:
        return
    run = wait_for_run(args.repo, args.ref, request_id, started, args.timeout)
    if run.get("conclusion") != "success":
        raise SystemExit(f"Render workflow failed: {run.get('html_url')}")
    download_artifact(args.repo, int(run["id"]), args.artifact)


if __name__ == "__main__":
    main()
