import { notNull, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required } from 'vuelidate/lib/validators';
import { OpetussuunnitelmaInfoDtoToteutusEnum } from '@shared/api/ylops';

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

export function opsPerusopetusLuontiValidators() {
  return {
    vuosiluokkakokonaisuudet: {
      required,
    },
  };
}

export function lops2019Validators() {
  return {
    tuoPohjanOpintojaksot: {
      required,
    },
  };
}

export function opsLuontiValidator(kielet: Kieli[] = [], toteutus?: OpetussuunnitelmaInfoDtoToteutusEnum) {
  let opsValidators = {
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

  if (toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase()) {
    opsValidators = {
      ...opsValidators,
      ...opsPerusopetusLuontiValidators(),
    };
  }

  if (toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.LOPS2019.toLowerCase()) {
    opsValidators = {
      ...opsValidators,
      ...lops2019Validators(),
    };
  }

  return opsValidators;
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
