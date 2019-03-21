import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function kysymysValidator(kielet: Kieli[] = []) {
  return {
    kysymys: {
      ...requiredLokalisoituTeksti(kielet),
    },
    vastaus: {
      ...requiredLokalisoituTeksti(kielet),
    },
    organisaatiot: {
      required,
      'min-length': minLength(1),
    },
  };
}
