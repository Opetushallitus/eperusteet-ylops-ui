import { notNull, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required, requiredIf } from 'vuelidate/lib/validators';
import { OpetussuunnitelmaInfoDtoToteutusEnum } from '@shared/api/ylops';
import * as _ from 'lodash';

export type LuotavaOpsOrganisaatioTaso = 'kunta' | 'oppilaitos';

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
    tuoPohjanOppimaarat: {
      required,
    },
  };
}

const arrayLengthNotOne = (value) => _.size(value) !== 1;
const arrayLengthOne = (value) => _.size(value) === 1;

export function opsLuontiValidator(kielet: Kieli[] = [], toteutus?: OpetussuunnitelmaInfoDtoToteutusEnum, luotavaOpsOrganisaatioTaso?: LuotavaOpsOrganisaatioTaso) {
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
      ryhmat: {
        required: requiredIf((form) => {
          return _.size(form.jarjestajat) === 0;
        }),
      },
      jarjestajat: {
        required: requiredIf((form) => {
          return _.size(form.ryhmat) === 0;
        }),
      },
      oppilaitokset: {
        required: requiredIf((form) => {
          return luotavaOpsOrganisaatioTaso === 'oppilaitos';
        }),
        ...(luotavaOpsOrganisaatioTaso === 'oppilaitos' && { arrayLengthOne }),
        ...(luotavaOpsOrganisaatioTaso === 'kunta' && { arrayLengthNotOne }),
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
      kaikkiOrganisaatiot: {
        kunnat: {
          required,
        },
        ryhmat: {
          required: requiredIf((form) => {
            return _.size(form.jarjestajat) === 0;
          }),
        },
        jarjestajat: {
          required: requiredIf((form) => {
            return _.size(form.ryhmat) === 0;
          }),
        },
      },
    };
  }
  else {
    return {
      ...common,
    };
  }
}
