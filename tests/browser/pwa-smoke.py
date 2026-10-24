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
    pwa_override = None

    def log_message(self, *_args):
        pass

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/docs/demo/sw.js" and self.worker_override:
            body = self.worker_override

            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/docs/demo/pwa.js" and self.pwa_override:
            body = self.pwa_override
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

    def call(self, method, params=None, session_id=None):
        self.number += 1
        number = self.number
        command = {"id": number, "method": method, "params": params or {}}
        if session_id:
            command["sessionId"] = session_id
        payload = json.dumps(command).encode()
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

    def evaluate(self, expression, session_id=None):
        result = self.call("Runtime.evaluate", {
            "expression": expression, "returnByValue": True, "awaitPromise": True
        }, session_id=session_id).get("result", {})
        if "exceptionDetails" in result:
            raise RuntimeError(result["exceptionDetails"])
        return result.get("value")

    def until(self, expression, expected=lambda value: bool(value), session_id=None):
        for _ in range(100):
            value = self.evaluate(expression, session_id=session_id)
            if expected(value):
                return value
            time.sleep(.1)
        raise AssertionError(f"Timed out: {expression}; last value: {value!r}")

    def navigate(self, url, session_id=None):
        self.call("Page.navigate", {"url": url}, session_id=session_id)
        self.until(f"location.href === {json.dumps(url)} && document.readyState === 'complete' && !!document.querySelector('h1')", session_id=session_id)

    def open_tab(self, url):
        target_id = self.call("Target.createTarget", {"url": "about:blank"})["targetId"]
        session_id = self.call("Target.attachToTarget", {"targetId": target_id, "flatten": True})["sessionId"]
        self.call("Page.enable", session_id=session_id)
        self.call("Runtime.enable", session_id=session_id)
        self.call("Network.enable", session_id=session_id)
        self.navigate(url, session_id=session_id)
        return session_id

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
    for name in ("icon-v5", "icon-maskable-v5"):
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
            chrome.until("navigator.serviceWorker?.controller && caches.keys().then(x=>x.some(y=>y.includes('pwa-7')))")
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

            rotating = ["Folga"] * 3 + ["Tarde"] * 3 + ["Noite"] * 3 + ["Folga"] * 2 + ["Manhã"] * 6 + ["Folga"] + ["Tarde"] * 3 + ["Noite"] * 3
            assert len(rotating) == 24
            chrome.evaluate("document.querySelector('#savedName').value='Rotativa 24 dias'; document.querySelector('#savedType').value='turno_rotativo'; state.savedTurns=" + json.dumps(rotating, ensure_ascii=False) + "; renderSavedDynamicFields(); document.querySelector('#savedStart').value='2026-10-24'; previewSavedScale()")
            assert chrome.evaluate("document.querySelector('#savedScaleSubmitButton').disabled === false"), chrome.evaluate("document.querySelector('#savedScaleFeedback').textContent")
            assert chrome.evaluate("[...document.querySelectorAll('#savedReferencePreview li')].map(x=>x.textContent.split(': ').pop()).join(',')") == "Folga,Folga,Folga,Tarde,Tarde,Tarde"
            chrome.evaluate("document.querySelector('#savedScalesDisclosure').open=true; document.querySelector('#savedReferencePreview').scrollIntoView({block:'start'}); window.scrollBy(0,-180)")
            chrome.screenshot("saved-reference-preview.png")
            chrome.evaluate("saveScaleFromForm()")
            chrome.until("state.savedScales.some(x=>x.nome==='Rotativa 24 dias')")
            assert chrome.evaluate("ScaleReferences.find(ScaleReferences.read(localStorage),state.savedScales.find(x=>x.nome==='Rotativa 24 dias'),'local')") == "2026-10-24"
            chrome.evaluate("applySavedScale(state.savedScales.findIndex(x=>x.nome==='Rotativa 24 dias'))")
            assert chrome.evaluate("document.querySelector('#startDate').value") == "2026-10-24", chrome.evaluate("({start:document.querySelector('#startDate').value,scales:state.savedScales,feedback:document.querySelector('#simulatorFeedback').textContent})")
            for day, expected in (("2026-10-24", "Folga"), ("2026-10-26", "Folga"), ("2026-10-27", "Tarde"), ("2026-11-17", "Folga")):
                chrome.evaluate("document.querySelector('#queryDate').value=" + json.dumps(day) + "; document.querySelector('#simulatorForm').requestSubmit()")
                chrome.until("document.querySelector('#resultTitle').textContent.includes(" + json.dumps(expected) + ")")
                assert chrome.evaluate("document.querySelector('#startDate').value") == "2026-10-24"
            chrome.evaluate("document.querySelector('#calendarGrid [data-calendar-date=\"2026-10-30\"]').click()")
            assert chrome.evaluate("document.querySelector('#queryDate').value") == "2026-10-30"
            assert chrome.evaluate("document.querySelector('#startDate').value") == "2026-10-24"
            chrome.evaluate("document.querySelector('#queryDate').value='2026-10-23'; document.querySelector('#simulatorForm').requestSubmit()")
            assert "projeção não confirmada" in chrome.evaluate("document.querySelector('#resultDescription').textContent")
            chrome.evaluate("document.querySelector('#startDate').value='2026-10-25'; document.querySelector('#queryDate').value='2026-10-25'; document.querySelector('#simulatorForm').requestSubmit(); document.querySelector('#guideSave').click()")
            assert chrome.evaluate("ScaleReferences.find(ScaleReferences.read(localStorage),state.savedScales.find(x=>x.nome==='Rotativa 24 dias'),'local')") == "2026-10-25"
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.querySelector('#startDate')?.value === '2026-10-25'")
            chrome.evaluate("applySavedScale(state.savedScales.findIndex(x=>x.nome==='Rotativa 24 dias'))")
            assert chrome.evaluate("document.querySelector('#startDate').value") == "2026-10-25"
            chrome.evaluate("document.querySelector('#calendarNext').click(); document.querySelector('#calendarToday').click()")
            assert chrome.evaluate("document.querySelector('#startDate').value") == "2026-10-25"
            chrome.navigate(origin + "comparador.html?browserOnly")
            chrome.until("state.comparison.catalog.has('saved:local:Rotativa%2024%20dias')")
            chrome.evaluate("selectComparisonScale('a','saved:local:Rotativa%2024%20dias')")
            assert chrome.evaluate("document.querySelector('#comparison-a-anchor').value") == "2026-10-25"
            chrome.navigate(origin + "relatorio.html?browserOnly")
            chrome.until("state.report.catalog.has('saved:local:Rotativa%2024%20dias')")
            chrome.evaluate("selectReportScale('a','saved:local:Rotativa%2024%20dias')")
            assert chrome.evaluate("document.querySelector('#report-a-anchor').value") == "2026-10-25"
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.evaluate("document.querySelector('#savedName').value='Plantão 12x36'; document.querySelector('#savedType').value='ciclo_horas'; renderSavedDynamicFields(); document.querySelector('#savedStart').value='2026-10-01T18:00'; previewSavedScale()")
            assert chrome.evaluate("document.querySelector('#savedScaleSubmitButton').disabled === false")
            chrome.evaluate("saveScaleFromForm()")
            chrome.until("state.savedScales.some(x=>x.nome==='Plantão 12x36')")
            chrome.evaluate("applySavedScale(state.savedScales.findIndex(x=>x.nome==='Plantão 12x36'))")
            assert chrome.evaluate("document.querySelector('#startDateTime').value") == "2026-10-01T18:00"
            for instant, expected in (("2026-10-02T05:59", "Trabalhando"), ("2026-10-02T06:00", "Folga")):
                chrome.evaluate("document.querySelector('#queryDateTime').value=" + json.dumps(instant) + "; document.querySelector('#simulatorForm').requestSubmit()")
                chrome.until("document.querySelector('#resultTitle').textContent.includes(" + json.dumps(expected) + ")")
                assert chrome.evaluate("document.querySelector('#startDateTime').value") == "2026-10-01T18:00"
            print("REFERENCE: 24-day rotation, year/month rollover, correction, reopening and historical warning")

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
                if index == 0:
                    chrome.evaluate("applySavedScale(0)")
                    assert chrome.evaluate("document.querySelector('#startDate').value") == ""
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
            chrome.evaluate("ScaleReferences.set(localStorage,{nome:'Teste PWA 6x3',tipo:'ciclo_dias',dias_trabalho:6,dias_folga:3},'local','2026-10-01'); ScaleReferences.set(localStorage,PREDEFINED_MODELS.find(x=>x.id==='6x3'),'model','2026-10-01'); ScaleReferences.set(localStorage,PREDEFINED_MODELS.find(x=>x.id==='12x36'),'model','2026-10-01T18:00')")

            chrome.call("Network.emulateNetworkConditions", {
                "offline": True, "latency": 0, "downloadThroughput": 0, "uploadThroughput": 0
            })
            for page in ("simulador.html", "comparador.html", "relatorio.html", "dados.html"):
                chrome.navigate(origin + page + "?browserOnly")
                assert chrome.evaluate("document.querySelector('#pwaUpdateBanner')?.hidden")
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
            assert [icon["src"] for icon in manifest["icons"]] == [
                "icons/icon-v5-192.png", "icons/icon-v5-512.png",
                "icons/icon-maskable-v5-192.png", "icons/icon-maskable-v5-512.png",
            ]
            assert chrome.evaluate("Promise.all(" + json.dumps([icon["src"] for icon in manifest["icons"]]) +
                                   ".map(path=>fetch(path).then(r=>r.ok))).then(x=>x.every(Boolean))")
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
            restored_scale = {"nome": "Restaurada 12x36", "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": 36}
            v2_file = base / "valid-v2.json"
            v2_file.write_text(json.dumps({"format": "simulador-escalas-backup", "version": 2,
                "scales": [restored_scale], "references": [{"source": "local", "scale": restored_scale,
                "start": "2026-10-01T18:00"}]}, ensure_ascii=False), encoding="utf-8")
            invalid_v2 = base / "invalid-v2.json"
            invalid_v2.write_text(v2_file.read_text(encoding="utf-8").replace("2026-10-01T18:00", "2026-02-30T18:00"), encoding="utf-8")
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(json.dumps({**altered_record,
                "scale": restored_scale, "start": "2026-10-02T18:00"})) + ")")
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(invalid_v2)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("document.querySelector('#dataFeedback').textContent", lambda v: "não importado" in v)
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1').includes('2026-10-02T18:00')")
            chrome.call("DOM.setFileInputFiles", {"nodeId": file_input, "files": [str(v2_file)]})
            chrome.evaluate("document.querySelector('#importFile').dispatchEvent(new Event('change'))")
            chrome.until("!document.querySelector('#confirmImport').disabled")
            assert "referência" in chrome.evaluate("document.querySelector('#importPreview').textContent")
            chrome.evaluate("document.querySelector('#confirmImport').click()")
            chrome.until("JSON.parse(localStorage.getItem('simulador_escala_active_v1')).start === '2026-10-01T18:00'")
            assert chrome.evaluate("ScaleReferences.find(ScaleReferences.read(localStorage),JSON.parse(localStorage.getItem('simulador_escala_demo_v014_local'))[0],'local')") == "2026-10-01T18:00"
            print("BACKUP: v1 compatible; v2 restores reference and updates consultation; invalid files preserve data")

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
                assert chrome.evaluate("ScaleReferences.find(ScaleReferences.read(localStorage),state.savedScales[0],'api')") == "2026-10-01"
                assert "2026-10-01" not in (data_dir / "escalas.json").read_text(encoding="utf-8")
                chrome.evaluate("window.confirm=()=>true; deleteSavedScale(0)")
                chrome.until("state.savedScales.length === 0")
                assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") is None
                assert chrome.evaluate("ScaleReferences.read(localStorage).some(x=>x.source==='api' && x.scale.nome==='Escala API de teste')") is False
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
            chrome.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + ")")
            second_tab = chrome.open_tab(origin + "comparador.html?browserOnly")
            chrome.until("!!document.querySelector('#pwaUpdateBanner')", session_id=second_tab)
            chrome.evaluate("window.__keepMarker = 'second tab stayed open'", session_id=second_tab)
            confirmed_references = chrome.evaluate("localStorage.getItem('simulador_escala_references_v1')", session_id=second_tab)
            assert confirmed_references
            new_worker = (ROOT / "docs" / "demo" / "sw.js").read_bytes().replace(b"pwa-7", b"pwa-8")
            QuietHandler.worker_override = new_worker
            assert chrome.evaluate("fetch('sw.js',{cache:'no-store'}).then(r=>r.text()).then(t=>t.includes('pwa-8'))")
            chrome.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.update())")
            chrome.until("navigator.serviceWorker.getRegistration().then(r=>r.waiting?.state==='installed')")
            chrome.until("document.querySelector('#pwaUpdateBanner')?.hidden === false")
            chrome.until("document.querySelector('#pwaUpdateBanner')?.hidden === false", session_id=second_tab)
            assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth")
            chrome.screenshot("update-banner-mobile.png")
            chrome.call("Network.emulateNetworkConditions", {
                "offline": True, "latency": 0, "downloadThroughput": 0, "uploadThroughput": 0
            })
            chrome.until("navigator.onLine === false && document.querySelector('#pwaUpdateBanner').hidden")
            chrome.call("Network.emulateNetworkConditions", {
                "offline": False, "latency": 0, "downloadThroughput": -1, "uploadThroughput": -1
            })
            chrome.call("Page.bringToFront")
            chrome.until("navigator.onLine === true && document.querySelector('#pwaUpdateBanner').hidden === false")
            check_time = chrome.evaluate("sessionStorage.getItem('simulador_pwa_last_update_check')")
            assert check_time
            for page in sorted(path.name for path in (ROOT / "docs" / "demo").glob("*.html")):
                chrome.navigate(origin + page + "?browserOnly")
                chrome.until("document.querySelector('#pwaUpdateBanner')?.hidden === false")
                assert "Atualização disponível" in chrome.evaluate("document.querySelector('#pwaUpdateBanner').textContent")
                assert chrome.evaluate("document.documentElement.scrollWidth <= innerWidth"), page
                assert chrome.evaluate("sessionStorage.getItem('simulador_pwa_last_update_check')") == check_time
            chrome.navigate(origin + "simulador.html?browserOnly")
            chrome.until("document.querySelector('#pwaUpdateBanner')?.hidden === false")
            chrome.evaluate("document.querySelector('#pwaUpdateBanner .button.quiet').click()")
            assert chrome.evaluate("document.querySelector('#pwaUpdateBanner').hidden")
            chrome.navigate(origin + "dados.html?browserOnly")
            assert chrome.evaluate("document.querySelector('#pwaUpdateBanner')?.hidden")
            chrome.evaluate("window.dispatchEvent(new Event('focus'))")
            assert chrome.evaluate("document.querySelector('#pwaUpdateBanner').hidden")
            assert chrome.evaluate("sessionStorage.getItem('simulador_pwa_last_update_check')") == check_time
            chrome.evaluate("sessionStorage.removeItem('simulador_pwa_update_postponed_until')")
            chrome.navigate(origin + "simulador.html?browserOnly&resume")
            chrome.until("document.querySelector('#pwaUpdateBanner')?.hidden === false")
            chrome.call("Page.bringToFront")
            chrome.evaluate("document.querySelector('#savedScalesList').closest('details').open=true; document.querySelector('#savedName').focus()")
            chrome.call("Input.insertText", {"text": "Rascunho não salvo"})
            assert chrome.evaluate("document.querySelector('#savedName').value") == "Rascunho não salvo"
            chrome.evaluate("window.confirm=(message)=>{window.updateConfirm=message;return false}; document.querySelector('#pwaUpdateBanner .button.primary').click()")
            assert "campos alterados" in chrome.evaluate("window.updateConfirm")
            assert chrome.evaluate("navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)")
            chrome.evaluate("window.addEventListener('beforeunload',()=>sessionStorage.setItem('__update_reload_count',String(Number(sessionStorage.getItem('__update_reload_count')||0)+1))); window.confirm=()=>true; document.querySelector('#pwaUpdateBanner .button.primary').click()")
            time.sleep(.5)
            chrome.until("sessionStorage.getItem('__update_reload_count') === '1' && performance.getEntriesByType('navigation')[0]?.type === 'reload'")
            assert chrome.evaluate("window.__keepMarker", session_id=second_tab) == "second tab stayed open"
            chrome.until("document.querySelector('#pwaUpdateBanner')?.hidden === false", session_id=second_tab)
            chrome.evaluate("document.querySelector('#pwaUpdateBanner .button.primary').click()", session_id=second_tab)
            time.sleep(.5)
            chrome.until("caches.keys().then(x=>x.some(y=>y.endsWith('pwa-8')))", session_id=second_tab)
            assert chrome.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Restaurada 12x36')")
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") == confirmed_record
            assert chrome.evaluate("localStorage.getItem('simulador_escala_references_v1')") == confirmed_references
            print("UPDATE: all pages notified; dirty form protected; chosen tab reloaded once; second tab waited")
            chrome.call("Network.emulateNetworkConditions", {
                "offline": True, "latency": 0, "downloadThroughput": 0, "uploadThroughput": 0
            })
            for page in ("simulador.html", "comparador.html", "relatorio.html", "dados.html"):
                chrome.navigate(origin + page + "?browserOnly")
                assert chrome.evaluate("document.querySelector('h1') !== null"), page
                assert chrome.evaluate("document.querySelector('#pwaUpdateBanner')?.hidden"), page
            assert chrome.evaluate("localStorage.getItem('simulador_escala_active_v1')") == confirmed_record
            assert chrome.evaluate("localStorage.getItem('simulador_escala_references_v1')") == confirmed_references
            errors = [event for event in chrome.events if event.get("method") == "Runtime.exceptionThrown"]
            assert not errors, json.dumps(errors[-2:], ensure_ascii=False)
            print("UPDATED OFFLINE: simulator, comparator, report and local data opened without losing scales")

            legacy_script = ("window.__legacyPwa=true; window.addEventListener('load',()=>"
                             "navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'}));").encode()
            QuietHandler.worker_override = (ROOT / "docs" / "demo" / "sw.js").read_bytes().replace(b"pwa-7", b"pwa-5")
            QuietHandler.pwa_override = legacy_script
            with socket.socket() as legacy_port_socket:
                legacy_port_socket.bind(("127.0.0.1", 0))
                legacy_port = legacy_port_socket.getsockname()[1]
            legacy = Chrome(legacy_port, base / "legacy-profile")
            try:
                legacy.navigate(origin + "simulador.html?browserOnly")
                legacy.until("navigator.serviceWorker.controller && caches.keys().then(x=>x.some(y=>y.endsWith('pwa-5')))")
                assert legacy.evaluate("window.__legacyPwa === true && !document.querySelector('#pwaUpdateBanner')")
                legacy.evaluate("localStorage.setItem('simulador_escala_demo_v014_local', JSON.stringify([{nome:'Escala anterior',tipo:'ciclo_dias',dias_trabalho:6,dias_folga:3}]))")
                legacy.evaluate("localStorage.setItem('simulador_escala_active_v1', " + json.dumps(confirmed_record) + ")")
                legacy.open_tab(origin + "dados.html?browserOnly")
                QuietHandler.pwa_override = None
                QuietHandler.worker_override = (ROOT / "docs" / "demo" / "sw.js").read_bytes()
                assert legacy.evaluate("fetch('sw.js',{cache:'no-store'}).then(r=>r.text()).then(t=>t.includes('pwa-7'))")
                legacy.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.update())")
                legacy.until("navigator.serviceWorker.getRegistration().then(r=>r.waiting?.state==='installed')")
                assert legacy.evaluate("!document.querySelector('#pwaUpdateBanner')")
            finally:
                legacy.close()
            legacy = Chrome(legacy_port, base / "legacy-profile")
            try:
                legacy.navigate(origin + "simulador.html?browserOnly")
                legacy.until("caches.keys().then(x=>x.some(y=>y.endsWith('pwa-7')))")
                legacy.until("!!document.querySelector('#pwaUpdateBanner')")
                assert legacy.evaluate("localStorage.getItem('simulador_escala_demo_v014_local').includes('Escala anterior')")
                assert legacy.evaluate("localStorage.getItem('simulador_escala_active_v1')") == confirmed_record
                assert legacy.evaluate("ScaleReferences.read(localStorage).some(x=>x.start === JSON.parse(localStorage.getItem('simulador_escala_active_v1')).start)")
                errors = [event for event in legacy.events if event.get("method") == "Runtime.exceptionThrown"]
                assert not errors, json.dumps(errors[-2:], ensure_ascii=False)
                print("LEGACY UPDATE: closing old tabs activated the new shell; scales and confirmed query remained")
            finally:
                legacy.close()
            chrome.call("Network.emulateNetworkConditions", {
                "offline": False, "latency": 0, "downloadThroughput": -1, "uploadThroughput": -1
            })
            for runner in ("comparator-e2e.html", "report-e2e.html"):
                chrome.navigate(f"http://127.0.0.1:{server.server_port}/tests/browser/{runner}?scenario=public")
                chrome.until("document.querySelector('#result').dataset.result", lambda value: value != "running")
                result = chrome.evaluate("({status:document.querySelector('#result').dataset.result,text:document.querySelector('#result').textContent})")
                assert result["status"] == "pass", (runner, result["text"])
                print("BROWSER E2E:", runner, result["text"].split(":", 1)[0])
        finally:
            chrome.close()
            server.shutdown()


if __name__ == "__main__":
    main()
