"""Static PWA contract and backup validation in an isolated Chrome profile."""

from __future__ import annotations

import html
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urljoin

import pytest


DEMO = Path(__file__).resolve().parents[1] / "docs" / "demo"


def test_manifest_is_scoped_to_demo_and_has_real_png_icons() -> None:
    manifest = json.loads((DEMO / "manifest.webmanifest").read_text(encoding="utf-8"))
    for base in (
        "https://dinox75.github.io/simulador-escala-trabalho/demo/",
        "http://127.0.0.1:5500/docs/demo/",
    ):
        manifest_url = urljoin(base, "manifest.webmanifest")
        assert urljoin(manifest_url, manifest["start_url"]) == urljoin(base, "simulador.html")
        assert urljoin(manifest_url, manifest["scope"]) == base
    assert manifest["display"] == "standalone"
    assert manifest["id"] == "./simulador.html"
    assert manifest["start_url"] == "./simulador.html"
    assert manifest["scope"] == "./"
    assert {icon["src"] for icon in manifest["icons"]} == {
        "icons/icon-v2-192.png", "icons/icon-v2-512.png",
        "icons/icon-maskable-v2-192.png", "icons/icon-maskable-v2-512.png",
    }
    for icon in manifest["icons"]:
        width, height = map(int, icon["sizes"].split("x"))
        content = (DEMO / icon["src"]).read_bytes()
        assert content[:8] == b"\x89PNG\r\n\x1a\n"
        assert (int.from_bytes(content[16:20], "big"), int.from_bytes(content[20:24], "big")) == (width, height)
    assert {icon["sizes"] for icon in manifest["icons"]} == {"192x192", "512x512"}


def test_every_demo_page_has_only_local_runtime_assets_in_precache() -> None:
    worker = (DEMO / "sw.js").read_text(encoding="utf-8")
    shell = worker.split("const SHELL = [", 1)[1].split("];", 1)[0]
    precached = set(re.findall(r'"([^"]+)"', shell))
    assert {"./", "simulador.html", "comparador.html", "relatorio.html", "dados.html"} <= precached
    for page in DEMO.glob("*.html"):
        source = page.read_text(encoding="utf-8")
        assert page.name in precached
        assert 'href="manifest.webmanifest"' in source
        assert 'src="pwa.js"' in source
        for resource in re.findall(r'<script[^>]+src="([^"]+)"', source):
            assert not resource.startswith("http")
            assert (DEMO / resource).is_file(), resource
            assert resource in precached, resource
        for resource in re.findall(r'<link[^>]+(?:rel="stylesheet"|rel="manifest"|rel="icon"|rel="apple-touch-icon")[^>]+href="([^"]+)"', source):
            assert not resource.startswith("http")
            assert (DEMO / resource).is_file(), resource
            assert resource in precached, resource
    install = worker.split('self.addEventListener("install"', 1)[1].split('self.addEventListener("message"', 1)[0]
    assert "skipWaiting" not in install
    assert 'event.data?.type === "SKIP_WAITING"' in worker
    assert "event.waitUntil(self.skipWaiting())" in worker
    assert "url.origin !== self.location.origin" in worker


def test_backup_core_accepts_valid_scales_and_rejects_bad_data_in_chrome() -> None:
    if os.environ.get("CI") and not os.environ.get("SIMULADOR_BROWSER"):
        pytest.skip("Defina SIMULADOR_BROWSER para executar Chrome headless no CI.")
    browser = os.environ.get("SIMULADOR_BROWSER") or r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not Path(browser).is_file():
        pytest.skip("Chrome não encontrado; defina SIMULADOR_BROWSER para testar o backup.")
    runner = Path(__file__).parent / "browser" / "backup-core.html"
    with tempfile.TemporaryDirectory(prefix="simulador-backup-chrome-", ignore_cleanup_errors=True) as profile:
        args = [browser, "--headless=new", "--disable-extensions", "--disable-gpu",
                "--no-first-run", f"--user-data-dir={profile}", "--dump-dom", runner.as_uri()]
        if sys.platform.startswith("linux"):
            args.insert(1, "--no-sandbox")
        result = subprocess.run(args, capture_output=True, text=True, timeout=60, check=False)
    assert result.returncode == 0, result.stderr[-2000:]
    error = re.search(r'data-test-error="([^"]+)"', result.stdout)
    assert "PASS 12:" in result.stdout, html.unescape(error.group(1)) if error else result.stdout[-2000:]
