import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from 'vue';
import { Oppiaineet, OppiaineenVuosiluokkakokonaisuudet, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { required, maxValue, minValue } from '@vuelidate/validators';

export class VuosiluokkaistaminenStore implements IEditoitava {
  constructor(private opsId: number, private vlkId: number, private oppiaineId: number, private el, private postSave: Function) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
    this.el.$router.push({
      name: 'perusopetusoppiaine',
      params: {
        vlkId: this.vlkId,
        oppiaineId: this.oppiaineId,
      },
    });
  }

  async editAfterLoad() {
    return true;
  }

  async history() {
  }

  async load() {
    let oppiaine = {} as any;
    let perusteenOppiaineenVlk = {} as any;
    let perusteenVlk = {} as any;
    [oppiaine, perusteenVlk] = _.map(await (Promise.all([
      Oppiaineet.getOppiaine(this.opsId, this.oppiaineId),
      Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuudenPerusteSisalto(this.opsId, this.vlkId),
    ])), 'data');

    const oppiaineenVlk = _.head(_.filter(oppiaine.vuosiluokkakokonaisuudet, vlk => vlk._vuosiluokkakokonaisuus === perusteenVlk.tunniste));
    perusteenOppiaineenVlk = (await OppiaineenVuosiluokkakokonaisuudet.getOppiaineenVuosiluokkakokonaisuudenPerusteSisalto(this.opsId, this.oppiaineId, oppiaineenVlk.id)).data;

    const sisaltoalueetMap = _.keyBy(perusteenOppiaineenVlk.sisaltoalueet, 'tunniste');
    const tavoitteetMap = _.keyBy(perusteenOppiaineenVlk.tavoitteet, 'tunniste');
    let kohdealueGlobalIndex = 0;

    return {
      oppiaine,
      perusteenOppiaineenVlk: {
        ...perusteenOppiaineenVlk,
        tavoitteet: _.map(perusteenOppiaineenVlk.tavoitteet, tavoite => {
          return {
            ...tavoite,
            sisaltoalueet: _.sortBy(tavoite.sisaltoalueet, [(sisaltoalue: any) => {
              return sisaltoalueetMap[sisaltoalue].nimi[Kielet.getSisaltoKieli.value];
            }]),
            kohdealueet: _.map(tavoite.kohdealueet, kohdealue => {
              return {
                ...kohdealue,
                index: kohdealueGlobalIndex++,
              };
            }),
          };
        }),
      },
      oppiaineenVlk,
      sisaltoalueetMap,
      vuosiluokat: _.chain(perusteenOppiaineenVlk.vuosiluokat)
        .map(vuosiluokka => {
          const tavoitteet = _.chain(oppiaineenVlk.vuosiluokat)
            .filter(opvlk => opvlk.vuosiluokka === vuosiluokka)
            .map('tavoitteet')
            .flatten()
            .filter(vlktavoite => !!tavoitteetMap[vlktavoite.tunniste])
            .map(vlktavoite => {
              return {
                ...vlktavoite,
                tavoite: tavoitteetMap[vlktavoite.tunniste].tavoite,
              };
            })
            .value();

          return {
            vuosiluokka,
            tavoitteet,
          };
        })
        .sortBy('vuosiluokka')
        .value(),
      asettamattomatTavoitteet: 0,
    };
  }

  async save(data: any) {
    const vuosiluokkatavoitteet = _.chain(data.vuosiluokat)
      .keyBy('vuosiluokka')
      .mapValues('tavoitteet')
      .mapValues(tavoitteet => _.map(tavoitteet, 'tunniste'))
      .value();

    await OppiaineenVuosiluokkakokonaisuudet.updateVuosiluokkienTavoitteet(this.opsId, this.oppiaineId, data.oppiaineenVlk.id, vuosiluokkatavoitteet);

    if (this.postSave) {
      await this.postSave();
    }

    return data;
  }

  async preview() {
    return null;
  }

  async release() {
    this.el.$router.push({
      name: 'perusopetusoppiaine',
      params: {
        vlkId: this.vlkId,
        oppiaineId: this.oppiaineId,
      },
    });
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
    return {
      asettamattomatTavoitteet: {
        'max-value': maxValue(0),
      },
    };
  });

  public features() {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        recoverable: false,
        validated: true,
      } as EditoitavaFeatures;
    });
  }
}
