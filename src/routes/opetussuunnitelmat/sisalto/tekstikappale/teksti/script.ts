import { Watch, Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpInput from '@/components/forms/EpInput.vue';
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
    EpInput,
  },
})
export default class TekstikappaleTeksti extends Mixins(EpRoot) {
  @Prop({ required: true })
  private value!: Puu;

  private ohjeet: OhjeDto[] = [];

  private hooks: EditointiKontrolliConfig = {
    source: {
      load: async () => _.omit(_.cloneDeep(this.value), 'lapset'),
      async save() {
      },
    },
  };

  protected async init() {
    if (this.value.tekstiKappale) {
      try {
        const ohjeet = await Ohjeet.getTekstiKappaleOhje(this.value.tekstiKappale.tunniste as string);
        this.ohjeet = ohjeet.data;
      }
      finally {}
    }
  }

  @Watch('$route.params.osaId')
  private scrollIntoView() {
    if (_.parseInt(this.$route.params.osaId) === this.value.id) {
      this.$el.scrollIntoView(true);
      window.scrollBy(0, -80);
    }
  }

}
