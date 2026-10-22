package br.com.simuladorescala.widget;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Mirrors docs/demo/calendar-core.js: dates and hours use local wall-clock
 * components, not elapsed UTC time. A daylight-saving shift does not move
 * a cycle boundary to a different clock time.
 */
public final class ScheduleEngine {
    private ScheduleEngine() {}

    public static final class Scale {
        public final String name;
        public final String type;
        public final int work;
        public final int off;
        public final List<String> turns;

        public Scale(String name, String type, int work, int off, List<String> turns) {
            this.name = name;
            this.type = type;
            this.work = work;
            this.off = off;
            this.turns = turns == null ? Collections.emptyList()
                    : Collections.unmodifiableList(new ArrayList<>(turns));
            validate(this);
        }
    }

    public static final class Selection {
        public final Scale scale;
        public final LocalDate startDate;
        public final LocalTime startTime;

        public Selection(Scale scale, LocalDate startDate, LocalTime startTime) {
            this.scale = Objects.requireNonNull(scale);
            this.startDate = Objects.requireNonNull(startDate);
            this.startTime = Objects.requireNonNull(startTime);
        }
    }

    public static final class Snapshot {
        public final String status;
        public final LocalDateTime nextChange;
        public final List<String> following;

        Snapshot(String status, LocalDateTime nextChange, List<String> following) {
            this.status = status;
            this.nextChange = nextChange;
            this.following = Collections.unmodifiableList(new ArrayList<>(following));
        }
    }

    public static void validate(Scale scale) {
        if (scale.name == null || scale.name.isEmpty() || scale.name.length() > 80
                || !scale.name.equals(scale.name.trim()) || containsControl(scale.name)) {
            throw new IllegalArgumentException("Nome da escala inválido.");
        }
        if ("ciclo_dias".equals(scale.type) || "ciclo_horas".equals(scale.type)) {
            if (scale.work < 1 || scale.off < 1 || scale.work + scale.off > 120
                    || !scale.turns.isEmpty()) {
                throw new IllegalArgumentException("Ciclo inválido: períodos positivos e soma até 120.");
            }
        } else if ("turno_rotativo".equals(scale.type)) {
            if (scale.work != 0 || scale.off != 0 || scale.turns.isEmpty()
                    || scale.turns.size() > 60) {
                throw new IllegalArgumentException("Sequência rotativa inválida.");
            }
            for (String turn : scale.turns) {
                if (turn == null || turn.isEmpty() || turn.length() > 32
                        || !turn.equals(turn.trim()) || containsControl(turn)) {
                    throw new IllegalArgumentException("Turno inválido.");
                }
            }
        } else {
            throw new IllegalArgumentException("Tipo de escala desconhecido.");
        }
    }

    private static boolean containsControl(String text) {
        for (int i = 0; i < text.length(); i++) {
            if (text.charAt(i) < 32 || text.charAt(i) == 127) return true;
        }
        return false;
    }

    public static String status(Selection selection, LocalDateTime query) {
        Scale scale = selection.scale;
        if ("ciclo_horas".equals(scale.type)) {
            long millis = ChronoUnit.MILLIS.between(
                    LocalDateTime.of(selection.startDate, selection.startTime), query);
            long phase = Math.floorMod(millis, (long) (scale.work + scale.off) * 3600000);
            return phase < (long) scale.work * 3600000 ? "Trabalhando" : "Folga";
        }
        long days = ChronoUnit.DAYS.between(selection.startDate, query.toLocalDate());
        if ("ciclo_dias".equals(scale.type)) {
            return Math.floorMod(days, scale.work + scale.off) < scale.work
                    ? "Trabalhando" : "Folga";
        }
        return scale.turns.get((int) Math.floorMod(days, scale.turns.size()));
    }

    public static LocalDateTime nextChange(Selection selection, LocalDateTime query) {
        Scale scale = selection.scale;
        if ("ciclo_horas".equals(scale.type)) {
            LocalDateTime anchor = LocalDateTime.of(selection.startDate, selection.startTime);
            long elapsed = ChronoUnit.MILLIS.between(anchor, query);
            long cycleMillis = (long) (scale.work + scale.off) * 3600000;
            long phase = Math.floorMod(elapsed, cycleMillis);
            long remaining = phase < (long) scale.work * 3600000
                    ? (long) scale.work * 3600000 - phase : cycleMillis - phase;
            LocalDateTime boundary = anchor.plus(elapsed + remaining, ChronoUnit.MILLIS);
            return boundary.isAfter(query) ? boundary : boundary.plus(cycleMillis, ChronoUnit.MILLIS);
        }
        String current = status(selection, query);
        int max = "ciclo_dias".equals(scale.type)
                ? scale.work + scale.off : scale.turns.size();
        for (int offset = 1; offset <= max; offset++) {
            LocalDateTime candidate = query.toLocalDate().plusDays(offset).atStartOfDay();
            if (!status(selection, candidate).equals(current)) return candidate;
        }
        return null;
    }

    public static Snapshot snapshot(Selection selection, LocalDateTime query) {
        String current = status(selection, query);
        List<String> following = new ArrayList<>();
        for (int offset = 0; offset < 5; offset++) {
            LocalDateTime sample = query.toLocalDate().plusDays(offset).atTime(query.toLocalTime());
            following.add(status(selection, sample));
        }
        return new Snapshot(current, nextChange(selection, query), following);
    }
}
