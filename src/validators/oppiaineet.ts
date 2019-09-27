import { koodiValidator, nimiValidator, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function oppiaineLuontiValidator(kielet: Kieli[] = []) {
  return {
    ...nimiValidator(kielet),
    ...koodiValidator(),
  };
}

export function oppiaineValidator(kielet: Kieli[] = []) {
  return {
    ...oppiaineLuontiValidator(kielet),
  };
}
