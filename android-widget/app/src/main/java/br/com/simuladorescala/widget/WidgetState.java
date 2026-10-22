package br.com.simuladorescala.widget;

import android.content.Context;
import android.util.AtomicFile;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** The selected scale is private native data; it never reads Chrome storage. */
public final class WidgetState {
    private WidgetState() {}

    private static AtomicFile file(Context context) {
        return new AtomicFile(new File(context.getNoBackupFilesDir(), "widget-selection.json"));
    }

    public static ScheduleEngine.Selection read(Context context) throws IOException {
        AtomicFile atomic = file(context);
        if (!atomic.getBaseFile().exists()
                && !new File(atomic.getBaseFile().getPath() + ".bak").exists()) return null;
        try (InputStream input = atomic.openRead()) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int count;
            while ((count = input.read(buffer)) != -1) {
                if (output.size() + count > 8192) {
                    throw new IOException("Seleção do widget acima do limite.");
                }
                output.write(buffer, 0, count);
            }
            byte[] bytes = output.toByteArray();
            JSONObject root = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
            if (root.getInt("version") != 1) throw new JSONException("Versão desconhecida");
            JSONObject entry = root.getJSONObject("scale");
            String type = entry.getString("tipo");
            String name = entry.getString("nome");
            ScheduleEngine.Scale scale;
            if ("turno_rotativo".equals(type)) {
                JSONArray array = entry.getJSONArray("sequencia_turnos");
                List<String> turns = new ArrayList<>();
                for (int i = 0; i < array.length(); i++) turns.add(array.getString(i));
                scale = new ScheduleEngine.Scale(name, type, 0, 0, turns);
            } else {
                scale = new ScheduleEngine.Scale(name, type,
                        entry.getInt("trabalho"), entry.getInt("folga"), null);
            }
            return new ScheduleEngine.Selection(scale,
                    LocalDate.parse(root.getString("start_date")),
                    LocalTime.parse(root.getString("start_time")));
        } catch (JSONException | RuntimeException error) {
            throw new IOException("Seleção salva inválida.", error);
        }
    }

    public static void write(Context context, ScheduleEngine.Selection selection) throws IOException {
        JSONObject root = new JSONObject();
        JSONObject entry = new JSONObject();
        try {
            root.put("version", 1);
            root.put("start_date", selection.startDate.toString());
            root.put("start_time", selection.startTime.toString());
            entry.put("nome", selection.scale.name);
            entry.put("tipo", selection.scale.type);
            if ("turno_rotativo".equals(selection.scale.type)) {
                entry.put("sequencia_turnos", new JSONArray(selection.scale.turns));
            } else {
                entry.put("trabalho", selection.scale.work);
                entry.put("folga", selection.scale.off);
            }
            root.put("scale", entry);
        } catch (JSONException error) {
            throw new IOException("Não foi possível preparar a seleção.", error);
        }
        AtomicFile atomic = file(context);
        FileOutputStream output = null;
        try {
            output = atomic.startWrite();
            output.write(root.toString().getBytes(StandardCharsets.UTF_8));
            atomic.finishWrite(output);
        } catch (IOException error) {
            if (output != null) atomic.failWrite(output);
            throw error;
        }
    }

    public static void clear(Context context) {
        file(context).delete();
    }
}
