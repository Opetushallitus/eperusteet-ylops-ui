import Vue from 'vue';
import { i18n } from '@/stores/kieli';

type NotificationKind = 'info' | 'warn' | 'error' | 'success';

interface NotificationConfig {
  title: string;
  kind?: NotificationKind;
  text?: string;
}

export function notify(config: NotificationConfig) {
  (Vue as any).notify({
    title: i18n.t(config.title),
    type: config.kind || 'info',
    text: config.text && i18n.t(config.text),
  });
}

export function success(title: string) {
  (Vue as any).notify({
    title: i18n.t(title),
    type: 'success',
  });
}

export function fail(title: string, reason: string | undefined) {
  (Vue as any).notify({
    title: i18n.t(title),
    type: 'error',
    text: reason,
  });
}

export interface CheckedConfig {
  success?: string;
  failure?: string;
}

// Annotation that handles notifications on success and failures
// Only works with async functions
// FIXME: reactivity breaks
// function Checked(config?: CheckedConfig) {
//   return (target: any, key: string, descriptor: any) => {
//     const original = descriptor.value;
//     return {
//       ...descriptor,
//       async value(...params: any) {
//         try {
//           const result = await original(...params);
//           return result;
//         }
//         catch (err) {
//         }
//       }
//     };
//
//     // const original = target[key];
//     // target[key] = async(...params: any) => {
//     //   console.log('called');
//     //   try {
//     //     await original.call(...params);
//     //     console.log('done');
//     //   }
//     //   catch (err) {
//     //     console.log('error');
//     //   }
//     // };
//     // const fn = descriptor.value;
//     //
//     // if (!_.isFunction(fn)) {
//     //   throw new Error(`Getter should be a function: ${key}`);
//     // }
//     //
//     // if (fn.length > 0) {
//     //   throw new Error(`Getter should have no parameters: ${key}`);
//     // }
//   };
// }
