import _ from 'lodash';
import he from 'he';
import { Kieli } from '@shared/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function notNull() {
  return {
    'not-null': (value: any) => !!value,
  };
}

const ValidoitavatKielet = ['fi', 'sv', 'se', 'en', 'ru'];

export function requiredLokalisoituTeksti(kielet: Kieli[]) {
  const exists = (value: any, kieli: Kieli) =>
    _.has(value, kieli)
      && !_.isEmpty(he.decode(value[kieli].replace(/<[^>]+>/g, '')).trim());

  return {
    required(value: any) {
      if (!value) {
        return false;
      }

      const isInSomeLang = () => _.some(ValidoitavatKielet, kieli => exists(value, kieli as Kieli));
      const isMaaritettyInAllLangs = () => _.every(kielet, kieli => exists(value, kieli));
      const isValid = _.isEmpty(kielet) ? isInSomeLang() : isMaaritettyInAllLangs();
      return isValid;
    },
  };
}

export function nimiValidator(kielet: Kieli[]) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
  };
}
