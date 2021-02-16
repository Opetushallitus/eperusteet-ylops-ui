import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokat, PerusteOppiaineenVuosiluokkakokonaisuusDto, Opetussuunnitelmat, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';

export class PerusopetusoppiaineVuosiluokkaStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private vuosiluokkaId: number
  ) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    let oppiaine;
    let vuosiluokka;
    let perusteenOppiaine;
    let laajaalaisetOsaamiset;
    let vuosiluokkakokonaisuus;
    [oppiaine, vuosiluokka, perusteenOppiaine, laajaalaisetOsaamiset, vuosiluokkakokonaisuus] = _.map(await (Promise.all([
      Oppiaineet.getOppiaine(this.opsId, this.oppiaineId),
      OppiaineenVuosiluokat.getOppiaineenvuosiluokka(this.opsId, this.oppiaineId,
        (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id as number), this.vuosiluokkaId),
      Oppiaineet.getPerusteSisalto(this.opsId, this.oppiaineId),
      Opetussuunnitelmat.getLaajalaisetosamiset(this.opsId),
      Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuus(this.opsId, (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id as number)),
    ])), 'data');

    const perusteenVlk = _.find(perusteenOppiaine.vuosiluokkakokonaisuudet, vlk =>
      vlk._vuosiluokkakokonaisuus === (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus as any)._tunniste) as PerusteOppiaineenVuosiluokkakokonaisuusDto;
    const sisaltoalueetMap = _.keyBy(perusteenVlk.sisaltoalueet, 'tunniste');
    const perusteenLaajaalaisetOsaamisetMap = _.keyBy(laajaalaisetOsaamiset, 'tunniste');
    const paikallisetLaajaalaisetOsaamisetMap = _.keyBy(vuosiluokkakokonaisuus.laajaalaisetosaamiset, '_laajaalainenosaaminen');
    const vuosiluokanTavoitteet = _.keyBy(vuosiluokka.tavoitteet, 'tunniste');
    const vuosiluokanSisaltoalueet = _.keyBy(vuosiluokka.sisaltoalueet, 'tunniste');
    let kohdealueGlobalIndex = 0;

    return {
      oppiaine,
      vuosiluokka,
      perusteenVlk: {
        ...perusteenVlk,
        sisaltoalueet: _.filter(_.map(perusteenVlk.sisaltoalueet, (sisaltoalue: any) => {
          return {
            ...sisaltoalue,
            vuosiluokanSisaltoalue: vuosiluokanSisaltoalueet[sisaltoalue.tunniste],
          };
        }), 'vuosiluokanSisaltoalue'),
      },
      perusteenTavoitteet: _.chain(perusteenVlk.tavoitteet)
        .filter(tavoite => !!vuosiluokanTavoitteet[tavoite.tunniste as string])
        .map(tavoite => {
          return {
            ...tavoite,
            sisaltoalueet: _.chain(tavoite.sisaltoalueet)
              .map((sisaltoalue: string) => sisaltoalueetMap[sisaltoalue])
              .map((sisaltoalue: any) => {
                return {
                  ...sisaltoalue,
                  vuosiluokanSisaltoalue: _.chain(_.get(vuosiluokanTavoitteet[tavoite.tunniste as string], 'sisaltoalueet'))
                    .filter(vlSisaltoalue => vlSisaltoalue.sisaltoalueet.tunniste === sisaltoalue.tunniste)
                    .map(vlSisaltoalue => {
                      return {
                        ...vlSisaltoalue,
                        kaytaOmaaKuvausta: vlSisaltoalue.omaKuvaus !== null,
                      } as any;
                    })
                    .sortBy('id')
                    .head()
                    .value(),
                };
              })
              .filter(sisaltoalue => vuosiluokanSisaltoalueet[sisaltoalue.sisaltoalueet.tunniste] && vuosiluokanSisaltoalueet[sisaltoalue.sisaltoalueet.tunniste].piilotettu)
              .sortBy([(sisaltoalue: any) => {
                return sisaltoalue.nimi[Kielet.getSisaltoKieli.value];
              }])
              .value(),
            laajaalaisetosaamiset: _.chain(tavoite.laajaalaisetosaamiset)
              .map((lao: string) => {
                return {
                  perusteenLao: perusteenLaajaalaisetOsaamisetMap[lao],
                  paikallinenLao: paikallisetLaajaalaisetOsaamisetMap[lao],
                };
              })
              .sortBy([(lao: any) => {
                return lao.perusteenLao.nimi[Kielet.getSisaltoKieli.value];
              }])
              .value(),
            kohdealueet: _.map(tavoite.kohdealueet, kohdealue => {
              return {
                ...kohdealue,
                index: kohdealueGlobalIndex++,
              };
            }),
            vuosiluokanTavoite: vuosiluokanTavoitteet[(tavoite.tunniste as string)],
            hyvanOsaamisenKuvaus: _.find(tavoite.arvioinninkohteet, kohde => kohde.arvosana === 8),
          };
        })
        .value(),
    };
  }

  async save(data: any) {
    const vuosiluokka = {
      ...data.vuosiluokka,
      tavoitteet: _.map(data.perusteenTavoitteet, tavoite => {
        return {
          ...tavoite.vuosiluokanTavoite,
          sisaltoalueet: _.map(tavoite.sisaltoalueet, sisaltoalue => {
            return {
              ...sisaltoalue.vuosiluokanSisaltoalue,
              omaKuvaus: sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta ? sisaltoalue.vuosiluokanSisaltoalue.omaKuvaus : null,
            };
          }),
        };
      }),
      sisaltoalueet: _.map(data.perusteenVlk.sisaltoalueet, sisaltoalue => sisaltoalue.vuosiluokanSisaltoalue),
    };

    data.vuosiluokka = (await OppiaineenVuosiluokat.updateVuosiluokanSisalto(this.opsId, this.oppiaineId,
      (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id as number), this.vuosiluokkaId, vuosiluokka)).data;

    return data;
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
  });

  public features() {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }
}
