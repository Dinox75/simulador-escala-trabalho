"""Render the editable SVG PWA marks with isolated headless Chrome."""

import base64
import importlib.util
import pathlib
import socket
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
ICONS = ROOT / "docs" / "demo" / "icons"
SPEC = importlib.util.spec_from_file_location("pwa_smoke", ROOT / "tests" / "browser" / "pwa-smoke.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
Chrome = MODULE.Chrome


def main():
    with tempfile.TemporaryDirectory(prefix="simulador-icon-render-") as profile:
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            port = probe.getsockname()[1]
        chrome = Chrome(port, profile)
        try:
            for source, name in (("escala-source.svg", "icon"),
                                 ("escala-maskable-source.svg", "icon-maskable")):
                for size in (192, 512):
                    chrome.call("Emulation.setDeviceMetricsOverride", {
                        "width": size, "height": size, "deviceScaleFactor": 1,
                        "mobile": False,
                    })
                    chrome.call("Page.navigate", {"url": (ICONS / source).as_uri()})
                    chrome.until("document.readyState === 'complete'")
                    image = chrome.call("Page.captureScreenshot", {
                        "format": "png", "captureBeyondViewport": False,
                    })["data"]
                    (ICONS / f"{name}-{size}.png").write_bytes(base64.b64decode(image))
        finally:
            chrome.close()


if __name__ == "__main__":
    main()
