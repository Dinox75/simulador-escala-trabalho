(function initDeviceData() {
    "use strict";

    const backup = window.ScaleBackup;
    const activeSelection = window.ScaleActiveSelection;
    const references = window.ScaleReferences;
    const count = document.querySelector("#storedCount");
    const feedback = document.querySelector("#dataFeedback");
    const exportButton = document.querySelector("#exportBackup");
    const widgetExportButton = document.querySelector("#exportWidgetBackup");
    const fileInput = document.querySelector("#importFile");
    const preview = document.querySelector("#importPreview");
    const confirmButton = document.querySelector("#confirmImport");
    let current = [];
    let currentReferences = [];
    let pending = null;

    function message(text, error = false) {
        feedback.textContent = text;
        feedback.dataset.feedbackType = error ? "error" : "success";
    }

    function clearPreview() {
        pending = null;
        confirmButton.disabled = true;
        preview.hidden = true;
        preview.replaceChildren();
    }

    function refreshCurrent() {
        try {
            const stored = backup.readStored(localStorage);
            current = stored.scales;
            currentReferences = references.read(localStorage);
            count.textContent = `${current.length} escala${current.length === 1 ? "" : "s"} salva${current.length === 1 ? "" : "s"} neste navegador.`;
            exportButton.disabled = false;
            widgetExportButton.disabled = false;
            return true;
        } catch (error) {
            current = [];
            count.textContent = "Os dados locais precisam de revisão; nenhuma escala foi alterada.";
            exportButton.disabled = true;
            widgetExportButton.disabled = true;
            clearPreview();
            message(error.message, true);
            return false;
        }
    }

    function downloadBackup(widget = false) {
        try {
            const text = widget ? backup.createWidgetBackup(current) :
                backup.createBackup(current, references.mergeImport(currentReferences, [], current, 1));
            const url = URL.createObjectURL(new Blob([text], { type: "application/json;charset=utf-8" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `${widget ? "backup-widget-v1" : "backup-escalas-v2"}-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            message(widget ? "Arquivo v1 para o widget baixado. Ele não contém referências." :
                "Backup v2 com referências baixado. Guarde o arquivo fora deste dispositivo.");
        } catch (error) { message(error.message, true); }
    }

    function activeImportEffect(active, scales, nextReferences, version) {
        if (!active) return { remove: false, start: null };
        if (activeSelection.invalidatedByReplacement(active, current, scales)) {
            return { remove: true, start: null, reason: "cadastro removido ou alterado" };
        }
        const source = active.flow === "saved" ? (active.source || "local") : "model";
        let start = null;
        try { start = references.find(nextReferences, active.scale, source); }
        catch { /* Um registro legado pode ter parâmetros que exigem nova confirmação. */ }
        if (version === 2 && active.flow === "saved" && source === "local" && !start) {
            return { remove: true, start: null, reason: "referência ausente no backup v2" };
        }
        return { remove: false, start: start && start !== active.start ? start : null };
    }

    function showPreview(envelope) {
        const scales = envelope.scales;
        const nextReferences = references.mergeImport(currentReferences, envelope.references, scales, envelope.version);
        const existingNames = new Set(current.map((scale) => scale.nome.toLocaleLowerCase("pt-BR")));
        const incomingNames = new Set(scales.map((scale) => scale.nome.toLocaleLowerCase("pt-BR")));
        const removed = current.filter((scale) => !incomingNames.has(scale.nome.toLocaleLowerCase("pt-BR")));
        const added = scales.filter((scale) => !existingNames.has(scale.nome.toLocaleLowerCase("pt-BR")));
        const title = document.createElement("h3");
        title.textContent = "Prévia da substituição";
        const description = document.createElement("p");
        description.textContent = `Neste navegador: ${current.length} escala(s). No arquivo: ${scales.length} escala(s). ${removed.length} nome(s) sairão e ${added.length} nome(s) entrarão. Escalas de mesmo nome receberão a configuração do arquivo.`;
        const names = document.createElement("p");
        names.textContent = `O arquivo contém: ${scales.slice(0, 8).map((scale) => scale.nome).join(", ")}${scales.length > 8 ? "…" : ""}${scales.length ? "." : " nenhuma escala."}`;
        const active = activeSelection.read(localStorage);
        const effect = activeImportEffect(active, scales, nextReferences, envelope.version);
        const activeEffect = document.createElement("p");
        activeEffect.textContent = effect.remove
            ? `A consulta guardada "${active.scale.nome}" também será removida: ${effect.reason}.`
            : effect.start ? `A consulta guardada passará a usar a referência ${effect.start} do backup.` :
                active ? "A consulta guardada permanecerá neste dispositivo." :
                "Não há consulta guardada para remover.";
        const referenceEffect = document.createElement("p");
        referenceEffect.textContent = `Formato v${envelope.version}: ${currentReferences.length} referência(s) agora; ${nextReferences.length} após importar. ` +
            (envelope.version === 1
                ? "O arquivo não traz referências; as de cadastros idênticos serão mantidas, e as de cadastros removidos ou alterados serão descartadas."
                : "As referências locais serão substituídas pelas do arquivo; referências de modelos e da API local que não aparecem nele permanecem.");
        preview.replaceChildren(title, description, names, referenceEffect, activeEffect);
        preview.hidden = false;
        confirmButton.disabled = false;
    }

    async function prepareImport() {
        clearPreview();
        const file = fileInput.files?.[0];
        if (!file) return;
        if (!refreshCurrent()) return;
        try {
            if (file.size > backup.MAX_FILE_BYTES) throw new Error("O arquivo excede 512 KB.");
            const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
            pending = backup.parseEnvelope(text);
            showPreview(pending);
            message("Confira a prévia. As escalas atuais continuam intactas até sua confirmação.");
        } catch (error) {
            clearPreview();
            message(`Backup não importado: ${error.message}`, true);
        }
    }

    function confirmImport() {
        if (!pending) return;
        if (!refreshCurrent()) return;
        let nextReferences;
        try { nextReferences = references.mergeImport(currentReferences, pending.references, pending.scales, pending.version); }
        catch (error) { message(error.message, true); return; }
        const active = activeSelection.read(localStorage);
        const effect = activeImportEffect(active, pending.scales, nextReferences, pending.version);
        const effectText = effect.remove ? " A consulta guardada vinculada será removida." :
            effect.start ? ` A consulta guardada passará a usar ${effect.start}.` : " A consulta guardada permanecerá.";
        if (!window.confirm(`Substituir as ${current.length} escala(s) deste navegador pelas ${pending.scales.length} escala(s) do backup v${pending.version}? ${currentReferences.length} referência(s) atuais, ${nextReferences.length} após importar.${effectText} Esta ação não altera a API local.`)) return;
        let previousScales;
        let previousActive;
        let previousReferences;
        let wroteScales = false;
        try {
            previousScales = localStorage.getItem(backup.STORAGE_KEY);
            previousActive = localStorage.getItem(activeSelection.KEY);
            previousReferences = localStorage.getItem(references.KEY);
            localStorage.setItem(backup.STORAGE_KEY, JSON.stringify(pending.scales));
            wroteScales = true;
            localStorage.setItem(references.KEY, JSON.stringify(nextReferences));
            if (effect.remove) localStorage.removeItem(activeSelection.KEY);
            else if (effect.start) localStorage.setItem(activeSelection.KEY, JSON.stringify({ ...active, start: effect.start }));
            clearPreview();
            fileInput.value = "";
            refreshCurrent();
            message(`Backup importado. ${effect.remove ? "A consulta guardada vinculada foi removida; configure-a novamente." : effect.start ? "A referência da consulta guardada foi atualizada." : "A consulta guardada permaneceu."} Abra o simulador, comparador ou relatório para usar as escalas restauradas.`);
        } catch (error) {
            if (wroteScales) {
                try {
                    if (previousScales === null) localStorage.removeItem(backup.STORAGE_KEY);
                    else localStorage.setItem(backup.STORAGE_KEY, previousScales);
                    if (previousReferences === null) localStorage.removeItem(references.KEY);
                    else localStorage.setItem(references.KEY, previousReferences);
                    if (previousActive === null) localStorage.removeItem(activeSelection.KEY);
                    else localStorage.setItem(activeSelection.KEY, previousActive);
                } catch (rollbackError) {
                    message(`Falha ao concluir a importação e restaurar os dados anteriores: ${rollbackError.message}. Confira os dados neste dispositivo.`, true);
                    return;
                }
            }
            message(`Nada foi importado: ${error.message}`, true);
        }
    }

    const menuButton = document.querySelector("#mobileMenuButton");
    const menu = document.querySelector("#navLinks");
    menuButton.addEventListener("click", () => {
        const expanded = menu.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(expanded));
        menuButton.setAttribute("aria-label", expanded ? "Fechar menu" : "Abrir menu");
    });
    exportButton.addEventListener("click", () => downloadBackup(false));
    widgetExportButton.addEventListener("click", () => downloadBackup(true));
    fileInput.addEventListener("change", prepareImport);
    confirmButton.addEventListener("click", confirmImport);
    window.addEventListener("storage", (event) => {
        if (event.key === backup.STORAGE_KEY || event.key === activeSelection.KEY || event.key === references.KEY) {
            clearPreview();
            refreshCurrent();
            message("Os dados mudaram em outra página. Selecione o backup novamente antes de importar.");
        }
    });
    refreshCurrent();
}());
