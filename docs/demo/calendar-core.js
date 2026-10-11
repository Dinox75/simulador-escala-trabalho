(function attachScaleCalendarCore(global) {
    "use strict";

    function positiveModulo(value, divisor) {
        return ((value % divisor) + divisor) % divisor;
    }

    function wallClockMilliseconds(date) {
        return Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        );
    }

    function dayMilliseconds(date) {
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function moveMonth(date, amount) {
        return new Date(date.getFullYear(), date.getMonth() + amount, 1);
    }

    function monthCells(date) {
        const first = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const leading = first.getDay();
        const cellCount = Math.ceil((leading + dayCount) / 7) * 7;

        return Array.from({ length: cellCount }, (_, index) => {
            const day = index - leading + 1;
            return day > 0 && day <= dayCount
                ? new Date(date.getFullYear(), date.getMonth(), day)
                : null;
        });
    }

    function cycleDaysPosition(start, query, workDays, offDays) {
        const cycle = workDays + offDays;
        if (!Number.isInteger(workDays) || !Number.isInteger(offDays) || workDays < 1 || offDays < 1) {
            throw new RangeError("O ciclo por dias exige períodos positivos.");
        }

        const elapsedDays = (dayMilliseconds(query) - dayMilliseconds(start)) / 86400000;
        return positiveModulo(elapsedDays, cycle);
    }

    function cycleDaysStatus(start, query, workDays, offDays) {
        return cycleDaysPosition(start, query, workDays, offDays) < workDays
            ? "Trabalhando"
            : "Folga";
    }

    function cycleHoursPosition(start, query, workHours, offHours) {
        const cycle = workHours + offHours;
        if (!Number.isFinite(cycle) || workHours <= 0 || offHours <= 0) {
            throw new RangeError("O ciclo por horas exige períodos positivos.");
        }

        const elapsedHours = (wallClockMilliseconds(query) - wallClockMilliseconds(start)) / 3600000;
        return positiveModulo(elapsedHours, cycle);
    }

    function cycleHoursStatus(start, query, workHours, offHours) {
        return cycleHoursPosition(start, query, workHours, offHours) < workHours
            ? "Trabalhando"
            : "Folga";
    }

    function rotativePosition(start, query, sequenceLength) {
        if (!Number.isInteger(sequenceLength) || sequenceLength < 1) {
            throw new RangeError("A sequência de turnos não pode ficar vazia.");
        }

        const elapsedDays = (dayMilliseconds(query) - dayMilliseconds(start)) / 86400000;
        return positiveModulo(elapsedDays, sequenceLength);
    }

    function rotativeStatus(start, query, sequence) {
        if (!Array.isArray(sequence) || sequence.length === 0) {
            throw new RangeError("A sequência de turnos não pode ficar vazia.");
        }

        return sequence[rotativePosition(start, query, sequence.length)];
    }

    function cycleHoursSegments(start, day, workHours, offHours) {
        const workMinutes = workHours * 60;
        const cycleMinutes = (workHours + offHours) * 60;
        if (!Number.isFinite(cycleMinutes) || workMinutes <= 0 || workMinutes >= cycleMinutes) {
            throw new RangeError("O ciclo por horas exige períodos positivos.");
        }

        const dayStart = dayMilliseconds(day) / 60000;
        const anchor = wallClockMilliseconds(start) / 60000;
        const segments = [];
        let cursor = 0;

        while (cursor < 1440) {
            const elapsed = dayStart + cursor - anchor;
            const phase = positiveModulo(elapsed, cycleMinutes);
            const isWork = phase < workMinutes;
            const boundary = isWork ? workMinutes - phase : cycleMinutes - phase;
            const end = Math.min(1440, cursor + Math.max(1, boundary));
            const status = isWork ? "Trabalhando" : "Folga";
            const previous = segments[segments.length - 1];

            if (previous && previous.status === status) {
                previous.endMinute = end;
            } else {
                segments.push({ status, startMinute: cursor, endMinute: end });
            }

            cursor = end;
        }

        return segments;
    }

    function isValidDate(date) {
        return date instanceof Date && Number.isFinite(date.getTime());
    }

    function validateComparisonSchedule(schedule) {
        if (!schedule || !isValidDate(schedule.start)) {
            throw new RangeError("Informe uma data inicial válida para cada escala.");
        }

        if (schedule.type === "ciclo_dias" || schedule.type === "ciclo_horas") {
            const work = schedule.work;
            const off = schedule.off;
            const unit = schedule.type === "ciclo_horas" ? "horas" : "dias";
            if (!Number.isInteger(work) || !Number.isInteger(off) || work < 1 || off < 1) {
                throw new RangeError(`Os períodos de trabalho e folga devem ser inteiros positivos em ${unit}.`);
            }
            if (work + off > 120) {
                throw new RangeError(`O ciclo completo pode ter no máximo 120 ${unit}.`);
            }
            return;
        }

        if (schedule.type === "turno_rotativo") {
            if (!Array.isArray(schedule.turns) || schedule.turns.length < 1) {
                throw new RangeError("Adicione pelo menos um turno à sequência.");
            }
            if (schedule.turns.length > 60) {
                throw new RangeError("A sequência pode ter no máximo 60 turnos.");
            }
            if (schedule.turns.some((turn) => typeof turn !== "string" || !turn.trim())) {
                throw new RangeError("A sequência contém um turno vazio ou inválido.");
            }
            const validTurns = new Set(["Manhã", "Tarde", "Noite", "Folga"]);
            if (schedule.turns.some((turn) => !validTurns.has(turn.trim()))) {
                throw new RangeError("Use apenas Manhã, Tarde, Noite ou Folga na sequência.");
            }
            return;
        }

        throw new RangeError("Tipo de escala não suportado para comparação.");
    }

    function timeParts(time) {
        const match = /^(?:([01]?[0-9]|2[0-3]):([0-5][0-9]))$/.exec(String(time || ""));
        if (!match) throw new RangeError("Informe um horário válido entre 00:00 e 23:59.");
        return [Number(match[1]), Number(match[2])];
    }

    function comparisonStatus(schedule, day, time) {
        validateComparisonSchedule(schedule);
        if (!isValidDate(day)) throw new RangeError("Informe uma data consultada válida.");

        if (schedule.type === "ciclo_horas") {
            const [hours, minutes] = timeParts(time);
            const query = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
            return cycleHoursStatus(schedule.start, query, schedule.work, schedule.off);
        }
        if (schedule.type === "turno_rotativo") {
            return rotativeStatus(schedule.start, day, schedule.turns);
        }
        return cycleDaysStatus(schedule.start, day, schedule.work, schedule.off);
    }

    function compareDay(scheduleA, scheduleB, day, time) {
        const statusA = comparisonStatus(scheduleA, day, time);
        const statusB = comparisonStatus(scheduleB, day, time);
        return {
            date: new Date(day.getFullYear(), day.getMonth(), day.getDate()),
            statusA,
            statusB,
            intervalsA: scheduleA.type === "ciclo_horas"
                ? cycleHoursSegments(scheduleA.start, day, scheduleA.work, scheduleA.off)
                : null,
            intervalsB: scheduleB.type === "ciclo_horas"
                ? cycleHoursSegments(scheduleB.start, day, scheduleB.work, scheduleB.off)
                : null
        };
    }

    function compareMonth(scheduleA, scheduleB, month, time) {
        if (!isValidDate(month)) throw new RangeError("Informe um mês válido para a comparação.");
        timeParts(time);
        validateComparisonSchedule(scheduleA);
        validateComparisonSchedule(scheduleB);

        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const dayCount = new Date(year, monthIndex + 1, 0).getDate();
        const days = [];
        const summary = { aWorking: 0, bWorking: 0, bothOff: 0 };
        for (let day = 1; day <= dayCount; day += 1) {
            const result = compareDay(
                scheduleA,
                scheduleB,
                new Date(year, monthIndex, day),
                time
            );
            const aWorking = result.statusA !== "Folga";
            const bWorking = result.statusB !== "Folga";
            if (aWorking) summary.aWorking += 1;
            if (bWorking) summary.bWorking += 1;
            if (!aWorking && !bWorking) summary.bothOff += 1;
            days.push(result);
        }
        return { year, month: monthIndex, time, days, summary };
    }

    global.ScaleCalendarCore = Object.freeze({
        cycleDaysPosition,
        cycleDaysStatus,
        cycleHoursPosition,
        cycleHoursStatus,
        cycleHoursSegments,
        compareDay,
        compareMonth,
        monthCells,
        moveMonth,
        rotativePosition,
        rotativeStatus
    });
}(window));
