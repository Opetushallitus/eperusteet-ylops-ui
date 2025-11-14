import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required } from '@vuelidate/validators';

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
