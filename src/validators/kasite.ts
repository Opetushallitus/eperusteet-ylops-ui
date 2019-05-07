import { requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';

export function kasiteValidator(kielet: Kieli[] = []) {
  return {
    termi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    selitys: {
      ...requiredLokalisoituTeksti(kielet),
    },
  };
}
