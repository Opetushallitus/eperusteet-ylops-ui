import Vue from 'vue';
import VueRouter from 'vue-router';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Matala, Perusteenosat, Sisallot, PerusteDtoTyyppiEnum, Laaja } from '@shared/api/eperusteet';
import { Revision } from '@shared/tyypit';
import _ from 'lodash';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { requiredOneLang } from '@shared/validators/required';
import { PerusteenOsaDto } from '@shared/generated/eperusteet';
import { OpetussuunnitelmanSisalto, Opetussuunnitelmat } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from './opetussuunnitelma';

Vue.use(VueCompositionApi);

interface TekstikappaleStoreConfig {
  router: VueRouter;
}

export class TekstikappaleStore implements IEditoitava {
  private state = reactive({
    tekstikappale: null as Laaja | PerusteenOsaDto | null,
  });

  public readonly tekstikappale = computed(() => this.state.tekstikappale);
  public readonly id = computed(() => this.state.tekstikappale?.id);

  private static config: TekstikappaleStoreConfig;

  public static install(vue: typeof Vue, config: TekstikappaleStoreConfig) {
    TekstikappaleStore.config = config;
  }

  constructor(
    private readonly opsId: number,
    private readonly tekstikappaleId: any,
    private readonly opetussuunnitelmaStore: OpetussuunnitelmaStore,
    public versionumero?: number,
  ) {
  }

  public async fetch() {
    try {
      if (this.versionumero) {
        const revisions = (await Perusteenosat.getPerusteenOsaViiteVersiot(this.tekstikappaleId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        this.state.tekstikappale = (await Perusteenosat.getPerusteenOsaVersioByViite(this.tekstikappaleId, rev.numero)).data;
      }
      else {
        this.state.tekstikappale = (await Perusteenosat.getPerusteenOsatByViite(this.tekstikappaleId)).data;
      }
    }
    catch (err) {
    }
  }

  public async load() {
    const teksti = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(this.opsId, this.tekstikappaleId)).data;
    if (this.versionumero) {
      const revisions = (await OpetussuunnitelmanSisalto
        .getVersionsForTekstiKappaleViite(this.opsId, teksti.tekstiKappale!.id as number)).data;
      const rev = revisions[revisions.length - this.versionumero];
      if (rev) {
        teksti.tekstiKappale = (await OpetussuunnitelmanSisalto
          .getVersionForTekstiKappaleViite(this.opsId, this.tekstikappaleId, rev.numero as number)).data;
      }
    }
    const alkuperaiset = _.filter((await OpetussuunnitelmanSisalto
      .getTekstiKappaleViiteOriginals(this.opsId, this.tekstikappaleId)).data as Matala[], 'tekstiKappale');

    const result = {
      tov: _.omit(_.cloneDeep(teksti), 'lapset'),
      laajaAlaisetOsaamiset: null,
      alkuperaiset,
      perusteenTeksti: null,
      kopioitava: false,
    } as any;

    if (teksti.perusteTekstikappaleId) {
      result.perusteenTeksti = (await OpetussuunnitelmanSisalto.getPerusteTekstikappale(this.opsId, teksti!.id as number)).data;

      if (result.perusteenTeksti?.perusteenOsa?.tunniste === 'laajaalainenosaaminen') {
        result.laajaAlaisetOsaamiset = (await Opetussuunnitelmat.getLaajalaisetosamiset(this.opsId)).data;
      }
    }

    result.kopioitava = result.tov.omistussuhde === 'lainattu';

    return result;
  }

  public async save({ tov, ohjeet }) {
    await this.opetussuunnitelmaStore.saveTeksti(tov);
  }

  public async remove() {
    await this.opetussuunnitelmaStore.removeTeksti(this.tekstikappaleId);
    TekstikappaleStore.config.router.push({
      name: 'opsPoistetut',
      params: {
        tabIndex: '2',
      },
    });
  }

  public readonly validator = computed(() => {
    return {
      tov: {
        tekstiKappale: {
          nimi: requiredOneLang(),
        },
      },
    };
  });

  public features(data) {
    return computed(() => {
      return {
        editable: this.opetussuunnitelmaStore.opetussuunnitelma!.tyyppi as string !== 'pohja',
        removable: data.perusteenTeksti === null,
        copyable: data.tov.omistussuhde === 'lainattu',
      } as EditoitavaFeatures;
    });
  }

  public async editAfterLoad() {
    return false;
  }

  public async revisions(data) {
    if (data) {
      return (await OpetussuunnitelmanSisalto.getVersionsForTekstiKappaleViite(this.opsId, data.tov.tekstiKappale.id)).data as Revision[];
    }

    return [] as Revision[];
  }

  public async restore(rev: number) {
    await OpetussuunnitelmanSisalto.revertTekstikappaleToVersion(this.opsId, this.tekstikappaleId, rev);
  }
}
