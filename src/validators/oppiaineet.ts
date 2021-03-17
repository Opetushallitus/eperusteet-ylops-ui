import { nimiValidator } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { koodiValidator } from '@shared/validators/required';

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
