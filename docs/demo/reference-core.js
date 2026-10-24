(function attachScaleReferences(global) {
    "use strict";

    const KEY = "simulador_escala_references_v1";
    const SOURCES = new Set(["local", "api", "model"]);
    const MAX_REFERENCES = 500;

    function definition(scale) {
        if (!scale || typeof scale.nome !== "string" || !scale.nome.trim() ||
            scale.nome.length > 80 || scale.nome.trim() !== scale.nome ||
            /[\u0000-\u001f\u007f]/u.test(scale.nome)) throw new Error("Nome de escala inválido.");
        const base = { nome: scale.nome, tipo: scale.tipo };
        if (scale.tipo === "ciclo_dias" || scale.tipo === "ciclo_horas") {
            const work = scale.tipo === "ciclo_dias" ? "dias_trabalho" : "horas_trabalho";
            const off = scale.tipo === "ciclo_dias" ? "dias_folga" : "horas_folga";
            if (!Number.isInteger(scale[work]) || !Number.isInteger(scale[off]) ||
                scale[work] < 1 || scale[off] < 1 || scale[work] + scale[off] > 120) {
                throw new Error("Ciclo de escala inválido.");
            }
            return { ...base, [work]: scale[work], [off]: scale[off] };
        }
        if (scale.tipo === "turno_rotativo" && Array.isArray(scale.sequencia_turnos) &&
            scale.sequencia_turnos.length >= 1 && scale.sequencia_turnos.length <= 60 &&
            scale.sequencia_turnos.every((turn) => typeof turn === "string" && turn.trim() === turn &&
                turn.length >= 1 && turn.length <= 32 && !/[\u0000-\u001f\u007f]/u.test(turn))) {
            return { ...base, sequencia_turnos: [...scale.sequencia_turnos] };
        }
        throw new Error("Sequência ou tipo de escala inválido.");
    }

    function validStart(type, start) {
        if (typeof start !== "string") return false;
        const match = type === "ciclo_horas"
            ? /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/u.exec(start)
            : /^(\d{4})-(\d{2})-(\d{2})$/u.exec(start);
        if (!match) return false;
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const date = new Date(year, month - 1, day);
        return year >= 1000 && date.getFullYear() === year &&
            date.getMonth() === month - 1 && date.getDate() === day;
    }

    function identity(scale, source) {
        return `${source}:${scale.nome.toLocaleLowerCase("pt-BR")}`;
    }

    function validate(records) {
        if (!Array.isArray(records) || records.length > MAX_REFERENCES) {
            throw new Error("A lista de referências é inválida ou excede o limite.");
        }
        const seen = new Set();
        return records.map((entry) => {
            if (!entry || typeof entry !== "object" || Array.isArray(entry) ||
                Object.keys(entry).some((key) => !["source", "scale", "start"].includes(key)) ||
                !SOURCES.has(entry.source)) throw new Error("Referência de escala inválida.");
            const scale = definition(entry.scale);
            if (Object.keys(entry.scale).some((key) => !Object.keys(scale).includes(key)) ||
                !validStart(scale.tipo, entry.start)) throw new Error(`Referência inválida para "${scale.nome}".`);
            const key = identity(scale, entry.source);
            if (seen.has(key)) throw new Error(`Referência repetida para "${scale.nome}".`);
            seen.add(key);
            return { source: entry.source, scale, start: entry.start };
        });
    }

    function read(storage) {
        const raw = storage.getItem(KEY);
        if (raw === null) return [];
        try { return validate(JSON.parse(raw)); }
        catch (error) { throw new Error(`As referências deste dispositivo precisam de revisão; nada foi sobrescrito: ${error.message}`); }
    }

    function find(records, scale, source) {
        if (!scale || !SOURCES.has(source)) return null;
        const normalized = definition(scale);
        const key = identity(normalized, source);
        const entry = records.find((item) => identity(item.scale, item.source) === key);
        return entry && JSON.stringify(entry.scale) === JSON.stringify(normalized) ? entry.start : null;
    }

    function set(storage, scale, source, start) {
        const normalized = definition(scale);
        if (!SOURCES.has(source) || !validStart(normalized.tipo, start)) {
            throw new Error("Informe uma data de início da sequência válida.");
        }
        const records = read(storage).filter((item) => identity(item.scale, item.source) !== identity(normalized, source));
        records.push({ source, scale: normalized, start });
        storage.setItem(KEY, JSON.stringify(validate(records)));
        return records;
    }

    function remove(storage, scale, source) {
        const records = read(storage).filter((item) => identity(item.scale, item.source) !== identity(scale, source));
        storage.setItem(KEY, JSON.stringify(records));
    }

    function mergeImport(existing, incoming, scales, version) {
        const old = validate(existing);
        const imported = validate(incoming);
        const localMatches = (record) => scales.some((scale) =>
            identity(scale, "local") === identity(record.scale, "local") &&
            JSON.stringify(definition(scale)) === JSON.stringify(record.scale));
        const kept = old.filter((record) => record.source !== "local" ||
            (version === 1 && localMatches(record)));
        if (version === 1) return kept;
        const merged = new Map(kept.map((record) => [identity(record.scale, record.source), record]));
        imported.forEach((record) => {
            if (record.source !== "local" || localMatches(record)) {
                merged.set(identity(record.scale, record.source), record);
            } else throw new Error(`A referência de "${record.scale.nome}" não corresponde às escalas importadas.`);
        });
        return validate([...merged.values()]);
    }

    global.ScaleReferences = Object.freeze({ KEY, definition, validStart, validate, read, find, set, remove, mergeImport });
}(window));
