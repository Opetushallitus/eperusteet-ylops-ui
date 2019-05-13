import { koodiValidator, nimiValidator, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function opintojaksoLuontiValidator(kielet: Kieli[] = []) {
  return {
    ...nimiValidator(kielet),
    oppiaineet: {
      required,
      $each: {
        ...koodiValidator(),
      },
    },
  };
}

export function opintojaksoValidator(kielet: Kieli[] = []) {
  return {
    ...opintojaksoLuontiValidator(kielet),
    ...koodiValidator(),
  };
}
