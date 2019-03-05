import _ from 'lodash';
import { Kieli } from '@/tyypit';

export const req = (value: any) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (value === false) {
    return true;
  }

  return !!String(value).length;
};

export function requiredLokalisoituTeksti(kielet: Kieli[]) {
  return {
    required(value: any) {
      if (!value) {
        return false;
      }

      let valid = true;
      _.each(kielet, (kieli: Kieli) => {
        if (!_.has(value, kieli) || !req(value[kieli])) {
          valid = false;
        }
      });

      return valid;
    },
  };
}
