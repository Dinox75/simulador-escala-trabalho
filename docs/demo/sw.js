/* Bump this name whenever a cached page or asset changes. Keep each shell complete. */
const CACHE_PREFIX = "simulador-demo-shell-";
const CACHE_NAME = `${CACHE_PREFIX}pwa-2`;
const SHELL = [
    "./", "index.html", "simulador.html", "comparador.html", "relatorio.html",
    "dados.html", "modelos.html", "documentacao.html", "sobre.html",
    "roadmap.html", "termos.html", "privacidade.html", "style.css", "script.js",
    "calendar-core.js", "report-core.js", "report-xlsx.js",
    "backup-core.js", "dados.js", "pwa.js", "manifest.webmanifest",
    "icons/icon-192.png", "icons/icon-512.png",
    "icons/icon-maskable-192.png", "icons/icon-maskable-512.png",
    "vendor/lucide-0.468.0.min.js"
];
const shellUrls = new Set(SHELL.map((file) => new URL(file, self.registration.scope).href));

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            await cache.addAll(SHELL.map((file) => new Request(
                new URL(file, self.registration.scope), { cache: "reload" }
            )));
        } catch (error) {
            await caches.delete(CACHE_NAME);
            throw error;
        }
        // Do not skipWaiting: open pages keep their matching shell until closed.
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    const canonical = new URL(url.pathname, self.location.origin).href;
    if (!shellUrls.has(canonical)) return;
    event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(canonical);
        return cached || fetch(request);
    }));
});
