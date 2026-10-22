package br.com.simuladorescala.widget;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 28)
public class MainActivityTest {
    private static Object field(MainActivity activity, String name) throws Exception {
        Field field = MainActivity.class.getDeclaredField(name);
        field.setAccessible(true);
        return field.get(activity);
    }

    private static void invoke(MainActivity activity, String name) throws Exception {
        Method method = MainActivity.class.getDeclaredMethod(name);
        method.setAccessible(true);
        method.invoke(activity);
    }

    @Test public void anchorMustBeEnteredAndPreviewedBeforeReplacingActiveWidget() throws Exception {
        Context context = RuntimeEnvironment.getApplication();
        WidgetState.write(context, new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("Anterior", "ciclo_dias", 6, 3, null),
                LocalDate.parse("2026-09-01"), LocalTime.MIDNIGHT));
        try {
            MainActivity activity = Robolectric.buildActivity(MainActivity.class).setup().get();
            EditText date = (EditText) field(activity, "startDate");
            Button apply = (Button) field(activity, "apply");
            TextView feedback = (TextView) field(activity, "feedback");
            TextView preview = (TextView) field(activity, "calculationPreview");
            assertEquals("", date.getText().toString());
            assertFalse(apply.isEnabled());

            ScheduleEngine.Scale imported = new ScheduleEngine.Scale(
                    "Nova", "ciclo_dias", 6, 3, null);
            Field pending = MainActivity.class.getDeclaredField("pending");
            pending.setAccessible(true);
            pending.set(activity, Collections.singletonList(imported));
            Spinner choices = (Spinner) field(activity, "choices");
            choices.setAdapter(new ArrayAdapter<>(activity,
                    android.R.layout.simple_spinner_item, new String[]{"Nova"}));

            invoke(activity, "checkSelection");
            assertTrue(feedback.getText().toString().contains("Informe explicitamente"));
            assertFalse(apply.isEnabled());
            assertEquals("Anterior", WidgetState.read(context).scale.name);

            date.setText("2026-10-01");
            invoke(activity, "checkSelection");
            assertTrue(preview.getText().toString().contains("Próxima mudança:"));
            assertTrue(preview.getText().toString().contains("Dia "));
            assertTrue(apply.isEnabled());

            date.setText("2026-10-02");
            assertFalse(apply.isEnabled());
            assertEquals("Anterior", WidgetState.read(context).scale.name);
            invoke(activity, "checkSelection");
            assertTrue(apply.isEnabled());
            invoke(activity, "applySelection");
            assertEquals("Nova", WidgetState.read(context).scale.name);
            assertEquals(LocalDate.parse("2026-10-02"), WidgetState.read(context).startDate);
            assertFalse(apply.isEnabled());
        } finally {
            WidgetState.clear(context);
        }
    }

    @Test public void invalidBackupImportLeavesActiveWidgetUntouched() throws Exception {
        Context context = RuntimeEnvironment.getApplication();
        WidgetState.write(context, new ScheduleEngine.Selection(
                new ScheduleEngine.Scale("Anterior", "ciclo_dias", 6, 3, null),
                LocalDate.parse("2026-09-01"), LocalTime.MIDNIGHT));
        Path file = Files.createTempFile(context.getCacheDir().toPath(), "invalid-widget-", ".json");
        try {
            String backup = "{\"format\":\"simulador-escalas-backup\",\"version\":1,"
                    + "\"scales\":[{\"nome\":\"Extrema\",\"tipo\":\"ciclo_dias\","
                    + "\"dias_trabalho\":2147483647,\"dias_folga\":2}]}";
            Files.write(file, backup.getBytes(StandardCharsets.UTF_8));
            MainActivity activity = Robolectric.buildActivity(MainActivity.class).setup().get();
            activity.onActivityResult(10, Activity.RESULT_OK,
                    new Intent().setData(Uri.fromFile(file.toFile())));
            assertTrue(((TextView) field(activity, "feedback")).getText().toString()
                    .contains("Importação recusada"));
            assertFalse(((Button) field(activity, "apply")).isEnabled());
            assertEquals("Anterior", WidgetState.read(context).scale.name);
        } finally {
            Files.deleteIfExists(file);
            WidgetState.clear(context);
        }
    }
}
