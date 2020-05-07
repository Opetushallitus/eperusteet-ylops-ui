import { OpetussuunnitelmaInfoDtoToteutusEnum } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';

export function isOpsToteutusSupported(ops: any) {
  const { toteutus } = ops;
  return _.includes([
    OpetussuunnitelmaInfoDtoToteutusEnum.LOPS2019.toLowerCase(),
    OpetussuunnitelmaInfoDtoToteutusEnum.YKSINKERTAINEN.toLowerCase(),
    OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase(),
  ], toteutus);
}

export function sortedOppiaineet(oppianeet) {
  return _.chain(oppianeet)
    .sortBy(oppiaine => Kielet.kaanna(oppiaine.oppiaine.nimi))
    .sortBy(oppiaine => oppiaine.jnro)
    .map('oppiaine')
    .map(oppiaine => {
      return {
        ...oppiaine,
        oppimaarat: _.chain(oppiaine?.oppimaarat)
          .sortBy(oppimaara => Kielet.kaanna(oppimaara.nimi))
          .sortBy(oppimaara => _.get(_.head(oppimaara.vuosiluokkakokonaisuudet), 'jnro'))
          .value(),
      };
    })
    .value();
}
