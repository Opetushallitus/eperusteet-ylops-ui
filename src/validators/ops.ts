import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function opsTiedotValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    julkaisukielet: {
      required,
      'min-length': minLength(2),
    },
    hyvaksyjataho: {
      required,
    },
    paatospaivamaara: {
      required,
    },
    kuvaus: {
      ...requiredLokalisoituTeksti(kielet),
    },
  };
}
