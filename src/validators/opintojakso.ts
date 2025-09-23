import { nimiValidator, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required, minValue } from '@vuelidate/validators';
import { koodiValidator } from '@shared/validators/required';

export function opintojaksoLuontiValidator(kielet: Kieli[] = []) {
  return {
    ...nimiValidator(kielet),
    oppiaineet: {
      required,
      $each: {
        laajuus: {
          'min-value': minValue(0),
        },
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
