import { notNull, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function pohjaLuontiValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    valittuPeruste: {
      ...notNull(),
    },
  };
}

export function opsLuontiValidator(kielet: Kieli[] = []) {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    pohja: {
      ...notNull(),
    },
    organisaatiot: {
      kunnat: {
        required,
      },
      jarjestajat: {
        required,
      },
    },
  };
}

export function opsTiedotValidator(kielet: Kieli[] = [], isOps = true) {
  const common = {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
  };

  if (isOps) {
    return {
      ...common,
      julkaisukielet: {
        required,
        'min-length': minLength(1),
      },
    };
  }
  else {
    return {
      ...common,
    };
  }
}
