(function attachScaleReportCore(global) {
    "use strict";

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}/${date.getFullYear()}`;
    }

    function weekdayName(date) {
        return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
    }

    function csvCell(value) {
        let text = String(value ?? "");
        if (/^[\s]*[=+\-@]/u.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
    }

    function createMonthlyReport({ mode, month, time, scaleA, scaleB = null }) {
        if (mode !== "single" && mode !== "compare") {
            throw new RangeError("Selecione um relatório de uma escala ou de duas escalas.");
        }
        if (!(month instanceof Date) || !Number.isFinite(month.getTime())) {
            throw new RangeError("Selecione um mês válido para o relatório.");
        }
        if (mode === "compare" && !scaleB) {
            throw new RangeError("Selecione a Escala B para comparar.");
        }

        const usesTime = scaleA?.type === "ciclo_horas" || (mode === "compare" && scaleB?.type === "ciclo_horas");
        const observedTime = usesTime ? time : null;
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const comparison = global.ScaleCalendarCore.compareMonth(
            scaleA,
            mode === "compare" ? scaleB : scaleA,
            monthStart,
            usesTime ? time : "12:00"
        );
        const rows = comparison.days.map((day) => ({
            date: day.date,
            dateLabel: formatDate(day.date),
            weekday: weekdayName(day.date),
            statusA: day.statusA,
            statusB: mode === "compare" ? day.statusB : null,
            transitionA: Boolean(day.intervalsA && day.intervalsA.length > 1),
            transitionB: mode === "compare" && Boolean(day.intervalsB && day.intervalsB.length > 1)
        }));

        return {
            mode,
            year: comparison.year,
            month: comparison.month,
            time: observedTime,
            usesTime,
            monthLabel: new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(monthStart),
            periodStart: rows[0].dateLabel,
            periodEnd: rows[rows.length - 1].dateLabel,
            scaleA,
            scaleB: mode === "compare" ? scaleB : null,
            summary: mode === "single"
                ? { aWorking: comparison.summary.aWorking, aOff: rows.length - comparison.summary.aWorking }
                : comparison.summary,
            rows
        };
    }

    function createCsv(report) {
        if (!report || !Array.isArray(report.rows) || !report.scaleA) {
            throw new TypeError("Não há um relatório válido para exportar.");
        }

        const lines = [
            ["Relatório mensal de escalas"],
            ["Período", `${report.periodStart} a ${report.periodEnd}`],
            ["Horário consultado", report.usesTime ? report.time : "Não se aplica a escalas por dias"],
            ["Regra da amostra", report.usesTime
                ? `Status observado às ${report.time}; não representa dias inteiros nem horas trabalhadas.`
                : "Status por data; não representa horas trabalhadas."],
            ["Escala A", report.scaleA.name],
            ["Parâmetros da Escala A", report.scaleA.parameters],
            ["Data inicial da Escala A", report.scaleA.anchor],
            ["Origem da Escala A", report.scaleA.origin ?? report.scaleA.source]
        ];

        if (report.mode === "compare" && report.scaleB) {
            lines.push(
                ["Escala B", report.scaleB.name],
                ["Parâmetros da Escala B", report.scaleB.parameters],
                ["Data inicial da Escala B", report.scaleB.anchor],
                ["Origem da Escala B", report.scaleB.origin ?? report.scaleB.source]
            );
        }

        if (report.mode === "single") {
            lines.push(
                [`Datas com status de trabalho da Escala A${report.usesTime ? ` às ${report.time}` : ""}`, report.summary.aWorking],
                [`Datas com status de folga da Escala A${report.usesTime ? ` às ${report.time}` : ""}`, report.summary.aOff]
            );
        } else {
            lines.push(
                [`Datas com status de trabalho da Escala A${report.usesTime ? ` às ${report.time}` : ""}`, report.summary.aWorking],
                [`Datas com status de trabalho da Escala B${report.usesTime ? ` às ${report.time}` : ""}`, report.summary.bWorking],
                [`Datas com ambas em folga${report.usesTime ? ` às ${report.time}` : ""}`, report.summary.bothOff]
            );
        }

        const suffix = report.usesTime ? ` às ${report.time}` : "";
        const headers = ["Data", "Dia da semana", `Situação da Escala A${suffix}`];
        if (report.mode === "compare") headers.push(`Situação da Escala B${suffix}`);
        lines.push([], headers);

        report.rows.forEach((row) => {
            const values = [row.dateLabel, row.weekday, row.statusA];
            if (report.mode === "compare") values.push(row.statusB);
            lines.push(values);
        });

        return `\uFEFF${lines.map((line) => line.map(csvCell).join(";")).join("\r\n")}`;
    }

    global.ScaleReportCore = Object.freeze({
        createMonthlyReport,
        createCsv,
        csvCell
    });
}(window));
