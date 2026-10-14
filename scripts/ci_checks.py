#!/usr/bin/env python3
"""Dependency-free CI checks. Run from any directory in a clean checkout."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import sys
import threading

ROOT = Path(__file__).resolve().parents[1]


def run(*command, **kwargs):
    print("+ " + " ".join(command), flush=True)
    return subprocess.run(command, cwd=ROOT, check=True, timeout=120, **kwargs)


def main():
    tracked = subprocess.check_output(
        ["git", "ls-files", "-z"], cwd=ROOT
    ).decode().split("\0")
    for name in filter(None, tracked):
        path = ROOT / name
        if path.suffix == ".py":
            compile(path.read_text(encoding="utf-8"), name, "exec")
        elif path.suffix in {".js", ".mjs"}:
            run("node", "--check", "--input-type=module",
                input=path.read_text(encoding="utf-8"), text=True)

    run(sys.executable, "scripts/build_content.py")
    run("git", "diff", "--exit-code", "--",
        "index.html", "nest", "archive", "sitemap.xml")
    # Also catch newly generated routes that were not committed.
    status = subprocess.check_output(
        ["git", "status", "--porcelain", "--",
         "index.html", "nest", "archive", "sitemap.xml"], cwd=ROOT
    ).decode()
    if status:
        raise RuntimeError("Generated content is not committed:\n" + status)

    run("node", "scripts/test_game.mjs")
    run("node", "scripts/test_patrol_upgrade.mjs")

    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        run(sys.executable, "scripts/check_links.py", "--base-url",
            f"http://127.0.0.1:{server.server_port}")
    finally:
        server.shutdown()
        server.server_close()
        worker.join()
    print("PASS: syntax, content build/freshness, game logic and local links.")


if __name__ == "__main__":
    main()
