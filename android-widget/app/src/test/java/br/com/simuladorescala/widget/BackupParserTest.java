package br.com.simuladorescala.widget;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import android.content.Context;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 28)
public class BackupParserTest {
    private static byte[] json(String text) {
        return text.getBytes(StandardCharsets.UTF_8);
    }

    private static String document(String scales) {
        return "{\"format\":\"simulador-escalas-backup\",\"version\":1,\"scales\":" + scales + "}";
    }

    @Test public void acceptsAllThreeTypesFromPwaFormat() {
        String scales = "["
                + "{\"nome\":\"Seis por três\",\"tipo\":\"ciclo_dias\",\"dias_trabalho\":6,\"dias_folga\":3},"
                + "{\"nome\":\"Doze por trinta e seis\",\"tipo\":\"ciclo_horas\",\"horas_trabalho\":12,\"horas_folga\":36},"
                + "{\"nome\":\"Turnos\",\"tipo\":\"turno_rotativo\",\"sequencia_turnos\":[\"Manhã\",\"Folga\"]}"
                + "]";
        List<ScheduleEngine.Scale> parsed = BackupParser.parse(json(document(scales)));
        assertEquals(3, parsed.size());
        assertEquals("ciclo_horas", parsed.get(1).type);
        assertEquals("Manhã", parsed.get(2).turns.get(0));
    }

    @Test public void rejectsBadFieldsAndAmbiguousJson() {
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                json(document("[{\"nome\":\"Zero\",\"tipo\":\"ciclo_dias\","
                        + "\"dias_trabalho\":0,\"dias_folga\":3}]"))));
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                json(document("[{\"nome\":\"Dupla\",\"nome\":\"Outra\","
                        + "\"tipo\":\"ciclo_dias\",\"dias_trabalho\":6,\"dias_folga\":3}]"))));
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                json(document("[{\"nome\":123,\"tipo\":\"ciclo_dias\","
                        + "\"dias_trabalho\":6,\"dias_folga\":3}]"))));
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                json(document("[{\"nome\":\"Grande\",\"tipo\":\"ciclo_dias\","
                        + "\"dias_trabalho\":120,\"dias_folga\":1}]"))));
    }

    @Test public void rejectsInvalidEncodingAndTooLargeFile() {
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                new byte[]{(byte) 0xc3, (byte) 0x28}));
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                new byte[BackupParser.MAX_BYTES + 1]));
    }

    @Test public void invalidImportDoesNotReplaceActiveSelection() throws Exception {
        Context context = RuntimeEnvironment.getApplication();
        ScheduleEngine.Selection active = new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("Ativa", "ciclo_dias", 6, 3, null),
                LocalDate.parse("2026-10-01"), LocalTime.MIDNIGHT);
        WidgetState.write(context, active);
        assertThrows(IllegalArgumentException.class, () -> BackupParser.parse(
                json(document("[{\"nome\":\"Falha\",\"tipo\":\"ciclo_horas\","
                        + "\"horas_trabalho\":-1,\"horas_folga\":36}]"))));
        assertEquals("Ativa", WidgetState.read(context).scale.name);
        WidgetState.clear(context);
    }
}
