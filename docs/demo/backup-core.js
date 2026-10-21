(function attachScaleBackup(global) {
    "use strict";

    const STORAGE_KEY = "simulador_escala_demo_v014_local";
    const FALLBACK_KEYS = ["simulador_escala_demo_v013", "simulador_escala_demo_v09"];
    const FORMAT = "simulador-escalas-backup";
    const MAX_FILE_BYTES = 512 * 1024;
    const MAX_SCALES = 200;
    const MAX_CYCLE = 120;
    const MAX_TURNS = 60;

    function plainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value)
            && Object.getPrototypeOf(value) === Object.prototype;
    }

    function positiveInteger(value) {
        return Number.isInteger(value) && value > 0;
    }

    function validateScales(value) {
        if (!Array.isArray(value) || value.length > MAX_SCALES) {
            throw new Error(`O backup deve conter uma lista com até ${MAX_SCALES} escalas.`);
        }
        const names = new Set();
        const configurations = new Set();
        return value.map((scale, index) => {
            if (!plainObject(scale) || typeof scale.nome !== "string" ||
                scale.nome.trim() !== scale.nome || !scale.nome || scale.nome.length > 80 ||
                /[\u0000-\u001f\u007f]/u.test(scale.nome)) {
                throw new Error(`A escala ${index + 1} tem nome inválido (máximo de 80 caracteres).`);
            }
            const nameKey = scale.nome.toLocaleLowerCase("pt-BR");
            if (names.has(nameKey)) throw new Error(`O nome "${scale.nome}" aparece mais de uma vez.`);
            names.add(nameKey);

            let result;
            let allowed;
            if (scale.tipo === "ciclo_dias" || scale.tipo === "ciclo_horas") {
                const workKey = scale.tipo === "ciclo_dias" ? "dias_trabalho" : "horas_trabalho";
                const offKey = scale.tipo === "ciclo_dias" ? "dias_folga" : "horas_folga";
                if (!positiveInteger(scale[workKey]) || !positiveInteger(scale[offKey]) ||
                    scale[workKey] + scale[offKey] > MAX_CYCLE) {
                    throw new Error(`A escala "${scale.nome}" precisa de períodos positivos e ciclo de até ${MAX_CYCLE}.`);
                }
                result = { nome: scale.nome, tipo: scale.tipo, [workKey]: scale[workKey], [offKey]: scale[offKey] };
                allowed = ["nome", "tipo", workKey, offKey];
            } else if (scale.tipo === "turno_rotativo") {
                if (!Array.isArray(scale.sequencia_turnos) || !scale.sequencia_turnos.length ||
                    scale.sequencia_turnos.length > MAX_TURNS ||
                    scale.sequencia_turnos.some((turn) => typeof turn !== "string" ||
                        turn.trim() !== turn || !turn || turn.length > 32 || /[\u0000-\u001f\u007f]/u.test(turn))) {
                    throw new Error(`A escala "${scale.nome}" precisa de 1 a ${MAX_TURNS} turnos válidos.`);
                }
                result = { nome: scale.nome, tipo: scale.tipo, sequencia_turnos: [...scale.sequencia_turnos] };
                allowed = ["nome", "tipo", "sequencia_turnos"];
            } else {
                throw new Error(`A escala "${scale.nome}" tem tipo desconhecido.`);
            }
            if (Object.keys(scale).some((key) => !allowed.includes(key))) {
                throw new Error(`A escala "${scale.nome}" contém campos não reconhecidos.`);
            }
            const configuration = JSON.stringify({ ...result, nome: undefined });
            if (configurations.has(configuration)) {
                throw new Error(`A configuração da escala "${scale.nome}" está repetida.`);
            }
            configurations.add(configuration);
            return result;
        });
    }

    function readStored(storage) {
        for (const key of [STORAGE_KEY, ...FALLBACK_KEYS]) {
            const raw = storage.getItem(key);
            if (raw === null) continue;
            let value;
            try { value = JSON.parse(raw); }
            catch { throw new Error(`Os dados existentes em ${key} não são JSON válido. Eles não foram alterados.`); }
            try { return { key, scales: validateScales(value) }; }
            catch (error) { throw new Error(`Os dados existentes em ${key} precisam de revisão: ${error.message}`); }
        }
        return { key: STORAGE_KEY, scales: [] };
    }

    function parseBackup(text) {
        if (typeof text !== "string" || new TextEncoder().encode(text).length > MAX_FILE_BYTES) {
            throw new Error("O arquivo excede 512 KB.");
        }
        let value;
        try { value = JSON.parse(text.replace(/^\uFEFF/u, "")); }
        catch { throw new Error("O arquivo não contém JSON válido."); }
        if (!plainObject(value) || value.format !== FORMAT || value.version !== 1 ||
            Object.keys(value).some((key) => !["format", "version", "exported_at", "scales"].includes(key))) {
            throw new Error("O arquivo não é um backup compatível do Simulador.");
        }
        return validateScales(value.scales);
    }

    function createBackup(scales, exportedAt = new Date().toISOString()) {
        return JSON.stringify({ format: FORMAT, version: 1, exported_at: exportedAt,
            scales: validateScales(scales) }, null, 2);
    }

    global.ScaleBackup = Object.freeze({
        STORAGE_KEY, MAX_FILE_BYTES, MAX_SCALES, validateScales, readStored, parseBackup, createBackup
    });
}(window));
