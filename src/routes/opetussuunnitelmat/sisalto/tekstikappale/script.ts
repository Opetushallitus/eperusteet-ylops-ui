import { Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

import EpRoot from '@/mixins/EpRoot';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import {
  EpButton,
  EpCollapse,
  EpContent,
  EpEditointi,
  EpField,
  EpFormContent,
  EpInput,
} from '@/components';

import {
  Lops2019Perusteet,
  Ohjeet,
  OpetussuunnitelmanSisalto,
} from '@/api';

import {
  Puu,
  OhjeDto,
  PerusteTekstiKappaleViiteDto,
} from '@/tyypit';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpFormContent,
    EpField,
    EpInput,
  },
})
export default class RouteTekstikappale extends Mixins(EpRoute) {
  private editable: any = {};
  private ohjeet: OhjeDto[] = [];
  private perusteenTeksti: PerusteTekstiKappaleViiteDto | null = null;
  private nimi: any = {};
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: async () => await this.isUusi(),
    source: {
      load: this.load,
      save: this.save,
    },
  };

  get isPohja() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get allowOhjeEdit() {
    return this.isPohja;
  }

  get opsId() {
    return _.parseInt(this.$route.params.id);
  }

  get osaId(): number {
    return _.parseInt(this.$route.params.osaId);
  }

  async isUusi() {
    return this.$route.params.osaId === 'uusi';
  }

  private async load() {
    if (await this.isUusi()) {
      return {
        tov: {
          tekstiKappale: {
            nimi: {},
          },
        },
      };
    }
    else {
      const teksti = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(this.opsId, this.osaId)).data;
      const ohjeet = await Ohjeet.getTekstiKappaleOhje(teksti.tekstiKappale!.tunniste as string);
      const result = {
        tov: _.omit(_.cloneDeep(teksti), 'lapset'),
        ohjeet: ohjeet.data || [],
      } as any;
      if (teksti.perusteTekstikappaleId) {
        this.perusteenTeksti = (await Lops2019Perusteet.getAllLops2019PerusteTekstikappale(this.opsId, teksti.perusteTekstikappaleId)).data;
      }
      this.breadcrumb('tekstikappale', teksti.tekstiKappale!.nimi);
      return result;
    }
  }

  private async save({ tov, ohjeet }) {
    if (this.isUusi) {
      await Opetussuunnitelma.addTeksti(tov, _.parseInt(this.$route.params.parentId));
    }
    else {
      await Opetussuunnitelma.saveTeksti(tov);
      await Promise.all(_.map(ohjeet, Opetussuunnitelma.saveOhje));
    }
  }

  private async addAlikappale(parent: Puu) {
    const uusi = await Opetussuunnitelma.addTeksti({}, parent.id);
    this.$router.push({
      name: 'tekstikappale',
      params: {
        ...this.$route.params,
        osaId: '' + uusi.id,
      },
    });
  }

}
