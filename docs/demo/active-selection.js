(function attachActiveSelection(global) {
    "use strict";

    const KEY = "simulador_escala_active_v1";

    function sameConfiguration(first, second) {
        if (!first || !second || first.tipo !== second.tipo) return false;
        if (first.tipo === "ciclo_dias") {
            return first.dias_trabalho === second.dias_trabalho && first.dias_folga === second.dias_folga;
        }
        if (first.tipo === "ciclo_horas") {
            return first.horas_trabalho === second.horas_trabalho && first.horas_folga === second.horas_folga;
        }
        if (first.tipo === "turno_rotativo") {
            return Array.isArray(first.sequencia_turnos) && Array.isArray(second.sequencia_turnos) &&
                first.sequencia_turnos.length === second.sequencia_turnos.length &&
                first.sequencia_turnos.every((turn, index) => turn === second.sequencia_turnos[index]);
        }
        return false;
    }

    function read(storage) {
        try {
            const raw = storage.getItem(KEY);
            const record = raw === null ? null : JSON.parse(raw);
            return record && typeof record === "object" && !Array.isArray(record) ? record : null;
        } catch { return null; }
    }

    function linkedToScale(record, scale, source) {
        return record?.flow === "saved" && typeof record.scale?.nome === "string" &&
            typeof scale?.nome === "string" && record.scale.nome === scale.nome &&
            (!record.source || record.source === source);
    }

    function invalidatedByReplacement(record, current, incoming) {
        if (record?.flow !== "saved" || !record.scale?.nome || record.source === "api") return false;
        const linkedLocally = record.source === "local" ||
            (Array.isArray(current) && current.some((scale) =>
                linkedToScale(record, scale, "local") && sameConfiguration(record.scale, scale)));
        if (!linkedLocally) return false;
        return !Array.isArray(incoming) || !incoming.some((scale) =>
            linkedToScale(record, scale, "local") && sameConfiguration(record.scale, scale));
    }

    global.ScaleActiveSelection = Object.freeze({
        KEY, read, linkedToScale, invalidatedByReplacement
    });
}(window));
