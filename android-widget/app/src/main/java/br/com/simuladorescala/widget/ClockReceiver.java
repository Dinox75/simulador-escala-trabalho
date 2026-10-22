package br.com.simuladorescala.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class ClockReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        WidgetUpdater.refresh(context);
    }
}
