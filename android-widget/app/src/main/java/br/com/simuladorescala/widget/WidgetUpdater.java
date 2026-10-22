package br.com.simuladorescala.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.widget.RemoteViews;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Inexact boundary alarm plus the platform's 30-minute widget refresh. */
public final class WidgetUpdater {
    private static final DateTimeFormatter MOMENT =
            DateTimeFormatter.ofPattern("dd/MM HH:mm", Locale.forLanguageTag("pt-BR"));
    private WidgetUpdater() {}

    public static void refresh(Context context) {
        ScheduleEngine.Selection selection = null;
        boolean invalid = false;
        try {
            selection = WidgetState.read(context);
        } catch (IOException error) {
            invalid = true;
        }
        LocalDateTime now = LocalDateTime.now();
        ScheduleEngine.Snapshot snapshot = selection == null
                ? null : ScheduleEngine.snapshot(selection, now);
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int widgetCount = updateProvider(context, manager, CompactWidget.class, R.layout.widget_compact,
                selection, snapshot, now, invalid);
        widgetCount += updateProvider(context, manager, ExpandedWidget.class, R.layout.widget_expanded,
                selection, snapshot, now, invalid);
        schedule(context, snapshot, widgetCount > 0);
    }

    private static int updateProvider(Context context, AppWidgetManager manager,
                                       Class<?> provider, int layout,
                                       ScheduleEngine.Selection selection,
                                       ScheduleEngine.Snapshot snapshot,
                                       LocalDateTime now, boolean invalid) {
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, provider));
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), layout);
            Intent configure = new Intent(context, MainActivity.class);
            PendingIntent open = PendingIntent.getActivity(context, 0, configure,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, open);
            if (snapshot == null) {
                views.setTextViewText(R.id.widget_name, "Simulador de Escala");
                views.setTextViewText(R.id.widget_next,
                        invalid ? "Toque para importar novamente" : "Toque para importar um backup");
                views.setTextViewText(R.id.widget_status, invalid ? "Dados inválidos" : "Sem escala");
                views.setTextViewText(R.id.widget_position, "");
                views.setTextColor(R.id.widget_status, Color.rgb(243, 189, 102));
            } else {
                views.setTextViewText(R.id.widget_name, selection.scale.name);
                views.setTextViewText(R.id.widget_status, displayStatus(snapshot.status));
                views.setTextViewText(R.id.widget_position, snapshot.position);
                views.setTextColor(R.id.widget_status, "Folga".equals(snapshot.status)
                        ? Color.rgb(243, 189, 102) : Color.rgb(95, 164, 245));
                views.setTextViewText(R.id.widget_next,
                        snapshot.nextChange == null ? "Sem mudança no ciclo"
                                : "Próxima mudança: " + snapshot.nextChange.format(MOMENT));
            }
            String observation = "Consulta: " + now.format(MOMENT);
            if (selection != null && "ciclo_horas".equals(selection.scale.type)) {
                observation += layout == R.layout.widget_compact
                        ? " · instante" : " · instante, não dia inteiro";
            }
            views.setTextViewText(R.id.widget_now, observation);
            if (layout == R.layout.widget_expanded) {
                if (snapshot == null) {
                    views.setTextViewText(R.id.widget_sequence, "Importe um backup para ver a sequência.");
                } else {
                    List<String> days = new ArrayList<>();
                    for (int offset = 0; offset < snapshot.following.size(); offset++) {
                        String label = now.toLocalDate().plusDays(offset).format(
                                DateTimeFormatter.ofPattern("dd/MM"));
                        days.add(label + " " + snapshot.following.get(offset));
                    }
                    views.setTextViewText(R.id.widget_sequence,
                            "Hoje + 4 dias às " + now.toLocalTime().format(
                                    DateTimeFormatter.ofPattern("HH:mm")) + ": "
                                    + String.join(" · ", days));
                }
            }
            manager.updateAppWidget(id, views);
        }
        return ids.length;
    }

    private static String displayStatus(String status) {
        if ("Folga".equals(status) || "Trabalhando".equals(status)) return status;
        return "Trabalhando · " + status;
    }

    private static PendingIntent alarmIntent(Context context) {
        Intent refresh = new Intent(context, RefreshReceiver.class);
        return PendingIntent.getBroadcast(context, 1, refresh,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void schedule(Context context, ScheduleEngine.Snapshot snapshot,
                                 boolean hasWidgets) {
        AlarmManager alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarms == null) return;
        PendingIntent pending = alarmIntent(context);
        alarms.cancel(pending);
        if (!hasWidgets || snapshot == null || snapshot.nextChange == null) return;
        long boundary = snapshot.nextChange.atZone(ZoneId.systemDefault())
                .toInstant().toEpochMilli();
        long trigger = Math.max(System.currentTimeMillis() + 1000, boundary + 1000);
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pending);
    }
}
