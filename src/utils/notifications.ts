import Vue from 'vue';
import { KieliStore, Kielet } from '@shared/stores/kieli';

type NotificationKind = 'info' | 'warn' | 'error' | 'success';

interface NotificationConfig {
  title: string;
  kind?: NotificationKind;
  text?: string;
}

export function notify(config: NotificationConfig) {
  (Vue as any).notify({
    title: Kielet.i18n.t(config.title),
    type: config.kind || 'info',
    text: config.text && Kielet.i18n.t(config.text),
  });
}

export function success(title: string) {
  (Vue as any).notify({
    title: Kielet.i18n.t(title),
    type: 'success',
  });
}

export function info(title: string) {
  (Vue as any).notify({
    title: Kielet.i18n.t(title),
    type: 'info',
  });
}

export function fail(title: string, reason?: string) {
  (Vue as any).notify({
    title: Kielet.i18n.t(title),
    type: 'error',
    text: reason ? Kielet.i18n.t(reason) : reason,
  });
}

export interface CheckedConfig {
  success?: string;
  failure?: string;
}
