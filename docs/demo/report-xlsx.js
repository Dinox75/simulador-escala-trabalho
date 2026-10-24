(function attachScaleReportXlsx(global) {
    "use strict";

    const encoder = new TextEncoder();
    const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    function xml(value) {
        return String(value ?? "")
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    }

    function column(index) {
        let result = "";
        for (let value = index; value > 0; value = Math.floor((value - 1) / 26)) {
            result = String.fromCharCode(65 + (value - 1) % 26) + result;
        }
        return result;
    }

    function cell(row, col, value, style = 0) {
        const reference = `${column(col)}${row}`;
        if (typeof value === "number") return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
        return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
    }

    function row(index, cells, height = null) {
        const attributes = height ? ` ht="${height}" customHeight="1"` : "";
        return `<row r="${index}"${attributes}>${cells.join("")}</row>`;
    }

    function worksheet(rows, columns, merges = [], landscape = false) {
        const widths = columns.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
        const merged = merges.length ? `<mergeCells count="${merges.length}">${merges.map((range) => `<mergeCell ref="${range}"/>`).join("")}</mergeCells>` : "";
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
            `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
            `<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>` +
            `<sheetFormatPr defaultRowHeight="18"/><cols>${widths}</cols><sheetData>${rows.join("")}</sheetData>${merged}` +
            `<printOptions horizontalCentered="1"/><pageMargins left="0.3" right="0.3" top="0.45" bottom="0.45" header="0.2" footer="0.2"/>` +
            `<pageSetup paperSize="9" orientation="${landscape ? "landscape" : "portrait"}" fitToWidth="1" fitToHeight="1"/>` +
            `</worksheet>`;
    }

    function statusStyle(status) {
        if (status === "Folga") return 6;
        if (status === "Manhã") return 7;
        if (status === "Tarde") return 8;
        if (status === "Noite") return 9;
        return 5;
    }

    function calendarSheet(report) {
        const rows = [];
        const merges = ["A1:G1", "A2:G2", "A3:G3", "A5:G5", "A6:G6", "A7:G7", "A8:G8", "A10:G10", "A14:G14", "A15:G15"];
        const observation = report.usesTime ? `às ${report.time}` : "por data";
        rows.push(row(1, [cell(1, 1, `Relatório mensal · ${report.monthLabel}`, 1)], 30));
        rows.push(row(2, [cell(2, 1, `Período: ${report.periodStart} a ${report.periodEnd} · Consulta ${observation}`, 2)], 23));
        rows.push(row(3, [cell(3, 1, (report.usesTime
            ? `Status observado às ${report.time} em cada data; não representa dias inteiros nem horas trabalhadas.`
            : "Status por data; não representa horas trabalhadas.") +
            (report.summary.aBefore || report.summary.bBefore ? " Datas anteriores ao início são projeções fora dos totais." : ""), 11)], 30));
        rows.push(row(5, [cell(5, 1, `Escala A · ${report.scaleA.name}`, 3)], 24));
        rows.push(row(6, [cell(6, 1, `${report.scaleA.parameters} · Início do ciclo: ${report.scaleA.anchor} · ${report.scaleA.origin}`, 2)], 30));
        if (report.mode === "compare") {
            rows.push(row(7, [cell(7, 1, `Escala B · ${report.scaleB.name}`, 3)], 24));
            rows.push(row(8, [cell(8, 1, `${report.scaleB.parameters} · Início do ciclo: ${report.scaleB.anchor} · ${report.scaleB.origin}`, 2)], 30));
        }
        rows.push(row(10, [cell(10, 1, `Resumo da consulta ${observation}`, 3)], 24));
        const summary = report.mode === "compare"
            ? [["A em trabalho", report.summary.aWorking], ["B em trabalho", report.summary.bWorking], ["Ambas em folga", report.summary.bothOff]]
            : [["A em trabalho", report.summary.aWorking], ["A em folga", report.summary.aOff]];
        rows.push(row(11, summary.flatMap(([label, value], index) => [cell(11, index * 2 + 1, label, 4), cell(11, index * 2 + 2, value, 12)]), 24));
        if (report.summary.aBefore || report.summary.bBefore) {
            rows.push(row(12, [cell(12, 1, `Fora dos totais: A ${report.summary.aBefore}${report.mode === "compare" ? ` · B ${report.summary.bBefore}` : ""} data(s) anteriores ao início.`, 11)], 23));
        }
        rows.push(row(14, [cell(14, 1, "Calendário mensal", 3)], 24));
        rows.push(row(15, [cell(15, 1, "Legenda: Trabalho · Folga · Manhã · Tarde · Noite. Cada célula traz o status da A e, quando houver, da B. Folgas coincidentes são destacadas.", 11)], 30));
        rows.push(row(16, weekdays.map((day, index) => cell(16, index + 1, day, 4)), 23));
        const leading = report.rows[0].date.getDay();
        const weekCount = Math.ceil((leading + report.rows.length) / 7);
        for (let week = 0; week < weekCount; week += 1) {
            const index = 17 + week;
            const cells = [];
            for (let day = 0; day < 7; day += 1) {
                const record = report.rows[week * 7 + day - leading];
                if (!record) continue;
                const bothOff = report.mode === "compare" && !record.beforeA && !record.beforeB && record.statusA === "Folga" && record.statusB === "Folga";
                const details = [record.dateLabel, `A · ${global.ScaleReportCore.displayedStatus(record.statusA, record.beforeA)}`];
                if (report.mode === "compare") details.push(`B · ${global.ScaleReportCore.displayedStatus(record.statusB, record.beforeB)}`);
                if (record.transitionA || record.transitionB) details.push("Transição na data");
                cells.push(cell(index, day + 1, details.join("\n"), bothOff ? 10 : statusStyle(record.statusA)));
            }
            rows.push(row(index, cells, report.mode === "compare" ? 71 : 58));
        }
        return worksheet(rows, Array(7).fill(20), merges, true);
    }

    function recordsSheet(report) {
        const rows = [];
        const end = report.mode === "compare" ? "D" : "C";
        const suffix = report.usesTime ? ` às ${report.time}` : "";
        rows.push(row(1, [cell(1, 1, `Registros · ${report.monthLabel}`, 1)], 30));
        rows.push(row(2, [cell(2, 1, `${report.periodStart} a ${report.periodEnd} · Status${suffix || " por data"}`, 2)], 23));
        rows.push(row(3, [cell(3, 1, report.usesTime
            ? "Cada registro é uma observação no horário escolhido; não representa dias inteiros nem horas trabalhadas."
            : "Status por data; não representa horas trabalhadas.", 11)], 30));
        rows.push(row(5, ["Data", "Dia da semana", `Escala A${suffix}`].concat(report.mode === "compare" ? [`Escala B${suffix}`] : []).map((value, index) => cell(5, index + 1, value, 4)), 25));
        report.rows.forEach((record, index) => {
            const number = index + 6;
            const cells = [cell(number, 1, record.dateLabel), cell(number, 2, record.weekday), cell(number, 3, global.ScaleReportCore.displayedStatus(record.statusA, record.beforeA), statusStyle(record.statusA))];
            if (report.mode === "compare") cells.push(cell(number, 4, global.ScaleReportCore.displayedStatus(record.statusB, record.beforeB), statusStyle(record.statusB)));
            rows.push(row(number, cells, 22));
        });
        return worksheet(rows, report.mode === "compare" ? [16, 22, 25, 25] : [16, 22, 25], [`A1:${end}1`, `A2:${end}2`, `A3:${end}3`]);
    }

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<fonts count="4"><font><sz val="11"/><color rgb="FF243647"/><name val="Aptos"/></font>` +
        `<font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font>` +
        `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font>` +
        `<font><b/><sz val="11"/><color rgb="FF243647"/><name val="Aptos"/></font></fonts>` +
        `<fills count="9"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
        ["FF19344D","FFE5F0FA","FFFFF0D4","FFE4F1FB","FFFFF0E2","FFECEAF7","FFFFDE9E"].map(color => `<fill><patternFill patternType="solid"><fgColor rgb="${color}"/><bgColor indexed="64"/></patternFill></fill>`).join("") +
        `</fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
        `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
        `<cellXfs count="13">` +
        `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
        `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"><alignment vertical="center"/></xf>` +
        `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment wrapText="1" vertical="center"/></xf>` +
        `<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"/>` +
        `<xf numFmtId="0" fontId="3" fillId="3" borderId="0" xfId="0" applyFill="1"><alignment wrapText="1" vertical="center"/></xf>` +
        [3,4,5,6,7,8].map(fill => `<xf numFmtId="0" fontId="0" fillId="${fill}" borderId="0" xfId="0" applyFill="1"><alignment wrapText="1" vertical="center"/></xf>`).join("") +
        `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment wrapText="1" vertical="center"/></xf>` +
        `<xf numFmtId="0" fontId="3" fillId="3" borderId="0" xfId="0" applyFill="1"><alignment horizontal="center"/></xf>` +
        `</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

    const crcTable = Array.from({ length: 256 }, (_, index) => {
        let value = index;
        for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
        return value >>> 0;
    });

    function crc32(bytes) {
        let crc = 0xFFFFFFFF;
        bytes.forEach((byte) => { crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); });
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function zip(files) {
        const chunks = [];
        const directory = [];
        let offset = 0;
        files.forEach(([name, content]) => {
            const nameBytes = encoder.encode(name);
            const bytes = encoder.encode(content);
            const checksum = crc32(bytes);
            const local = new Uint8Array(30 + nameBytes.length);
            const localView = new DataView(local.buffer);
            localView.setUint32(0, 0x04034B50, true);
            localView.setUint16(4, 20, true);
            localView.setUint32(14, checksum, true);
            localView.setUint32(18, bytes.length, true);
            localView.setUint32(22, bytes.length, true);
            localView.setUint16(26, nameBytes.length, true);
            local.set(nameBytes, 30);
            chunks.push(local, bytes);

            const central = new Uint8Array(46 + nameBytes.length);
            const view = new DataView(central.buffer);
            view.setUint32(0, 0x02014B50, true);
            view.setUint16(4, 20, true);
            view.setUint16(6, 20, true);
            view.setUint32(16, checksum, true);
            view.setUint32(20, bytes.length, true);
            view.setUint32(24, bytes.length, true);
            view.setUint16(28, nameBytes.length, true);
            view.setUint32(42, offset, true);
            central.set(nameBytes, 46);
            directory.push(central);
            offset += local.length + bytes.length;
        });
        const directoryLength = directory.reduce((sum, entry) => sum + entry.length, 0);
        const end = new Uint8Array(22);
        const endView = new DataView(end.buffer);
        endView.setUint32(0, 0x06054B50, true);
        endView.setUint16(8, files.length, true);
        endView.setUint16(10, files.length, true);
        endView.setUint32(12, directoryLength, true);
        endView.setUint32(16, offset, true);
        const parts = [...chunks, ...directory, end];
        const result = new Uint8Array(offset + directoryLength + end.length);
        let cursor = 0;
        parts.forEach((part) => { result.set(part, cursor); cursor += part.length; });
        return result;
    }

    function createXlsx(report) {
        if (!report || !Array.isArray(report.rows) || !report.rows.length || !report.scaleA) {
            throw new TypeError("Não há um relatório válido para exportar.");
        }
        return zip([
            ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
            ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
            ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Calendário" sheetId="1" r:id="rId1"/><sheet name="Registros" sheetId="2" r:id="rId2"/></sheets></workbook>`],
            ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
            ["xl/styles.xml", styles],
            ["xl/worksheets/sheet1.xml", calendarSheet(report)],
            ["xl/worksheets/sheet2.xml", recordsSheet(report)]
        ]);
    }

    global.ScaleReportXlsx = Object.freeze({ createXlsx });
}(window));
