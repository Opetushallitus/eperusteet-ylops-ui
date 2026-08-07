import { OpetussuunnitelmaInfoDtoToteutusEnum } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { KoulutustyyppiToteutus } from '@shared/tyypit';

export function isOpsToteutusSupported(ops: any) {
  const { toteutus } = ops;
  return _.includes([
    KoulutustyyppiToteutus.lops2019.toLowerCase(),
    KoulutustyyppiToteutus.yksinkertainen.toLowerCase(),
    KoulutustyyppiToteutus.perusopetus.toLowerCase(),
    KoulutustyyppiToteutus.tpo.toLowerCase(),
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

export function isOppiaineUskontoTaiKieli(oppiaine) {
  return _.some(['AI', 'KT', 'VK', 'TK'], koodi => _.startsWith(oppiaine.koodiArvo, koodi));
}

export function isOppiaineUskontoTaiVierasKieli(oppiaine) {
  return _.some(['KT', 'VK', 'TK'], koodi => _.startsWith(oppiaine.koodiArvo, koodi));
}
