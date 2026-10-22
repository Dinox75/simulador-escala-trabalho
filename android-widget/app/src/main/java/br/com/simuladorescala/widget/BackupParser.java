package br.com.simuladorescala.widget;

import android.util.JsonReader;
import android.util.JsonToken;

import java.io.IOException;
import java.io.StringReader;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Strict reader for the PWA's version 1 export, not arbitrary JSON data. */
public final class BackupParser {
    public static final int MAX_BYTES = 512 * 1024;
    private BackupParser() {}

    public static List<ScheduleEngine.Scale> parse(byte[] bytes) {
        if (bytes.length > MAX_BYTES) throw new IllegalArgumentException("Backup maior que 512 KB.");
        final String source;
        try {
            source = StandardCharsets.UTF_8.newDecoder().decode(ByteBuffer.wrap(bytes)).toString();
        } catch (CharacterCodingException error) {
            throw new IllegalArgumentException("O backup não está em UTF-8 válido.", error);
        }
        try (JsonReader reader = new JsonReader(new StringReader(source.replaceFirst("^\uFEFF", "")))) {
            reader.setLenient(false);
            Set<String> keys = new HashSet<>();
            String format = null;
            Integer version = null;
            List<ScheduleEngine.Scale> scales = null;
            reader.beginObject();
            while (reader.hasNext()) {
                String key = reader.nextName();
                unique(keys, key);
                switch (key) {
                    case "format": format = string(reader); break;
                    case "version": version = positiveInteger(reader); break;
                    case "exported_at": string(reader); break;
                    case "scales": scales = readScales(reader); break;
                    default: throw new IllegalArgumentException("Campo inesperado no backup: " + key);
                }
            }
            reader.endObject();
            if (reader.peek() != JsonToken.END_DOCUMENT) {
                throw new IllegalArgumentException("Conteúdo extra após o backup.");
            }
            if (!"simulador-escalas-backup".equals(format) || version == null
                    || version != 1 || scales == null) {
                throw new IllegalArgumentException("Formato ou versão do backup incompatível.");
            }
            return Collections.unmodifiableList(new ArrayList<>(scales));
        } catch (IOException | IllegalStateException error) {
            throw new IllegalArgumentException("JSON do backup inválido.", error);
        }
    }

    private static List<ScheduleEngine.Scale> readScales(JsonReader reader) throws IOException {
        List<ScheduleEngine.Scale> scales = new ArrayList<>();
        Set<String> names = new HashSet<>();
        Set<String> configs = new HashSet<>();
        reader.beginArray();
        while (reader.hasNext()) {
            if (scales.size() >= 200) throw new IllegalArgumentException("Backup com mais de 200 escalas.");
            ScheduleEngine.Scale scale = readScale(reader);
            if (!names.add(scale.name.toLowerCase(Locale.forLanguageTag("pt-BR")))) {
                throw new IllegalArgumentException("Nome de escala repetido: " + scale.name);
            }
            StringBuilder config = new StringBuilder(scale.type).append(':')
                    .append(scale.work).append(':').append(scale.off).append(':');
            for (String turn : scale.turns) {
                config.append(turn.length()).append(':').append(turn);
            }
            if (!configs.add(config.toString())) {
                throw new IllegalArgumentException("Configuração de escala repetida.");
            }
            scales.add(scale);
        }
        reader.endArray();
        return scales;
    }

    private static ScheduleEngine.Scale readScale(JsonReader reader) throws IOException {
        Set<String> keys = new HashSet<>();
        String name = null;
        String type = null;
        Integer daysWork = null, daysOff = null, hoursWork = null, hoursOff = null;
        List<String> turns = null;
        reader.beginObject();
        while (reader.hasNext()) {
            String key = reader.nextName();
            unique(keys, key);
            switch (key) {
                case "nome": name = string(reader); break;
                case "tipo": type = string(reader); break;
                case "dias_trabalho": daysWork = positiveInteger(reader); break;
                case "dias_folga": daysOff = positiveInteger(reader); break;
                case "horas_trabalho": hoursWork = positiveInteger(reader); break;
                case "horas_folga": hoursOff = positiveInteger(reader); break;
                case "sequencia_turnos":
                    turns = new ArrayList<>();
                    reader.beginArray();
                    while (reader.hasNext()) {
                        if (turns.size() >= 60) {
                            throw new IllegalArgumentException("Sequência com mais de 60 turnos.");
                        }
                        turns.add(string(reader));
                    }
                    reader.endArray();
                    break;
                default: throw new IllegalArgumentException("Campo inesperado na escala: " + key);
            }
        }
        reader.endObject();
        if (name == null || type == null) throw new IllegalArgumentException("Escala incompleta.");
        if ("ciclo_dias".equals(type) && daysWork != null && daysOff != null
                && hoursWork == null && hoursOff == null && turns == null) {
            return new ScheduleEngine.Scale(name, type, daysWork, daysOff, null);
        }
        if ("ciclo_horas".equals(type) && hoursWork != null && hoursOff != null
                && daysWork == null && daysOff == null && turns == null) {
            return new ScheduleEngine.Scale(name, type, hoursWork, hoursOff, null);
        }
        if ("turno_rotativo".equals(type) && turns != null
                && daysWork == null && daysOff == null && hoursWork == null && hoursOff == null) {
            return new ScheduleEngine.Scale(name, type, 0, 0, turns);
        }
        throw new IllegalArgumentException("Tipo e campos da escala não correspondem.");
    }

    private static int positiveInteger(JsonReader reader) throws IOException {
        if (reader.peek() != JsonToken.NUMBER) throw new IllegalArgumentException("Número inteiro esperado.");
        String raw = reader.nextString();
        if (!raw.matches("[1-9][0-9]*")) throw new IllegalArgumentException("Período inválido.");
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException error) {
            throw new IllegalArgumentException("Período acima do limite.", error);
        }
    }

    private static String string(JsonReader reader) throws IOException {
        if (reader.peek() != JsonToken.STRING) {
            throw new IllegalArgumentException("Texto esperado no backup.");
        }
        return reader.nextString();
    }

    private static void unique(Set<String> keys, String key) {
        if (!keys.add(key)) throw new IllegalArgumentException("Campo repetido: " + key);
    }
}
