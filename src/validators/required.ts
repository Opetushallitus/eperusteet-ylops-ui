import _ from 'lodash';
import he from 'he';
import { Kieli } from '@/tyypit';

export function requiredLokalisoituTeksti(kielet: Kieli[]) {
  return {
    required(value: any) {
      if (!value) {
        return false;
      }

      let valid = true;
      _.each(kielet, (kieli: Kieli) => {
        // Poistetaan HTML-tagit, -entiteetit ja välilyönnit molemmista päistä
        const clean = he.decode(value[kieli].replace(/<[^>]+>/g, '')).trim();
        if (!_.has(value, kieli) || _.isEmpty(clean)) {
          // Jos vaadittua kieltä ei ole tai vaaditun kielen teksti on tyhjä
          valid = false;
        }
      });

      return valid;
    },
  };
}
