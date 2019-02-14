import { Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpRoot from '@/mixins/EpRoot';
import { EditointiKontrolliConfig } from '@/stores/editointi';
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
    EpContent,
    EpEditointi,
    EpField,
  },
})
export default class TekstikappaleTeksti extends Mixins(EpRoot) {
  @Prop({ required: true })
  private value!: Puu;

  private ohjeet: OhjeDto[] = [];

  protected async init() {
    if (this.value.tekstiKappale) {
      try {
        const ohjeet = await Ohjeet.getTekstiKappaleOhje(this.value.tekstiKappale.tunniste as string);
        this.ohjeet = ohjeet.data;
      }
      finally {}
    }
  }
}
