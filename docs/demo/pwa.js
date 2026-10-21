(function initPwa() {
    "use strict";

    let installPrompt = null;
    let installButton = null;

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
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("sw.js", {
                scope: "./", updateViaCache: "none"
            });
            if (registration.waiting) document.dispatchEvent(new Event("pwa-update-ready"));
            registration.addEventListener("updatefound", () => {
                const worker = registration.installing;
                worker?.addEventListener("statechange", () => {
                    if (worker.state === "installed" && navigator.serviceWorker.controller) {
                        document.dispatchEvent(new Event("pwa-update-ready"));
                    }
                });
            });
        } catch (error) {
            console.warn("O uso offline não pôde ser preparado neste navegador.", error);
        }
    });
}());
