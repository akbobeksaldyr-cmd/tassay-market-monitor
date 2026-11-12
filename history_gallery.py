"""Public BSH1–BSH4 screenshot manifest from GitHub.

A 5-minute cache avoids API rate limits. Only files from explicit BSH stage
folders and three verified legacy screenshots in repository root are shown.
Local bundled images are used when GitHub is temporarily unavailable.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

REPO = "akbobeksaldyr-cmd/tassay-market-monitor"
STAGES = ("BSH1", "BSH2", "BSH3", "BSH4")
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
ROOT = Path(__file__).resolve().parent / "history-screenshots"
LEGACY_FILES = {
    "BSH1": "первый вариант.png",
    "BSH2": "второй вариант.png",
    "BSH3": "третий вариант.png",
}
TREE_API = f"https://api.github.com/repos/{REPO}/git/trees/main?recursive=1"
_cache: dict = {"until": 0.0, "payload": None}


def safe_image(stage: str, filename: str) -> bool:
    return (
        stage in STAGES
        and bool(filename)
        and filename not in {".", ".."}
        and "/" not in filename
        and "\\" not in filename
        and not filename.startswith(".")
        and Path(filename).suffix.lower() in EXTENSIONS
    )


def _local_images() -> dict:
    out = {stage: [] for stage in STAGES}
    for stage in STAGES:
        folder = ROOT / stage
        if not folder.is_dir():
            continue
        for file in sorted(folder.iterdir(), key=lambda p: p.name.lower()):
            if file.is_file() and safe_image(stage, file.name):
                out[stage].append({
                    "name": file.name,
                    "url": f"/history-screenshots/{stage}/{quote(file.name, safe='')}",
                })
    for stage, filename in LEGACY_FILES.items():
        if (ROOT.parent / filename).is_file():
            out[stage].insert(0, {
                "name": filename,
                "url": f"/history-legacy-image/{stage}",
            })
    return out


def _remote_images(tree: dict) -> dict:
    out = {stage: [] for stage in STAGES}
    if not isinstance(tree, dict) or tree.get("truncated"):
        raise ValueError("Incomplete or invalid GitHub tree response")
    entries = tree.get("tree")
    if not isinstance(entries, list):
        raise ValueError("Missing GitHub tree data")
    for entry in entries:
        if not isinstance(entry, dict) or entry.get("type") != "blob":
            continue
        path = entry.get("path", "")
        parts = path.split("/")
        if len(parts) == 1:
            for legacy_stage, legacy_name in LEGACY_FILES.items():
                if path == legacy_name:
                    out[legacy_stage].append({
                        "name": legacy_name,
                        "url": f"/history-legacy-image/{legacy_stage}",
                    })
            continue
        if len(parts) != 3 or parts[0] != "history-screenshots":
            continue
        stage, name = parts[1:]
        if not safe_image(stage, name):
            continue
        # A fixed public raw.githubusercontent.com origin, no user-controlled host.
        url = (
            f"https://raw.githubusercontent.com/{REPO}/main/"
            f"history-screenshots/{stage}/{quote(name, safe='')}"
        )
        out[stage].append({"name": name, "url": url})
    for stage in STAGES:
        out[stage].sort(key=lambda x: x["name"].lower())
        out[stage] = out[stage][:75]
    return out


def list_study_images() -> dict:
    now = time.monotonic()
    if _cache["payload"] is not None and now < _cache["until"]:
        return _cache["payload"]
    try:
        req = Request(
            TREE_API,
            headers={
                "User-Agent": "TassayResearchHistory/1.0",
                "Accept": "application/vnd.github+json",
            },
        )
        with urlopen(req, timeout=6) as response:
            raw = response.read(1000001)
        if len(raw) > 1000000:
            raise ValueError("Oversized GitHub tree response")
        images = _remote_images(json.loads(raw))
        origin = "github"
    except (HTTPError, URLError, OSError, ValueError, UnicodeError, TimeoutError):
        images = _local_images()
        origin = "deployed_snapshot"
    payload = {"stages": images, "origin": origin, "update_interval_seconds": 300}
    _cache.update({"payload": payload, "until": now + 300})
    return payload
