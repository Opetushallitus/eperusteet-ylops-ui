import Vue from 'vue';
import { KieliStore } from '@shared/stores/kieli';

type NotificationKind = 'info' | 'warn' | 'error' | 'success';

interface NotificationConfig {
  title: string;
  kind?: NotificationKind;
  text?: string;
}

export function notify(config: NotificationConfig) {
  (Vue as any).notify({
    title: KieliStore.i18n.t(config.title),
    type: config.kind || 'info',
    text: config.text && KieliStore.i18n.t(config.text),
  });
}

export function success(title: string) {
  (Vue as any).notify({
    title: KieliStore.i18n.t(title),
    type: 'success',
  });
}

export function info(title: string) {
  (Vue as any).notify({
    title: KieliStore.i18n.t(title),
    type: 'info',
  });
}

export function fail(title: string, reason: string | undefined) {
  (Vue as any).notify({
    title: KieliStore.i18n.t(title),
    type: 'error',
    text: reason ? KieliStore.i18n.t(reason): reason,
  });
}

export interface CheckedConfig {
  success?: string;
  failure?: string;
}
