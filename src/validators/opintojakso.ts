import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function opintojaksoValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    julkaisukielet: {
      required,
      'min-length': minLength(1),
    },
    koodi: {
      required,
      'min-length': minLength(3),
    },
  };
}
