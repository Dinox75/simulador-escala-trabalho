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

    global.ScaleCalendarCore = Object.freeze({
        cycleDaysPosition,
        cycleDaysStatus,
        cycleHoursPosition,
        cycleHoursStatus,
        cycleHoursSegments,
        monthCells,
        moveMonth,
        rotativePosition,
        rotativeStatus
    });
}(window));
