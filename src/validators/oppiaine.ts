import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function oppiaineLuontiValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    oppiaineet: {
      required,
    },
  };
}

export function oppiaineValidator(kielet: Kieli[] = []) {
  return {
    ...oppiaineLuontiValidator(kielet),
    koodi: {
      required,
      'min-length': minLength(3),
    },
  };
}
