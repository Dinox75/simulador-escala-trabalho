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
        size = len(payload)
        header = bytes([129, 128 | (size if size < 126 else 126 if size < 65536 else 127)])
        if 126 <= size < 65536:
            header += struct.pack("!H", len(payload))
        elif size >= 65536:
            header += struct.pack("!Q", len(payload))
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
        self.until(f"location.href === {json.dumps(url)} && document.readyState === 'complete' && !!document.querySelector('h1')")

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
            scripts = sorted((ROOT / "docs" / "demo").glob("*.js"))
            for script in scripts:
                chrome.evaluate("new Function(" + json.dumps(script.read_text(encoding="utf-8")) + "); true")
            print("JAVASCRIPT SYNTAX:", len(scripts), "demo scripts compiled in Chrome")
            chrome.until("navigator.serviceWorker?.controller && caches.keys().then(x=>x.some(y=>y.includes('pwa-4')))")
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

            assert chrome.evaluate("document.body.dataset.resultReady") == "false"
            assert chrome.evaluate("document.querySelector('#startDate')?.value") == ""
            chrome.screenshot("first-visit-simulador.png")
            chrome.evaluate("document.querySelector('#guideConfigure').click(); document.querySelector('[data-guide-flow=admin]').click()")
            assert chrome.evaluate("document.querySelector('#startDate').value") == ""
            chrome.screenshot("first-visit-5x2.png")
            chrome.evaluate("document.querySelector('#simulatorForm').requestSubmit()")
            assert chrome.evaluate("document.body.dataset.resultReady") == "false"
            assert "data real" in chrome.evaluate("document.querySelector('#simulatorFeedback').textContent")
            chrome.evaluate("document.querySelector('#startDate').value='2026-10-19'; document.querySelector('#startDate').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#simulatorForm').requestSubmit()")
            chrome.until("document.body.dataset.resultReady === 'true'")
            assert "Dia" in chrome.evaluate("document.querySelector('#guideResultSummary').textContent")
            chrome.evaluate("document.querySelector('#guideSave').click()")
            assert chrome.evaluate("JSON.parse(localStorage.getItem('simulador_escala_active_v1')).start") == "2026-10-19"
            print("GUIDE: explicit 5x2 anchor, preview and local confirmed selection")

            chrome.evaluate("selectGuideFlow('hours'); document.querySelector('#startDateTime').value='2026-10-01T18:00'; document.querySelector('#queryDateTime').value='2026-10-02T05:59'; document.querySelector('#simulatorForm').requestSubmit()")
            chrome.until("document.body.dataset.resultReady === 'true'")
            assert "Trabalhando" in chrome.evaluate("document.querySelector('#guideResultSummary').textContent")
            assert "06:00" in chrome.evaluate("document.querySelector('#guideResultSummary').textContent")
            chrome.evaluate("document.querySelector('#queryDateTime').value='2026-10-02T06:00'; document.querySelector('#simulatorForm').requestSubmit()")
            chrome.until("document.querySelector('#guideResultSummary').textContent.includes('Folga')")
            print("GUIDE: 12x36 changes at 06:00")

            chrome.evaluate("selectGuideFlow('alternative')")
            assert chrome.evaluate("document.querySelectorAll('#alternativeWeek .week-off').length") == 2
            chrome.evaluate("document.querySelector('#alternativeOffStart').focus()")
            assert chrome.evaluate("document.activeElement.id") == "alternativeOffStart"
            chrome.call("Input.dispatchKeyEvent", {"type": "keyDown", "key": "ArrowUp", "code": "ArrowUp", "windowsVirtualKeyCode": 38})
            chrome.call("Input.dispatchKeyEvent", {"type": "keyUp", "key": "ArrowUp", "code": "ArrowUp", "windowsVirtualKeyCode": 38})
            assert chrome.evaluate("document.querySelector('#alternativeOffStart').value") == "5"
            assert chrome.evaluate("[...document.querySelectorAll('#alternativeWeek .week-off')].map(x=>x.textContent.slice(0,3))") == ["sex", "sáb"]
            chrome.call("Input.dispatchKeyEvent", {"type": "keyDown", "key": "ArrowDown", "code": "ArrowDown", "windowsVirtualKeyCode": 40})
            chrome.call("Input.dispatchKeyEvent", {"type": "keyUp", "key": "ArrowDown", "code": "ArrowDown", "windowsVirtualKeyCode": 40})
            assert chrome.evaluate("document.querySelector('#alternativeOffStart').value") == "6"
            assert chrome.evaluate("[...document.querySelectorAll('#alternativeWeek .week-off')].map(x=>x.textContent.slice(0,3))") == ["dom", "sáb"]
            chrome.evaluate("document.querySelector('#alternativeOffStart').scrollIntoView({block:'center'})")
            select_point = chrome.evaluate("(() => { const r=document.querySelector('#alternativeOffStart').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()")
            chrome.call("Input.dispatchMouseEvent", {"type": "mousePressed", "button": "left", "clickCount": 1, **select_point})
            chrome.call("Input.dispatchMouseEvent", {"type": "mouseReleased", "button": "left", "clickCount": 1, **select_point})
            chrome.screenshot("alternative-select-open.png")
            chrome.call("Input.dispatchKeyEvent", {"type": "keyDown", "key": "Escape", "code": "Escape", "windowsVirtualKeyCode": 27})
            chrome.call("Input.dispatchKeyEvent", {"type": "keyUp", "key": "Escape", "code": "Escape", "windowsVirtualKeyCode": 27})
            chrome.evaluate("document.querySelector('#startDate').value='2026-10-06'; document.querySelector('#simulatorForm').requestSubmit()")
            assert "segunda-feira" in chrome.evaluate("document.querySelector('#simulatorFeedback').textContent")
            assert chrome.evaluate("document.body.dataset.resultReady") == "false"
            chrome.evaluate("document.querySelector('#startDate').value='2026-10-05'; document.querySelector('#simulatorForm').requestSubmit()")
            chrome.until("document.body.dataset.resultReady === 'true'")
            assert chrome.evaluate("document.querySelector('#alternativeAnchorHelp').textContent.includes('segunda-feira')")
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.body.dataset.resultReady === 'true'")
            assert chrome.evaluate("document.querySelector('#startDate').value") == "2026-10-19"
            print("GUIDE: alternative week and confirmed selection restored")

            confirmed_record = chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')")
            clock_script = """(() => {
                const RealDate = Date;
                window.__testClock = localStorage.getItem('__simulator_test_clock') || '2026-10-02T06:00:00';
                window.Date = class extends RealDate {
                    constructor(...args) { super(...(args.length ? args : [window.__testClock])); }
                    static now() { return new RealDate(window.__testClock).getTime(); }
                };
            })();"""
            clock_injection = chrome.call("Page.addScriptToEvaluateOnNewDocument", {"source": clock_script})["identifier"]
            hours_record = {"version": 1, "flow": "hours", "start": "2026-10-01T18:00",
                            "queryTime": "05:59", "scale": {"nome": "12x36", "tipo": "ciclo_horas",
                            "horas_trabalho": 12, "horas_folga": 36}}
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(json.dumps(hours_record)) + ")")
            chrome.navigate(origin + "index.html?browserOnly")
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.querySelector('#queryDateTime')?.value === '2026-10-02T06:00' && document.body.dataset.resultReady === 'true'")
            assert chrome.evaluate("document.querySelector('#resultTitle').textContent.includes('Folga')")
            moment = chrome.evaluate("document.querySelector('#resultMoment').textContent")
            assert moment.startswith("Consulta atual: 02/10/2026") and "06:00" in moment, moment
            chrome.evaluate("document.querySelector('#guideCorrect').click(); document.querySelector('#queryDateTime').value='2026-10-02T05:59'; document.querySelector('#queryDateTime').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#queryDateTime').dispatchEvent(new Event('change',{bubbles:true}))")
            assert chrome.evaluate("getComputedStyle(document.querySelector('#queryDateTime').closest('label')).display !== 'none'")
            chrome.until("document.querySelector('#resultTitle').textContent.includes('Trabalhando')")
            chrome.evaluate("window.__testClock='2026-10-03T18:00:00'; refreshLiveQuery()")
            assert chrome.evaluate("document.querySelector('#queryDateTime').value") == "2026-10-02T05:59"
            assert chrome.evaluate("state.guide.queryMode") == "manual"
            chrome.evaluate("document.querySelector('#guideNow').click()")
            chrome.until("document.querySelector('#queryDateTime').value === '2026-10-03T18:00' && document.querySelector('#resultTitle').textContent.includes('Trabalhando')")
            chrome.evaluate("window.__testClock='2026-10-04T06:00:00'; refreshLiveQuery()")
            chrome.until("document.querySelector('#queryDateTime').value === '2026-10-04T06:00' && document.querySelector('#resultTitle').textContent.includes('Folga')")
            print("LIVE 12x36: reopened at current minute, historical query held, live rollover refreshed")

            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + ")")
            chrome.evaluate("localStorage.setItem('__simulator_test_clock','2026-10-24T10:00:00')")
            chrome.navigate(origin + "index.html?browserOnly")
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.querySelector('#queryDate')?.value === '2026-10-24' && document.body.dataset.resultReady === 'true'")
            assert chrome.evaluate("document.querySelector('#resultTitle').textContent.includes('Folga')")
            chrome.evaluate("document.querySelector('#guideCorrect').click(); document.querySelector('#queryDate').value='2026-10-23'; document.querySelector('#queryDate').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#queryDate').dispatchEvent(new Event('change',{bubbles:true}))")
            assert chrome.evaluate("getComputedStyle(document.querySelector('#queryDate').closest('label')).display !== 'none'")
            chrome.until("document.querySelector('#resultTitle').textContent.includes('Trabalhando')")
            chrome.evaluate("window.__testClock='2026-10-25T10:00:00'; refreshLiveQuery()")
            assert chrome.evaluate("document.querySelector('#queryDate').value") == "2026-10-23"
            chrome.evaluate("document.querySelector('#guideNow').click()")
            chrome.until("document.querySelector('#queryDate').value === '2026-10-25' && document.querySelector('#resultTitle').textContent.includes('Folga')")
            chrome.call("Page.removeScriptToEvaluateOnNewDocument", {"identifier": clock_injection})
            chrome.evaluate("localStorage.removeItem('__simulator_test_clock')")
            print("LIVE days: midnight rollover and historical date remain distinct")

            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', JSON.stringify({version:1,flow:'alternative',offStart:99,start:'2026-10-19',scale:{nome:'Invalida',tipo:'ciclo_dias',dias_trabalho:5,dias_folga:2}}))")
            chrome.navigate(origin + "index.html?browserOnly")
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.body.dataset.resultReady === 'false'")
            assert chrome.evaluate("document.querySelector('#activeScaleSummary').textContent.includes('Nenhuma consulta')")
            print("GUIDE: invalid confirmed record cannot produce a result")
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + ")")

            legacy = [
                {"nome": "Antiga 6x3", "tipo": "ciclo_dias", "dias_trabalho": 6, "dias_folga": 3},
                {"nome": "Antiga 4x2", "tipo": "ciclo_dias", "dias_trabalho": 4, "dias_folga": 2},
                {"nome": "Antiga rotativa", "tipo": "turno_rotativo", "sequencia_turnos": ["Manhã", "Tarde", "Folga"]},
            ]
            chrome.evaluate("localStorage.setItem('simulador_escala_demo_v014_local', " + json.dumps(json.dumps(legacy)) + ")")
            chrome.navigate(origin + "index.html?browserOnly")
            chrome.navigate(origin + "simulador.html?browserOnly#minhas-escalas")
            chrome.until("state.savedScales.length === 3")
            for index in range(3):
                chrome.evaluate(f"applySavedScale({index}); document.querySelector('#startDate').value='2026-10-01'; document.querySelector('#simulatorForm').requestSubmit()")
                chrome.until("document.body.dataset.resultReady === 'true'")
                if index == 0:
                    chrome.evaluate("document.querySelector('#guideSave').click()")
                    assert chrome.evaluate("JSON.parse(localStorage.getItem('simulador_escala_active_v1')).scale.nome") == "Antiga 6x3"
                    chrome.navigate(origin + "index.html?browserOnly")
                    chrome.navigate(origin + "simulador.html?browserOnly")
                    chrome.until("document.body.dataset.resultReady === 'true'")
                    assert "Antiga 6x3" in chrome.evaluate("document.querySelector('#guideResultSummary').textContent")
            print("LEGACY: saved 6x3, 4x2 and rotating schedules remain usable")
            chrome.evaluate("window.confirm=(text)=>{window.lastDeleteConfirmation=text;return true}; deleteSavedScale(0)")
            assert "consulta guardada vinculada" in chrome.evaluate("window.lastDeleteConfirmation")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") is None
            assert chrome.evaluate("state.savedScales.length") == 2
            assert chrome.evaluate("document.body.dataset.resultReady") == "false"
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + "); state.guide.active=readConfirmedSelection(); showActiveSummary(); deleteSavedScale(0)")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") == confirmed_record
            assert chrome.evaluate("state.savedScales.length") == 1
            chrome.evaluate("document.querySelector('#guideForget').click()")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") is None
            assert chrome.evaluate("state.savedScales.length") == 1
            print("DELETE: linked saved consultation removed; independent model consultation preserved")
            chrome.evaluate("localStorage.setItem('simulador_escala_demo_v014_local', JSON.stringify([{nome:'Teste PWA 6x3',tipo:'ciclo_dias',dias_trabalho:6,dias_folga:3}]))")
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + ")")
            chrome.navigate(origin + "index.html?browserOnly")
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.body.dataset.resultReady === 'true'")

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
            for width, mobile in ((320, True), (1280, False)):
                chrome.call("Emulation.setDeviceMetricsOverride", {
                    "width": width, "height": 844, "deviceScaleFactor": 1, "mobile": mobile
                })
                for page in ("index.html", "simulador.html", "modelos.html"):
                    chrome.navigate(origin + page + "?browserOnly")
                    assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, page)
                    chrome.screenshot(f"{width}-{page}.png")
                    if page == "simulador.html":
                        chrome.evaluate("document.querySelector('#calendarGrid').scrollIntoView()")
                        chrome.screenshot(f"{width}-calendar.png")
                chrome.navigate(origin + "simulador.html?browserOnly")
                assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth")
                chrome.evaluate("document.documentElement.style.fontSize='20px'")
                assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth"), (width, "larger text")
                print("RESPONSIVE:", width, "px, larger text, no horizontal overflow")
            chrome.call("Emulation.setDeviceMetricsOverride", {
                "width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True
            })
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
            changed = base / "changed.json"
            changed.write_text('{"format":"simulador-escalas-backup","version":1,"scales":[{"nome":"Restaurada 12x36","tipo":"ciclo_horas","horas_trabalho":24,"horas_folga":24}]}', encoding="utf-8")
            linked_record = {"version": 1, "flow": "saved", "source": "local", "start": "2026-10-01",
                             "scale": {"nome": "Teste PWA 6x3", "tipo": "ciclo_dias",
                             "dias_trabalho": 6, "dias_folga": 3}}
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(json.dumps(linked_record)) + ")")
            chrome.call("DOM.enable")
            document = chrome.call("DOM.getDocument")["root"]["nodeId"]
            file_input = chrome.call("DOM.querySelector", {"nodeId": document, "selector": "#importFile"})["nodeId"]
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(invalid)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("document.querySelector('#dataFeedback').textContent", lambda v: "não importado" in v)
            assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Teste PWA 6x3')")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") == json.dumps(linked_record)
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(valid)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("!document.querySelector('#confirmImport').disabled")
            assert "também será removida" in chrome.evaluate("document.querySelector('#importPreview').textContent")
            chrome.evaluate("window.confirm=(text)=>{window.lastImportConfirmation=text;return true}; document.querySelector('#confirmImport').click()")
            chrome.until("localStorage.getItem('simulador_escala_demo_v014_local').includes('Restaurada 12x36')")
            assert "consulta guardada vinculada" in chrome.evaluate("window.lastImportConfirmation")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") is None

            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + ")")
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(changed)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("!document.querySelector('#confirmImport').disabled")
            chrome.evaluate("document.querySelector('#confirmImport').click()")
            chrome.until("localStorage.getItem('simulador_escala_demo_v014_local').includes('24')")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") == confirmed_record

            altered_record = {"version": 1, "flow": "saved", "source": "local", "start": "2026-10-01T18:00",
                              "scale": {"nome": "Restaurada 12x36", "tipo": "ciclo_horas",
                              "horas_trabalho": 24, "horas_folga": 24}}
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(json.dumps(altered_record)) + ")")
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(valid)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("!document.querySelector('#confirmImport').disabled")
            assert "também será removida" in chrome.evaluate("document.querySelector('#importPreview').textContent")
            chrome.evaluate("document.querySelector('#confirmImport').click()")
            chrome.until("localStorage.getItem('simulador_escala_demo_v014_local').includes('36')")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") is None
            print("BACKUP: invalid preserved data; removed or altered linked consultation cleared; independent model preserved")

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
                chrome.evaluate("selectGuideFlow('admin'); document.querySelector('#startDate').value='2026-10-19'; document.querySelector('#simulatorForm').requestSubmit()")
                chrome.until("document.querySelector('#resultDescription').textContent.includes('Status consultado na API')")
                chrome.evaluate("applySavedScale(0); document.querySelector('#startDate').value='2026-10-01'; document.querySelector('#simulatorForm').requestSubmit()")
                chrome.until("document.querySelector('#resultDescription').textContent.includes('Escala API de teste')")
                assert chrome.evaluate("document.body.dataset.resultReady") == "true"
                chrome.evaluate("document.querySelector('#guideSave').click()")
                assert chrome.evaluate("JSON.parse(localStorage.getItem('simulador_escala_active_v1')).source") == "api"
                chrome.evaluate("window.confirm=()=>true; deleteSavedScale(0)")
                chrome.until("state.savedScales.length === 0")
                assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") is None
                assert json.loads((data_dir / "escalas.json").read_text(encoding="utf-8")) == []
                chrome.evaluate("""(() => {
                    const original = window.apiRequest;
                    window.apiRequest = (...args) => new Promise((resolve, reject) => {
                        window.finishDelayedRequest = () => original(...args)
                            .then(resolve, reject).finally(() => { window.delayedRequestFinished = true; });
                    });
                    window.restoreApiRequest = () => { window.apiRequest = original; };
                })()""")
                chrome.evaluate("selectGuideFlow('admin'); document.querySelector('#startDate').value='2026-10-19'; document.querySelector('#simulatorForm').requestSubmit()")
                chrome.until("typeof window.finishDelayedRequest === 'function'")
                chrome.evaluate("document.querySelector('#startDate').value=''; document.querySelector('#startDate').dispatchEvent(new Event('input',{bubbles:true})); window.finishDelayedRequest()")
                chrome.until("window.delayedRequestFinished === true")
                time.sleep(.1)
                assert chrome.evaluate("document.body.dataset.resultReady") == "false"
                chrome.evaluate("window.restoreApiRequest()")
                print("ONLINE local API: temporary JSON scale listed and simulated")
            finally:
                api.terminate()
                api.wait(timeout=10)
            chrome.navigate(origin + "simulador.html")
            chrome.until("state.savedScaleSource", lambda value: value == "local")
            print("ONLINE API off: browser storage restored")
            errors = [event for event in chrome.events if event.get("method") == "Runtime.exceptionThrown"]
            assert not errors, json.dumps(errors[-2:], ensure_ascii=False)
            new_worker = (ROOT / "docs" / "demo" / "sw.js").read_bytes().replace(b"pwa-4", b"pwa-5")
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
            chrome.until("caches.keys().then(x=>x.some(y=>y.endsWith('pwa-5')))")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Restaurada 12x36')"), chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local')")
            print("UPDATE: new shell active after reopening; localStorage preserved")
        finally:
            chrome.close()
            server.shutdown()


if __name__ == "__main__":
    main()
