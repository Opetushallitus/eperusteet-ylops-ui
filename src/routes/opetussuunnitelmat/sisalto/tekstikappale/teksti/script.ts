import { Watch, Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpRoot from '@/mixins/EpRoot';
import { EditointiKontrolliConfig } from '@/stores/editointi';

import {
  Opetussuunnitelma,
} from '@/stores/opetussuunnitelma';

import {
  OpetussuunnitelmanSisalto,
  Ohjeet,
} from '@/api';

import {
  Puu,
  OhjeDto,
} from '@/tyypit';

@Component({
  components: {
    EpButton,
    EpContent,
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

  private hooks: EditointiKontrolliConfig = {
    source: {
      load: async () => {
        const teksti = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(this.opsId, this.osaId)).data;
        const ohjeet = await Ohjeet.getTekstiKappaleOhje(teksti.tekstiKappale!.tunniste as string);
        return {
          tov: _.omit(_.cloneDeep(teksti), 'lapset'),
          ohjeet: ohjeet.data || [],
        };
      },
      async save({ tov, ohjeet }) {
        await Opetussuunnitelma.saveTeksti(tov),
        await Promise.all(_.map(ohjeet, Opetussuunnitelma.saveOhje));
      },
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
