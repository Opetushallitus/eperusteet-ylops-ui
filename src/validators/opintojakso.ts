import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function opintojaksoLuontiValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    oppiaineet: {
      required,
    },
  };
}

export function opintojaksoValidator(kielet: Kieli[] = []) {
  return {
    ...opintojaksoLuontiValidator(kielet),
    koodi: {
      required,
      'min-length': minLength(3),
    },
  };
}
