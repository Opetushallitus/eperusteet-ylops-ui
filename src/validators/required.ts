import _ from 'lodash';
import he from 'he';
import { Kieli } from '@/tyypit';

export function notNull() {
  return {
    'not-null': (value: any) => !!value,
  };
}

export function requiredLokalisoituTeksti(kielet: Kieli[]) {
  const exists = (value: any, kieli: Kieli) =>
    _.has(value, kieli)
      && !_.isEmpty(he.decode(value[kieli].replace(/<[^>]+>/g, '')).trim());

  return {
    required(value: any) {
      if (!value) {
        return false;
      }

      const isInSomeLang = () => _.some(['fi'], kieli => exists(value, kieli));
      const isMaaritettyInAllLangs = () => _.every(kielet, kieli => exists(value, kieli));
      const isValid = _.isEmpty(kielet) ? isInSomeLang() : isMaaritettyInAllLangs();
      return isValid;
    },
  };
}
