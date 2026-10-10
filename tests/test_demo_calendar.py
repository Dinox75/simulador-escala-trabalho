"""Browser checks for the demo calendar's shared calculation core."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import pytest


def _browser_executable() -> str | None:
    configured = os.environ.get("SIMULADOR_BROWSER")
    if configured and Path(configured).is_file():
        return configured

    for name in ("msedge", "chrome", "chromium", "chromium-browser"):
        located = shutil.which(name)
        if located:
            return located

    for variable, suffix in (
        ("PROGRAMFILES(X86)", "Microsoft/Edge/Application/msedge.exe"),
        ("PROGRAMFILES", "Google/Chrome/Application/chrome.exe"),
    ):
        root = os.environ.get(variable)
        if root and (Path(root) / suffix).is_file():
            return str(Path(root) / suffix)

    return None


def test_calendar_month_navigation_and_period_presentation() -> None:
    browser = _browser_executable()
    if not browser:
        pytest.skip("Instale Chrome/Edge ou defina SIMULADOR_BROWSER para rodar a verificação do calendário.")

    runner = Path(__file__).parent / "browser" / "calendar-core.html"
    with tempfile.TemporaryDirectory(prefix="simulador-calendar-") as profile:
        browser_args = [
            browser,
            "--headless=new",
            "--disable-extensions",
            "--disable-gpu",
            "--no-first-run",
            f"--user-data-dir={profile}",
            "--dump-dom",
            runner.resolve().as_uri(),
        ]
        if sys.platform.startswith("linux"):
            browser_args.insert(1, "--no-sandbox")

        completed = subprocess.run(
            browser_args,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )

    output = completed.stdout + completed.stderr
    assert completed.returncode == 0, output[-3000:]
    assert "PASS 6:" in output, output[-3000:]
