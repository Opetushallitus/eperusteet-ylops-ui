import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';

export function opsTiedotValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    paatospaivamaara: {
      ...requiredLokalisoituTeksti(kielet),
    },
  };
}
