import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019PaikallinenOppiaineDto } from '@shared/api/ylops';

export function oppiaine(): Lops2019PaikallinenOppiaineDto {
  const oa = {
    nimi: {},
    tehtava: {},
    arviointi: {},
    laajaAlainenOsaaminen: [],
    tavoitteet: {
      tavoitealueet: [],
    },
  };
  return oa;
}

export function opintojakso(oppiaineUri?: string): Lops2019OpintojaksoDto {
  return {
    arviointi: {},
    keskeisetSisallot: [],
    kuvaus: {},
    laajaAlainenOsaaminen: [],
    moduulit: [],
    nimi: {},
    oppiaineet: [],
    tavoitteet: [],
    paikallisetOpintojaksot: [],
  };
}
