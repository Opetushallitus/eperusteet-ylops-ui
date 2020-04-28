import { OpetussuunnitelmaInfoDtoToteutusEnum } from '@shared/api/ylops';
import * as _ from 'lodash';

export function isOpsToteutusSupported(ops: any) {
  const { toteutus } = ops;
  return _.includes([
    OpetussuunnitelmaInfoDtoToteutusEnum.LOPS2019.toLowerCase(),
    OpetussuunnitelmaInfoDtoToteutusEnum.YKSINKERTAINEN.toLowerCase(),
    OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase(),
  ], toteutus);
}
