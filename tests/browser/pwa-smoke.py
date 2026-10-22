"""Chrome smoke test for the local PWA shell; uses only temporary profiles/data.

Run from the repository root with the project Python. Override SIMULADOR_BROWSER
to point at a personal Chrome installation. No project JSON is written.
"""

import base64
import csv
import json
import os
import pathlib
import socket
import struct
import subprocess
import tempfile
import threading
import time
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse


ROOT = pathlib.Path(__file__).resolve().parents[2]
BROWSER = os.environ.get("SIMULADOR_BROWSER", r"C:\Program Files\Google\Chrome\Application\chrome.exe")


class QuietHandler(SimpleHTTPRequestHandler):
    worker_override = None

    def log_message(self, *_args):
        pass

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/docs/demo/sw.js" and self.worker_override:
            body = self.worker_override
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


class QuietServer(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        # Chrome may close idle keep-alive sockets during offline emulation.
        pass


def receive(sock, length):
    data = b""
    while len(data) < length:
        part = sock.recv(length - len(data))
        if not part:
            raise ConnectionError("Chrome closed the DevTools connection")
        data += part
    return data


class Chrome:
    def __init__(self, port, profile):
        self.number = 0
        self.events = []
        self.process = subprocess.Popen([
            BROWSER, "--headless=new", "--disable-extensions", "--disable-gpu",
            "--no-first-run", "--remote-allow-origins=*",
            f"--user-data-dir={profile}", f"--remote-debugging-port={port}",
            "about:blank",
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=.2))
                break
            except Exception:
                time.sleep(.1)
        else:
            raise RuntimeError("Chrome DevTools did not start")
        endpoint = urlparse(next(tab for tab in tabs if tab["type"] == "page")["webSocketDebuggerUrl"])
        self.sock = socket.create_connection((endpoint.hostname, endpoint.port))
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall((f"GET {endpoint.path} HTTP/1.1\r\nHost: {endpoint.hostname}:{endpoint.port}\r\n"
                           f"Upgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n"
                           "Sec-WebSocket-Version: 13\r\n\r\n").encode())
        header = b""
        while b"\r\n\r\n" not in header:
            header += self.sock.recv(4096)
        assert b"HTTP/1.1 101" in header, header.decode(errors="replace")
        self.call("Page.enable")
        self.call("Runtime.enable")
        self.call("Network.enable")
        self.call("Emulation.setDeviceMetricsOverride", {
            "width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True
        })

    def call(self, method, params=None):
        self.number += 1
        number = self.number
        payload = json.dumps({"id": number, "method": method, "params": params or {}}).encode()
        mask = os.urandom(4)
        header = bytes([129, 128 | (len(payload) if len(payload) < 126 else 126)])
        if len(payload) >= 126:
            header += struct.pack("!H", len(payload))
        self.sock.sendall(header + mask + bytes(char ^ mask[index % 4] for index, char in enumerate(payload)))
        while True:
            a, b = receive(self.sock, 2)
            length = b & 127
            if length == 126:
                length = struct.unpack("!H", receive(self.sock, 2))[0]
            elif length == 127:
                length = struct.unpack("!Q", receive(self.sock, 8))[0]
            message = json.loads(receive(self.sock, length))
            if message.get("id") == number:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result", {})
            self.events.append(message)

    def evaluate(self, expression):
        result = self.call("Runtime.evaluate", {
            "expression": expression, "returnByValue": True, "awaitPromise": True
        }).get("result", {})
        if "exceptionDetails" in result:
            raise RuntimeError(result["exceptionDetails"])
        return result.get("value")

    def until(self, expression, expected=lambda value: bool(value)):
        for _ in range(100):
            value = self.evaluate(expression)
            if expected(value):
                return value
            time.sleep(.1)
        raise AssertionError(f"Timed out: {expression}; last value: {value!r}")

    def navigate(self, url):
        self.call("Page.navigate", {"url": url})
        self.until("document.readyState === 'complete' && !!document.querySelector('h1')")

    def screenshot(self, filename):
        target = os.environ.get("SIMULADOR_SCREENSHOT_DIR")
        if target:
            folder = pathlib.Path(target)
            folder.mkdir(parents=True, exist_ok=True)
            image = self.call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})["data"]
            (folder / filename).write_bytes(base64.b64decode(image))

    def close(self):
        try:
            self.call("Browser.close")
        except (ConnectionError, OSError):
            pass
        self.sock.close()
        try:
            self.process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.process.terminate()
            self.process.wait(timeout=10)


