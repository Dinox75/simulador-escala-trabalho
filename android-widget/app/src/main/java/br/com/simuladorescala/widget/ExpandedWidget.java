package br.com.simuladorescala.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

public final class ExpandedWidget extends AppWidgetProvider {
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        WidgetUpdater.refresh(context);
    }

    @Override public void onDisabled(Context context) {
        WidgetUpdater.refresh(context);
    }
}
