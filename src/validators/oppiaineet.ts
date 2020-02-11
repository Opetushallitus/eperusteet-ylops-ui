import { koodiValidator, nimiValidator } from '@/validators/required';
import { Kieli } from '@shared/tyypit';

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
