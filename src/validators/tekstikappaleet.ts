import { notNull, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function tekstikappaleLuontiValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
  };
}
