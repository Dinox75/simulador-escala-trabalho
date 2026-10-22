package br.com.simuladorescala.widget;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.InputType;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;

import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Collections;

/** Manual, one-time import from a PWA backup. No browser storage access. */
public final class MainActivity extends Activity {
    private static final int REQUEST_BACKUP = 10;
    private List<ScheduleEngine.Scale> pending = Collections.emptyList();
    private Spinner choices;
    private EditText startDate;
    private EditText startTime;
    private TextView feedback;
    private TextView preview;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        ScrollView scroll = new ScrollView(this);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        int padding = dp(20);
        content.setPadding(padding, padding, padding, padding);
        scroll.addView(content);

        label(content, "Escala na tela inicial", 26, Color.rgb(18, 23, 31));
        label(content, "1. Na PWA, abra Dados locais e baixe o backup JSON.\n"
                + "2. Importe o arquivo aqui, escolha uma escala e informe o início do ciclo.\n"
                + "3. Toque em Aplicar ao widget. O backup não traz a data de início.", 15,
                Color.rgb(48, 58, 71));
        label(content, "Os dados ficam neste dispositivo. Não há sincronização com o Chrome, "
                + "com a API ou entre aparelhos.", 14, Color.rgb(48, 58, 71));
        Button importButton = button(content, "Escolher backup JSON");
        importButton.setOnClickListener(view -> chooseBackup());
        preview = label(content, "Nenhum backup selecionado.", 14, Color.rgb(48, 58, 71));
        choices = new Spinner(this);
        choices.setContentDescription("Escala importada para o widget");
        choices.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override public void onItemSelected(AdapterView<?> parent, View view,
                                                 int position, long id) {
                updatePreview();
            }
            @Override public void onNothingSelected(AdapterView<?> parent) {}
        });
        content.addView(choices);
        label(content, "Início do ciclo (AAAA-MM-DD)", 15, Color.rgb(18, 23, 31));
        startDate = entry(content, LocalDate.now().toString(),
                InputType.TYPE_CLASS_DATETIME | InputType.TYPE_DATETIME_VARIATION_DATE);
        label(content, "Hora do início para ciclos por horas (HH:mm)", 15, Color.rgb(18, 23, 31));
        startTime = entry(content, "00:00",
                InputType.TYPE_CLASS_DATETIME | InputType.TYPE_DATETIME_VARIATION_TIME);
        label(content, "Para ciclos por dias e turnos, a hora não altera o status.", 13,
                Color.rgb(48, 58, 71));
        Button apply = button(content, "Aplicar ao widget");
        apply.setOnClickListener(view -> applySelection());
        Button clear = button(content, "Remover escala do widget");
        clear.setOnClickListener(view -> new AlertDialog.Builder(this)
                .setMessage("Remover a escala selecionada deste widget?")
                .setNegativeButton("Cancelar", null)
                .setPositiveButton("Remover", (dialog, which) -> {
                    WidgetState.clear(this);
                    WidgetUpdater.refresh(this);
                    show("Seleção removida. O backup no navegador não foi alterado.", false);
                }).show());
        feedback = label(content, "", 14, Color.rgb(18, 23, 31));
        setContentView(scroll);
        try {
            ScheduleEngine.Selection existing = WidgetState.read(this);
            if (existing != null) {
                show("Ativa: " + existing.scale.name + ", início " + existing.startDate
                        + " " + existing.startTime + ". Importe de novo para trocar.", false);
                startDate.setText(existing.startDate.toString());
                startTime.setText(existing.startTime.toString());
            }
        } catch (IOException error) {
            show("A seleção anterior está inválida. Importe um backup novamente.", true);
        }
        WidgetUpdater.refresh(this);
    }

    private void chooseBackup() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        startActivityForResult(Intent.createChooser(intent, "Backup JSON do Simulador"), REQUEST_BACKUP);
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request != REQUEST_BACKUP || result != RESULT_OK || data == null || data.getData() == null) {
            return;
        }
        try (InputStream input = getContentResolver().openInputStream(data.getData())) {
            if (input == null) throw new IOException("Arquivo indisponível.");
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) {
                if (output.size() + count > BackupParser.MAX_BYTES) {
                    throw new IllegalArgumentException("Backup maior que 512 KB.");
                }
                output.write(buffer, 0, count);
            }
            byte[] bytes = output.toByteArray();
            List<ScheduleEngine.Scale> parsed = BackupParser.parse(bytes);
            if (parsed.isEmpty()) throw new IllegalArgumentException("O backup não contém escalas.");
            pending = parsed;
            String[] names = parsed.stream().map(scale -> scale.name).toArray(String[]::new);
            ArrayAdapter<String> adapter = new ArrayAdapter<>(
                    this, android.R.layout.simple_spinner_item, names);
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            choices.setAdapter(adapter);
            updatePreview();
            show("Backup válido. Confira a escala e toque em Aplicar ao widget.", false);
        } catch (IOException | IllegalArgumentException | SecurityException error) {
            // Discard only the uncommitted preview; keep the active widget intact.
            pending = Collections.emptyList();
            choices.setAdapter(null);
            preview.setText("Nenhum backup válido selecionado.");
            show("Importação recusada: " + error.getMessage()
                    + " A escala anterior permanece no widget.", true);
        }
    }

    private void updatePreview() {
        if (pending.isEmpty() || choices.getSelectedItemPosition() < 0) return;
        ScheduleEngine.Scale scale = pending.get(choices.getSelectedItemPosition());
        String detail = "turno_rotativo".equals(scale.type)
                ? "Turnos: " + String.join(" → ", scale.turns)
                : ("ciclo_horas".equals(scale.type) ? "Horas" : "Dias")
                    + ": " + scale.work + " de trabalho / " + scale.off + " de folga";
        preview.setText(pending.size() + " escala(s) validadas. Escolhida: " + scale.name
                + ". " + detail + ". Confira o início do ciclo e toque em Aplicar. "
                + "Nada foi salvo ainda.");
    }

    private void applySelection() {
        if (pending.isEmpty() || choices.getSelectedItemPosition() < 0) {
            show("Escolha primeiro um backup com pelo menos uma escala.", true);
            return;
        }
        try {
            ScheduleEngine.Scale scale = pending.get(choices.getSelectedItemPosition());
            LocalDate date = LocalDate.parse(startDate.getText().toString().trim());
            LocalTime time = "ciclo_horas".equals(scale.type)
                    ? LocalTime.parse(startTime.getText().toString().trim())
                    : LocalTime.MIDNIGHT;
            ScheduleEngine.Selection selection = new ScheduleEngine.Selection(scale, date, time);
            WidgetState.write(this, selection);
            WidgetUpdater.refresh(this);
            show("Widget atualizado: " + scale.name + ". O arquivo e as escalas no navegador "
                    + "não foram modificados.", false);
        } catch (DateTimeParseException error) {
            show("Informe início válido: data AAAA-MM-DD e hora HH:mm.", true);
        } catch (IOException error) {
            show("Não foi possível salvar a seleção: " + error.getMessage(), true);
        }
    }

    private void show(String message, boolean error) {
        feedback.setText(message);
        feedback.setTextColor(error ? Color.rgb(160, 45, 36) : Color.rgb(31, 91, 65));
    }

    private TextView label(LinearLayout parent, String value, int size, int color) {
        TextView label = new TextView(this);
        label.setText(value);
        label.setTextSize(size);
        label.setTextColor(color);
        label.setPadding(0, dp(8), 0, dp(8));
        parent.addView(label);
        return label;
    }

    private Button button(LinearLayout parent, String value) {
        Button button = new Button(this);
        button.setText(value);
        parent.addView(button);
        return button;
    }

    private EditText entry(LinearLayout parent, String value, int inputType) {
        EditText edit = new EditText(this);
        edit.setInputType(inputType);
        edit.setSingleLine(true);
        edit.setText(value);
        parent.addView(edit);
        return edit;
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + .5f);
    }
}