def main():
    assert pathlib.Path(BROWSER).is_file(), f"Personal Chrome unavailable: {BROWSER}"
    for name in ("icon", "icon-maskable"):
        for size in (192, 512):
            png = (ROOT / "docs" / "demo" / "icons" / f"{name}-{size}.png").read_bytes()
            assert png[:8] == b"\x89PNG\r\n\x1a\n"
            assert struct.unpack(">II", png[16:24]) == (size, size)
    with socket.socket() as port_check:
        try:
            port_check.bind(("127.0.0.1", 8000))
        except OSError as error:
            raise RuntimeError("Port 8000 is in use; refusing to contact or stop an existing API") from error
    with tempfile.TemporaryDirectory(prefix="simulador-pwa-smoke-", ignore_cleanup_errors=True) as temp:
        base = pathlib.Path(temp)
        handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
        # The optional API explicitly permits this static-server origin via CORS.
        server = QuietServer(("127.0.0.1", 5500), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        origin = f"http://127.0.0.1:{server.server_port}/docs/demo/"
        with socket.socket() as port_socket:
            port_socket.bind(("127.0.0.1", 0))
            debug_port = port_socket.getsockname()[1]
        chrome = Chrome(debug_port, base / "profile")
        try:
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("navigator.serviceWorker?.controller && caches.keys().then(x=>x.some(y=>y.includes('pwa-2')))")
            scope = chrome.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.scope)")
            assert scope == origin, scope
            install_errors = chrome.call("Page.getInstallabilityErrors").get("installabilityErrors", [])
            assert not install_errors, install_errors
            chrome.evaluate("localStorage.setItem('simulador_escala_demo_v014_local', JSON.stringify([{nome:'Teste PWA 6x3',tipo:'ciclo_dias',dias_trabalho:6,dias_folga:3}]))")
            assert chrome.evaluate("getOperationMode()") == "browser-only"
            fixture_file = ROOT / "android-widget" / "app" / "src" / "test" / "resources" / "parity-cases.tsv"
            with fixture_file.open(encoding="utf-8", newline="") as stream:
                fixtures = list(csv.DictReader(stream, delimiter="\t"))
            fixture_json = json.dumps(fixtures, ensure_ascii=True)
            parity = chrome.evaluate("""(() => {
                const core = ScaleCalendarCore;
                const fixtures = """ + fixture_json + """;
                return fixtures.map(c => {
                    const anchor = new Date(c.anchor_date + 'T' + c.anchor_time + ':00');
                    const query = new Date(c.query);
                    if (c.type === 'ciclo_dias') return core.cycleDaysStatus(
                        anchor, query, Number(c.work), Number(c.off));
                    if (c.type === 'ciclo_horas') return core.cycleHoursStatus(
                        anchor, query, Number(c.work), Number(c.off));
                    return core.rotativeStatus(anchor, query, c.turns.split('|'));
                });
            })()""")
            assert parity == [case["expected"] for case in fixtures], parity
            print("CALCULATION: web results match", len(fixtures), "shared native fixture cases")
            print("ONLINE no API: shell installed and browser-only mode")

            chrome.call("Network.emulateNetworkConditions", {
                "offline": True, "latency": 0, "downloadThroughput": 0, "uploadThroughput": 0
            })
            for page in ("simulador.html", "comparador.html", "relatorio.html", "dados.html"):
                chrome.navigate(origin + page + "?browserOnly")
                assert chrome.evaluate("navigator.serviceWorker.controller !== null")
                assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth"), page
                assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Teste PWA 6x3')")
                if page != "dados.html":
                    chrome.until("state.savedScales.some(x=>x.nome==='Teste PWA 6x3')")
                selector = {"simulador.html": "#calendarGrid .calendar-day",
                            "comparador.html": "#comparisonCalendar .compare-day",
                            "relatorio.html": "#reportOutput .report-calendar-day"}.get(page)
                if selector:
                    chrome.until(f"document.querySelectorAll('{selector}').length", lambda value: value > 0)
                chrome.screenshot(f"mobile-{page}.png")
                print("OFFLINE 390px:", page, chrome.evaluate("document.querySelector('h1').textContent.trim()"))
            for page in ("privacidade.html", "termos.html"):
                chrome.navigate(origin + page + "?browserOnly")
                assert chrome.evaluate("navigator.serviceWorker.controller !== null")
                assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth"), page
                assert chrome.evaluate("document.querySelector('main h1').textContent.trim()")
                chrome.screenshot(f"mobile-{page}.png")
                print("OFFLINE legal page:", page)
            chrome.navigate(origin + "dados.html?browserOnly")
            chrome.evaluate("document.querySelector('main a[href=\"privacidade.html\"]').click()")
            chrome.until("location.pathname.endsWith('/privacidade.html')")
            chrome.evaluate("document.querySelector('a[href=\"termos.html\"]').click()")
            chrome.until("location.pathname.endsWith('/termos.html')")
            print("OFFLINE navigation: Dados locais > Privacidade > Termos")
            manifest = chrome.evaluate("fetch('manifest.webmanifest').then(r=>r.json())")
            assert [icon["purpose"] for icon in manifest["icons"]] == [
                "any", "any", "maskable", "maskable"
            ]
            assert chrome.evaluate("Promise.all(['icon-192.png', 'icon-512.png', "
                                   "'icon-maskable-192.png', 'icon-maskable-512.png']"
                                   ".map(n=>fetch('icons/'+n).then(r=>r.ok))).then(x=>x.every(Boolean))")
            assert not [event for event in chrome.events if event.get("method") == "Network.requestWillBeSent"
                        and "127.0.0.1:8000" in event.get("params", {}).get("request", {}).get("url", "")]
            chrome.call("Emulation.setDeviceMetricsOverride", {
                "width": 1280, "height": 800, "deviceScaleFactor": 1, "mobile": False
            })
            for page in ("privacidade.html", "termos.html"):
                chrome.navigate(origin + page + "?browserOnly")
                assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth"), page
                chrome.screenshot(f"desktop-{page}.png")
            chrome.navigate(origin + "comparador.html?browserOnly")
            assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth")
            chrome.screenshot("desktop-comparador.png")
            print("OFFLINE desktop: comparator without horizontal overflow")
            chrome.call("Emulation.setDeviceMetricsOverride", {
                "width": 1024, "height": 768, "deviceScaleFactor": 1, "mobile": False
            })
            assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth")
            chrome.screenshot("tablet-comparador.png")
            chrome.call("Emulation.setDeviceMetricsOverride", {
                "width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True
            })

            chrome.navigate(origin + "dados.html?browserOnly")
            assert "1 escala" in chrome.until("document.querySelector('#storedCount').textContent", lambda v: "escala" in v)
            downloads = base / "downloads"
            downloads.mkdir()
            chrome.call("Browser.setDownloadBehavior", {"behavior": "allow", "downloadPath": str(downloads)})
            chrome.evaluate("document.querySelector('#exportBackup').click()")
            for _ in range(100):
                exported = list(downloads.glob("backup-escalas-*.json"))
                if exported:
                    break
                time.sleep(.1)
            else:
                raise AssertionError("Backup JSON was not downloaded")
            assert json.loads(exported[0].read_text(encoding="utf-8"))["scales"][0]["nome"] == "Teste PWA 6x3"
            invalid = base / "invalid.json"
            invalid.write_text('{"format":"simulador-escalas-backup","version":1,"scales":[{"nome":"Inválida","tipo":"ciclo_dias","dias_trabalho":0,"dias_folga":3}]}', encoding="utf-8")
            valid = base / "valid.json"
            valid.write_text('{"format":"simulador-escalas-backup","version":1,"scales":[{"nome":"Restaurada 12x36","tipo":"ciclo_horas","horas_trabalho":12,"horas_folga":36}]}', encoding="utf-8")
            chrome.call("DOM.enable")
            document = chrome.call("DOM.getDocument")["root"]["nodeId"]
            file_input = chrome.call("DOM.querySelector", {"nodeId": document, "selector": "#importFile"})["nodeId"]
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(invalid)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("document.querySelector('#dataFeedback').textContent", lambda v: "não importado" in v)
            assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Teste PWA 6x3')")
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(valid)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("!document.querySelector('#confirmImport').disabled")
            chrome.evaluate("window.confirm=()=>true; document.querySelector('#confirmImport').click()")
            chrome.until("localStorage.getItem('simulador_escala_demo_v014_local').includes('Restaurada 12x36')")
            print("BACKUP: invalid preserved data; valid replaced after preview and confirmation")

            chrome.call("Network.emulateNetworkConditions", {
                "offline": False, "latency": 0, "downloadThroughput": -1, "uploadThroughput": -1
            })
            data_dir = base / "api" / "data"
            data_dir.mkdir(parents=True)
            (data_dir / "escalas.json").write_text('[{"nome":"Escala API de teste","tipo":"ciclo_dias","dias_trabalho":6,"dias_folga":3}]', encoding="utf-8")
            env = os.environ.copy()
            env.update(PYTHONPATH=str(ROOT), ESCALA_REPOSITORY="json")
            api = subprocess.Popen([str(ROOT / ".venv" / "Scripts" / "python.exe"), "-m", "uvicorn",
                                    "api.app:app", "--host", "127.0.0.1", "--port", "8000"],
                                   cwd=data_dir.parent, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                for _ in range(100):
                    if api.poll() is not None:
                        raise RuntimeError("Temporary API exited before becoming ready")
                    try:
                        urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=.2)
                        break
                    except Exception:
                        time.sleep(.1)
                else:
                    raise RuntimeError("Temporary API did not start")
                chrome.navigate(origin + "simulador.html")
                try:
                    chrome.until("state.savedScaleSource", lambda value: value == "api")
                except AssertionError:
                    print("API DIAGNOSTIC", chrome.evaluate("({url:location.href,mode:getOperationMode(),source:state.savedScaleSource,notice:document.querySelector('#savedScaleSourceNotice')?.textContent})"))
                    print("REQUESTS", [e.get("params", {}).get("request", {}).get("url") for e in chrome.events if e.get("method") == "Network.requestWillBeSent"][-12:])
                    raise
                assert chrome.evaluate("state.savedScales.some(x=>x.nome==='Escala API de teste')")
                print("ONLINE local API: temporary JSON scale listed")
            finally:
                api.terminate()
                api.wait(timeout=10)
            chrome.navigate(origin + "simulador.html")
            chrome.until("state.savedScaleSource", lambda value: value == "local")
            print("ONLINE API off: browser storage restored")
            errors = [event for event in chrome.events if event.get("method") == "Runtime.exceptionThrown"]
            assert not errors, json.dumps(errors[-2:], ensure_ascii=False)
            new_worker = (ROOT / "docs" / "demo" / "sw.js").read_bytes().replace(b"pwa-2", b"pwa-3")
            QuietHandler.worker_override = new_worker
            chrome.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.update())")
            chrome.until("navigator.serviceWorker.getRegistration().then(r=>r.waiting?.state==='installed')")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Restaurada 12x36')")
            print("UPDATE: new shell waits while old page is open")
        finally:
            chrome.close()
        chrome = Chrome(debug_port, base / "profile")
        try:
            chrome.navigate(origin + "dados.html?browserOnly")
            chrome.until("navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js')")
            chrome.until("caches.keys().then(x=>x.some(y=>y.endsWith('pwa-3')))")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Restaurada 12x36')"), chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local')")
            print("UPDATE: new shell active after reopening; localStorage preserved")
        finally:
            chrome.close()
            server.shutdown()


if __name__ == "__main__":
    main()
