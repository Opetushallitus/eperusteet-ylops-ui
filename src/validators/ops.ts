import { notNull, requiredLokalisoituTeksti } from '@/validators/required';
import { Kieli } from '@shared/tyypit';
import { minLength, required, requiredIf } from '@vuelidate/validators';
import { OpetussuunnitelmaInfoDtoToteutusEnum, OpetussuunnitelmaLuontiDtoLuontityyppiEnum } from '@shared/api/ylops';
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

export function lops2019Validators(luontityyppi: OpetussuunnitelmaLuontiDtoLuontityyppiEnum) {
  return {
    tuoPohjanOpintojaksot: {
      required: requiredIf(() => {
        return luontityyppi === OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;
      }),
    },
    tuoPohjanOppimaarat: {
      required: requiredIf(() => {
        return luontityyppi === OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;
      }),
    },
  };
}

const arrayLengthNotOne = (value) => _.size(value) !== 1;
const arrayLengthOne = (value) => _.size(value) === 1;

export function opsLuontiValidator(kielet: Kieli[] = [], luontityyppi: OpetussuunnitelmaLuontiDtoLuontityyppiEnum, toteutus?: OpetussuunnitelmaInfoDtoToteutusEnum, luotavaOpsOrganisaatioTaso?: LuotavaOpsOrganisaatioTaso) {
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
        required: requiredIf((value, siblings) => {
          return _.size(siblings.jarjestajat) === 0;
        }),
      },
      jarjestajat: {
        required: requiredIf((value, siblings) => {
          return _.size(siblings.ryhmat) === 0;
        }),
      },
      oppilaitokset: {
        required: requiredIf((value, siblings) => {
          return luotavaOpsOrganisaatioTaso === 'oppilaitos';
        }),
        ...(luotavaOpsOrganisaatioTaso === 'oppilaitos' && { arrayLengthOne }),
        ...(luotavaOpsOrganisaatioTaso === 'kunta' && { arrayLengthNotOne }),
      },
    },
  } as any;

  if (toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase()) {
    opsValidators = {
      ...opsValidators,
      ...opsPerusopetusLuontiValidators(),
    };
  }

  if (toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.LOPS2019.toLowerCase()) {
    opsValidators = {
      ...opsValidators,
      ...lops2019Validators(luontityyppi),
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
