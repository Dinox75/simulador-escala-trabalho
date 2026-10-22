(function initDeviceData() {
    "use strict";

    const backup = window.ScaleBackup;
    const activeSelection = window.ScaleActiveSelection;
    const count = document.querySelector("#storedCount");
    const feedback = document.querySelector("#dataFeedback");
    const exportButton = document.querySelector("#exportBackup");
    const fileInput = document.querySelector("#importFile");
    const preview = document.querySelector("#importPreview");
    const confirmButton = document.querySelector("#confirmImport");
    let current = [];
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
            count.textContent = `${current.length} escala${current.length === 1 ? "" : "s"} salva${current.length === 1 ? "" : "s"} neste navegador.`;
            exportButton.disabled = false;
            return true;
        } catch (error) {
            current = [];
            count.textContent = "Os dados locais precisam de revisão; nenhuma escala foi alterada.";
            exportButton.disabled = true;
            clearPreview();
            message(error.message, true);
            return false;
        }
    }

    function downloadBackup() {
        try {
            const text = backup.createBackup(current);
            const url = URL.createObjectURL(new Blob([text], { type: "application/json;charset=utf-8" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `backup-escalas-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            message("Backup baixado. Guarde o arquivo fora deste dispositivo.");
        } catch (error) { message(error.message, true); }
    }

    function showPreview(scales) {
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
        const affectsActive = activeSelection.invalidatedByReplacement(active, current, scales);
        const activeEffect = document.createElement("p");
        activeEffect.textContent = affectsActive
            ? `A consulta guardada "${active.scale.nome}" também será removida porque seu cadastro será removido ou alterado.`
            : active ? "A consulta guardada permanecerá neste dispositivo; confirme seu início antes de usá-la." :
                "Não há consulta guardada para remover.";
        preview.replaceChildren(title, description, names, activeEffect);
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
            const scales = backup.parseBackup(text);
            pending = scales;
            showPreview(scales);
            message("Confira a prévia. As escalas atuais continuam intactas até sua confirmação.");
        } catch (error) {
            clearPreview();
            message(`Backup não importado: ${error.message}`, true);
        }
    }

    function confirmImport() {
        if (!pending) return;
        if (!refreshCurrent()) return;
        const active = activeSelection.read(localStorage);
        const affectsActive = activeSelection.invalidatedByReplacement(active, current, pending);
        const effect = affectsActive ? " A consulta guardada vinculada será removida." :
            " A consulta guardada independente permanecerá.";
        if (!window.confirm(`Substituir as ${current.length} escala(s) deste navegador pelas ${pending.length} escala(s) do backup?${effect} Esta ação não altera a API local.`)) return;
        let previousScales;
        let previousActive;
        let wroteScales = false;
        try {
            previousScales = localStorage.getItem(backup.STORAGE_KEY);
            previousActive = localStorage.getItem(activeSelection.KEY);
            localStorage.setItem(backup.STORAGE_KEY, JSON.stringify(pending));
            wroteScales = true;
            if (affectsActive) localStorage.removeItem(activeSelection.KEY);
            clearPreview();
            fileInput.value = "";
            refreshCurrent();
            message(`Backup importado. ${affectsActive ? "A consulta guardada vinculada foi removida; configure-a novamente." : "A consulta guardada permaneceu."} Abra o simulador, comparador ou relatório para usar as escalas restauradas.`);
        } catch (error) {
            if (wroteScales) {
                try {
                    if (previousScales === null) localStorage.removeItem(backup.STORAGE_KEY);
                    else localStorage.setItem(backup.STORAGE_KEY, previousScales);
                    if (previousActive !== null) localStorage.setItem(activeSelection.KEY, previousActive);
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
    exportButton.addEventListener("click", downloadBackup);
    fileInput.addEventListener("change", prepareImport);
    confirmButton.addEventListener("click", confirmImport);
    window.addEventListener("storage", (event) => {
        if (event.key === backup.STORAGE_KEY || event.key === activeSelection.KEY) {
            clearPreview();
            refreshCurrent();
            message("Os dados mudaram em outra página. Selecione o backup novamente antes de importar.");
        }
    });
    refreshCurrent();
}());
