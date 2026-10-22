package br.com.simuladorescala.widget;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.InputType;
import android.text.TextWatcher;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
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
    private TextView calculationPreview;
    private Button apply;
    private ScheduleEngine.Selection confirmedSelection;
    private static final DateTimeFormatter MOMENT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

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
                + "3. Confira o status e a próxima mudança antes de aplicar. "
                + "O backup não traz a data de início.", 15,
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
        label(content, "Digite a mesma data de início usada ao simular esta escala na PWA. "
                + "Ela não vem no backup e não é necessariamente hoje.", 13,
                Color.rgb(48, 58, 71));
        startDate = entry(content, "",
                InputType.TYPE_CLASS_DATETIME | InputType.TYPE_DATETIME_VARIATION_DATE);
        startDate.setHint("AAAA-MM-DD");
        label(content, "Hora do início para ciclos por horas (HH:mm)", 15, Color.rgb(18, 23, 31));
        startTime = entry(content, "",
                InputType.TYPE_CLASS_DATETIME | InputType.TYPE_DATETIME_VARIATION_TIME);
        startTime.setHint("HH:mm");
        label(content, "Para ciclos por dias e turnos, a hora não altera o status.", 13,
                Color.rgb(48, 58, 71));
        Button check = button(content, "Conferir situação agora");
        check.setOnClickListener(view -> checkSelection());
        calculationPreview = label(content,
                "Informe a âncora e confira a situação antes de aplicar.", 14,
                Color.rgb(48, 58, 71));
        apply = button(content, "Aplicar ao widget");
        apply.setEnabled(false);
        apply.setOnClickListener(view -> applySelection());
        Button clear = button(content, "Remover escala do widget");
        clear.setOnClickListener(view -> new AlertDialog.Builder(this)
                .setMessage("Remover a escala selecionada deste widget?")
                .setNegativeButton("Cancelar", null)
                .setPositiveButton("Remover", (dialog, which) -> {
                    WidgetState.clear(this);
                    WidgetUpdater.refresh(this);
                    invalidatePreview();
                    show("Seleção removida. O backup no navegador não foi alterado.", false);
                }).show());
        feedback = label(content, "", 14, Color.rgb(18, 23, 31));
        TextWatcher invalidateOnEdit = new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence text, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence text, int start, int before, int count) {
                invalidatePreview();
            }
            @Override public void afterTextChanged(Editable text) {}
        };
        startDate.addTextChangedListener(invalidateOnEdit);
        startTime.addTextChangedListener(invalidateOnEdit);
        setContentView(scroll);
        try {
            ScheduleEngine.Selection existing = WidgetState.read(this);
            if (existing != null) {
                show("Ativa: " + existing.scale.name + ", início " + existing.startDate
                        + " " + existing.startTime + ". Importe de novo para trocar.", false);
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
            show("Backup válido. Confira a escala e a situação antes de aplicar.", false);
        } catch (IOException | IllegalArgumentException | SecurityException error) {
            // Discard only the uncommitted preview; keep the active widget intact.
            pending = Collections.emptyList();
            choices.setAdapter(null);
            preview.setText("Nenhum backup válido selecionado.");
            invalidatePreview();
            show("Importação recusada: " + error.getMessage()
                    + " A escala anterior permanece no widget.", true);
        }
    }

    private void updatePreview() {
        invalidatePreview();
        if (pending.isEmpty() || choices.getSelectedItemPosition() < 0) return;
        ScheduleEngine.Scale scale = pending.get(choices.getSelectedItemPosition());
        String detail = "turno_rotativo".equals(scale.type)
                ? "Turnos: " + String.join(" → ", scale.turns)
                : ("ciclo_horas".equals(scale.type) ? "Horas" : "Dias")
                    + ": " + scale.work + " de trabalho / " + scale.off + " de folga";
        preview.setText(pending.size() + " escala(s) validadas. Escolhida: " + scale.name
                + ". " + detail + ". Confira o início do ciclo e a situação atual. "
                + "Nada foi salvo ainda.");
    }

    private void invalidatePreview() {
        confirmedSelection = null;
        if (apply != null) apply.setEnabled(false);
        if (calculationPreview != null) {
            calculationPreview.setText("Confira a situação novamente antes de aplicar.");
        }
    }

    private ScheduleEngine.Selection enteredSelection() {
        if (pending.isEmpty() || choices.getSelectedItemPosition() < 0) {
            throw new IllegalArgumentException("Escolha primeiro um backup com pelo menos uma escala.");
        }
        String dateText = startDate.getText().toString().trim();
        if (dateText.isEmpty()) {
            throw new IllegalArgumentException("Informe explicitamente o início do ciclo usado na PWA.");
        }
        ScheduleEngine.Scale scale = pending.get(choices.getSelectedItemPosition());
        String timeText = startTime.getText().toString().trim();
        if ("ciclo_horas".equals(scale.type) && timeText.isEmpty()) {
            throw new IllegalArgumentException("Informe a hora de início do ciclo por horas.");
        }
        LocalDate date = LocalDate.parse(dateText);
        LocalTime time = "ciclo_horas".equals(scale.type)
                ? LocalTime.parse(timeText) : LocalTime.MIDNIGHT;
        return new ScheduleEngine.Selection(scale, date, time);
    }

    private void checkSelection() {
        invalidatePreview();
        try {
            ScheduleEngine.Selection selection = enteredSelection();
            LocalDateTime now = LocalDateTime.now();
            ScheduleEngine.Snapshot snapshot = ScheduleEngine.snapshot(selection, now);
            calculationPreview.setText("Prévia para " + now.format(MOMENT) + ": "
                    + snapshot.status + " · " + snapshot.position + ". "
                    + (snapshot.nextChange == null ? "Sem mudança na sequência."
                    : "Próxima mudança: " + snapshot.nextChange.format(MOMENT) + ".")
                    + " Confirme a âncora antes de aplicar.");
            confirmedSelection = selection;
            apply.setEnabled(true);
            show("Prévia pronta. Confira a data e a hora de início e toque em Aplicar ao widget.", false);
        } catch (DateTimeParseException error) {
            show("Informe início válido: data AAAA-MM-DD e, para ciclos por horas, hora HH:mm.", true);
        } catch (IllegalArgumentException error) {
            show(error.getMessage(), true);
        }
    }

    private void applySelection() {
        if (confirmedSelection == null) {
            show("Confira a situação e a âncora antes de aplicar.", true);
            return;
        }
        try {
            ScheduleEngine.Selection selection = confirmedSelection;
            WidgetState.write(this, selection);
            WidgetUpdater.refresh(this);
            invalidatePreview();
            show("Widget atualizado: " + selection.scale.name + ". O arquivo e as escalas no navegador "
                    + "não foram modificados.", false);
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
