import { notNull, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';

export function opsTiedotValidator(kielet: Kieli[] = [], isOps = true) {
  const common = {
    nimi: {
      ...requiredLokalisoituTeksti(kielet),
    },
    julkaisukielet: {
      required,
      'min-length': minLength(2),
    },
  };

  if (isOps) {
    return {
      ...common,
      hyvaksyjataho: {
        required,
      },
      paatospaivamaara: {
        required,
      },
    };
  }
  else {
    return {
      ...common,
    };
  }
}

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
      jarjestajat: {
        required,
      },
    },
  };
}
