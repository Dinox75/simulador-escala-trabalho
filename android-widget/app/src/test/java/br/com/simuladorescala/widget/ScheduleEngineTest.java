package br.com.simuladorescala.widget;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThrows;

import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.TimeZone;

/**
 * Expected statuses match calendar-core.js. Run the browser parity script as
 * well when changing either implementation.
 */
public class ScheduleEngineTest {
    @Test public void sharedBrowserFixtures() throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                getClass().getResourceAsStream("/parity-cases.tsv"), StandardCharsets.UTF_8))) {
            reader.readLine();
            String line;
            int checked = 0;
            while ((line = reader.readLine()) != null) {
                String[] fields = line.split("\t", -1);
                ScheduleEngine.Scale scale = new ScheduleEngine.Scale("Fixture", fields[0],
                        Integer.parseInt(fields[3]), Integer.parseInt(fields[4]),
                        fields[5].isEmpty() ? Collections.emptyList()
                                : Arrays.asList(fields[5].split("\\|", -1)));
                ScheduleEngine.Selection selection = new ScheduleEngine.Selection(scale,
                        LocalDate.parse(fields[1]), LocalTime.parse(fields[2]));
                assertEquals(line, fields[7], ScheduleEngine.status(
                        selection, LocalDateTime.parse(fields[6])));
                checked++;
            }
            assertEquals(11, checked);
        }
    }

    private ScheduleEngine.Selection days(String anchor) {
        return new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("6x3", "ciclo_dias", 6, 3, null),
                LocalDate.parse(anchor), LocalTime.MIDNIGHT);
    }

    @Test public void datesBeforeAnchorAndAcrossMonth() {
        ScheduleEngine.Selection first = days("2026-10-01");
        ScheduleEngine.Selection second = days("2026-10-04");
        assertEquals("Folga", ScheduleEngine.status(first, LocalDateTime.parse("2026-09-30T10:00")));
        assertEquals("Trabalhando", ScheduleEngine.status(first, LocalDateTime.parse("2026-10-01T10:00")));
        assertEquals("Folga", ScheduleEngine.status(first, LocalDateTime.parse("2026-10-07T10:00")));
        assertEquals("Trabalhando", ScheduleEngine.status(second, LocalDateTime.parse("2026-10-07T10:00")));
        assertEquals(LocalDateTime.parse("2026-10-07T00:00"),
                ScheduleEngine.nextChange(first, LocalDateTime.parse("2026-10-06T10:00")));
    }

    @Test public void twelveByThirtySixChangesAtSix() {
        ScheduleEngine.Selection schedule = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("12x36", "ciclo_horas", 12, 36, null),
                LocalDate.parse("2026-10-01"), LocalTime.parse("18:00"));
        assertEquals("Trabalhando", ScheduleEngine.status(
                schedule, LocalDateTime.parse("2026-10-02T05:59")));
        assertEquals("Folga", ScheduleEngine.status(
                schedule, LocalDateTime.parse("2026-10-02T06:00")));
        assertEquals(LocalDateTime.parse("2026-10-02T06:00"),
                ScheduleEngine.nextChange(schedule, LocalDateTime.parse("2026-10-02T05:59")));
        assertEquals("Folga", ScheduleEngine.status(
                schedule, LocalDateTime.parse("2026-09-30T17:59:59")));
    }

    @Test public void rotationAndNoChange() {
        ScheduleEngine.Selection rotation = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("Turnos", "turno_rotativo", 0, 0,
                        Arrays.asList("Manhã", "Tarde", "Noite", "Folga")),
                LocalDate.parse("2026-10-01"), LocalTime.MIDNIGHT);
        assertEquals("Folga", ScheduleEngine.status(
                rotation, LocalDateTime.parse("2026-09-30T10:00")));
        assertEquals("Noite", ScheduleEngine.status(
                rotation, LocalDateTime.parse("2026-10-03T10:00")));
        assertEquals(LocalDateTime.parse("2026-10-04T00:00"),
                ScheduleEngine.nextChange(rotation, LocalDateTime.parse("2026-10-03T10:00")));
        ScheduleEngine.Selection fixed = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("Só folga", "turno_rotativo", 0, 0,
                        Arrays.asList("Folga")), LocalDate.parse("2026-10-01"), LocalTime.MIDNIGHT);
        assertNull(ScheduleEngine.nextChange(fixed, LocalDateTime.parse("2026-10-02T10:00")));
    }

    @Test public void monthBoundaryAndTimezoneDoNotShiftWallClockCycle() {
        ScheduleEngine.Selection schedule = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("12x36", "ciclo_horas", 12, 36, null),
                LocalDate.parse("2024-02-29"), LocalTime.parse("18:00"));
        TimeZone original = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
            String inBrazil = ScheduleEngine.status(
                    schedule, LocalDateTime.parse("2024-03-01T05:59"));
            TimeZone.setDefault(TimeZone.getTimeZone("Europe/London"));
            assertEquals(inBrazil, ScheduleEngine.status(
                    schedule, LocalDateTime.parse("2024-03-01T05:59")));
            assertEquals("Trabalhando", inBrazil);
            assertEquals("Folga", ScheduleEngine.status(
                    schedule, LocalDateTime.parse("2024-03-01T06:00")));
        } finally {
            TimeZone.setDefault(original);
        }
    }

    @Test(expected = IllegalArgumentException.class)
    public void invalidCycleCannotBeSelected() {
        new ScheduleEngine.Scale("Inválida", "ciclo_dias", 0, 3, null);
    }

    @Test public void extremePeriodsAreRejectedWithoutIntegerOverflow() {
        for (String type : new String[]{"ciclo_dias", "ciclo_horas"}) {
            assertThrows(IllegalArgumentException.class,
                    () -> new ScheduleEngine.Scale("Extrema", type, Integer.MAX_VALUE, 2, null));
            assertThrows(IllegalArgumentException.class,
                    () -> new ScheduleEngine.Scale("Extrema", type, 2, Integer.MAX_VALUE, null));
        }
        new ScheduleEngine.Scale("Limite", "ciclo_dias", 119, 1, null);
    }

    @Test public void cyclePositionsBeforeAnchorAndAcrossMonth() {
        ScheduleEngine.Selection days = days("2026-10-01");
        assertEquals("Dia 9 de 9", ScheduleEngine.position(
                days, LocalDateTime.parse("2026-09-30T10:00")));
        assertEquals("Dia 4 de 9", ScheduleEngine.position(
                days, LocalDateTime.parse("2026-10-31T10:00")));
        ScheduleEngine.Selection hours = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("12x36", "ciclo_horas", 12, 36, null),
                LocalDate.parse("2024-02-29"), LocalTime.parse("18:00"));
        assertEquals("Trabalho · hora 12 de 12", ScheduleEngine.position(
                hours, LocalDateTime.parse("2024-03-01T05:59")));
        assertEquals("Folga · hora 1 de 36", ScheduleEngine.position(
                hours, LocalDateTime.parse("2024-03-01T06:00")));
        assertEquals("Folga · hora 12 de 36", ScheduleEngine.position(
                hours, LocalDateTime.parse("2024-02-28T17:00")));
        ScheduleEngine.Selection rotation = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("Rotativa", "turno_rotativo", 0, 0,
                        Arrays.asList("Manhã", "Tarde", "Folga")),
                LocalDate.parse("2026-10-01"), LocalTime.MIDNIGHT);
        assertEquals("Turno 3 de 3", ScheduleEngine.position(
                rotation, LocalDateTime.parse("2026-09-30T10:00")));
        assertEquals("Turno 1 de 3", ScheduleEngine.snapshot(
                rotation, LocalDateTime.parse("2026-10-31T10:00")).position);
    }
}
