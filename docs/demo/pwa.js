(function initPwa() {
    "use strict";

    const CHECK_INTERVAL_MS = 15 * 60 * 1000;
    const LAST_CHECK_KEY = "simulador_pwa_last_update_check";
    const POSTPONE_KEY = "simulador_pwa_update_postponed_until";
    let installPrompt = null;
    let installButton = null;
    let registration = null;
    let banner = null;
    let updateButton = null;
    let postponedUntil = 0;
    let knownController = navigator.serviceWorker?.controller || null;
    let activeUpdateAvailable = false;
    let editedFields = false;
    let lastUpdateCheck = 0;
    let reloadRequested = false;
    let reloaded = false;

    function showInstallButton() {
        if (!installPrompt || installButton || window.matchMedia("(display-mode: standalone)").matches) return;
        const actions = document.querySelector(".header-actions");
        if (!actions) return;
        installButton = document.createElement("button");
        installButton.type = "button";
        installButton.className = "button quiet pwa-install-button";
        installButton.textContent = "Instalar";
        installButton.setAttribute("aria-label", "Instalar o Simulador neste dispositivo");
        installButton.addEventListener("click", async () => {
            if (!installPrompt) return;
            const prompt = installPrompt;
            installPrompt = null;
            installButton.disabled = true;
            try {
                await prompt.prompt();
                await prompt.userChoice;
            } finally {
                installButton.remove();
                installButton = null;
            }
        });
        actions.prepend(installButton);
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        installPrompt = event;
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", showInstallButton, { once: true });
        } else showInstallButton();
    });
    window.addEventListener("appinstalled", () => {
        installPrompt = null;
        installButton?.remove();
        installButton = null;
    });

    if (!("serviceWorker" in navigator)) return;

    try {
        lastUpdateCheck = Number(sessionStorage.getItem(LAST_CHECK_KEY)) || 0;
        postponedUntil = Number(sessionStorage.getItem(POSTPONE_KEY)) || 0;
    } catch { /* A verificação continua sem armazenamento de sessão. */ }

    function clearPostponement() {
        postponedUntil = 0;
        try { sessionStorage.removeItem(POSTPONE_KEY); } catch { /* A sessão pode bloquear gravação. */ }
    }

    function reloadOnce() {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
    }

    async function activateUpdate() {
        if (!registration || !navigator.onLine || reloadRequested) return;
        if (editedFields && !window.confirm(
            "Há campos alterados nesta tela. Atualizar agora pode perder valores ainda não salvos. Deseja continuar?"
        )) return;

        const waiting = registration.waiting;
        if (!waiting) {
            if (activeUpdateAvailable) reloadOnce();
            return;
        }
        reloadRequested = true;
        updateButton.disabled = true;
        updateButton.textContent = "Preparando atualização…";
        try {
            waiting.postMessage({ type: "SKIP_WAITING" });
        } catch (error) {
            reloadRequested = false;
            updateButton.disabled = false;
            updateButton.textContent = "Atualizar agora";
            console.warn("Não foi possível ativar a atualização.", error);
        }
    }

    function createUpdateBanner() {
        banner = document.createElement("aside");
        banner.id = "pwaUpdateBanner";
        banner.className = "pwa-update-banner";
        banner.setAttribute("role", "status");
        banner.setAttribute("aria-live", "polite");
        banner.hidden = true;

        const title = document.createElement("strong");
        title.textContent = "Atualização disponível";
        const detail = document.createElement("span");
        detail.textContent = "Uma nova versão pode ser aberta sem apagar as escalas deste dispositivo.";
        const actions = document.createElement("div");
        actions.className = "pwa-update-actions";
        updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.className = "button primary";
        updateButton.textContent = "Atualizar agora";
        updateButton.addEventListener("click", activateUpdate);
        const later = document.createElement("button");
        later.type = "button";
        later.className = "button quiet";
        later.textContent = "Mais tarde";
        later.addEventListener("click", () => {
            postponedUntil = Date.now() + 60 * 60 * 1000;
            try { sessionStorage.setItem(POSTPONE_KEY, String(postponedUntil)); } catch { /* A sessão pode bloquear gravação. */ }
            banner.hidden = true;
        });
        actions.append(updateButton, later);
        banner.append(title, detail, actions);
        document.body.append(banner);
    }

    function showAvailableUpdate() {
        if (!banner || !registration || !navigator.onLine || !knownController) return;
        const candidate = registration.waiting || (activeUpdateAvailable && navigator.serviceWorker.controller);
        if (candidate && Date.now() >= postponedUntil) banner.hidden = false;
    }

    function watchInstallingWorker() {
        const worker = registration?.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
            if (worker.state === "installed") {
                clearPostponement();
                showAvailableUpdate();
            }
        });
    }

    async function checkForUpdates() {
        if (!registration || !navigator.onLine) return;
        showAvailableUpdate();
        if (document.hidden) return;
        const now = Date.now();
        if (now >= lastUpdateCheck && now - lastUpdateCheck < CHECK_INTERVAL_MS) return;
        lastUpdateCheck = now;
        try { sessionStorage.setItem(LAST_CHECK_KEY, String(now)); } catch { /* A sessão pode bloquear gravação. */ }
        try {
            await registration.update();
            showAvailableUpdate();
        } catch (error) {
            console.info("A verificação de atualização ficará para quando houver conexão.", error);
        }
    }

    document.addEventListener("input", (event) => {
        if (event.isTrusted && event.target.matches("input, textarea, select, [contenteditable]")) editedFields = true;
    }, true);
    document.addEventListener("change", (event) => {
        if (event.isTrusted && event.target.matches("input, textarea, select, [contenteditable]")) editedFields = true;
    }, true);
    document.addEventListener("click", (event) => {
        if (event.isTrusted && event.target.closest("[data-calendar-date]")) editedFields = true;
    }, true);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        const previous = knownController;
        knownController = navigator.serviceWorker.controller;
        if (!previous || !knownController || previous === knownController) return;
        if (reloadRequested) reloadOnce();
        else {
            activeUpdateAvailable = true;
            clearPostponement();
            showAvailableUpdate();
        }
    });

    window.addEventListener("load", async () => {
        createUpdateBanner();
        try {
            registration = await navigator.serviceWorker.register("sw.js", {
                scope: "./", updateViaCache: "none"
            });
            knownController = navigator.serviceWorker.controller;
            registration.addEventListener("updatefound", watchInstallingWorker);
            watchInstallingWorker();
            showAvailableUpdate();
            await checkForUpdates();
        } catch (error) {
            console.warn("O uso offline não pôde ser preparado neste navegador.", error);
        }
    });
    window.addEventListener("focus", checkForUpdates);
    document.addEventListener("visibilitychange", checkForUpdates);
    window.addEventListener("online", checkForUpdates);
    window.addEventListener("offline", () => { if (banner) banner.hidden = true; });
}());
