import { Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoot from '@/mixins/EpRoot';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import {
  EpCollapse,
  EpEditointi,
  EpContent,
  EpInput,
  EpButton,
} from '@/components';

import {
  Opetussuunnitelma,
} from '@/stores/opetussuunnitelma';

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
    EpContent,
    EpCollapse,
    EpEditointi,
    EpInput,
  },
})
export default class TekstikappaleTeksti extends Mixins(EpRoot) {
  @Prop({ required: true })
  private opsId!: number;

  @Prop({ required: true })
  private osaId!: number;

  @Prop({ default: false })
  private allowOhjeEdit!: boolean;

  private ohjeet: OhjeDto[] = [];
  private perusteenTeksti: PerusteTekstiKappaleViiteDto | null = null;

  private async load() {
    const teksti = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(this.opsId, this.osaId)).data;
    const ohjeet = await Ohjeet.getTekstiKappaleOhje(teksti.tekstiKappale!.tunniste as string);
    const result = {
      tov: _.omit(_.cloneDeep(teksti), 'lapset'),
      ohjeet: ohjeet.data || [],
    } as any;
    if (teksti.perusteTekstikappaleId) {
      this.perusteenTeksti = (await Lops2019Perusteet.getAllLops2019PerusteTekstikappale(this.opsId, teksti.perusteTekstikappaleId)).data;
    }
    return result;
  }

  private async save({ tov, ohjeet }) {
    await Opetussuunnitelma.saveTeksti(tov);
    await Promise.all(_.map(ohjeet, Opetussuunnitelma.saveOhje));
  }

  private hooks: EditointiKontrolliConfig = {
    source: {
      load: this.load,
      save: this.save,
    },
  };

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
