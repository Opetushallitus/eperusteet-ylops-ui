import { Component, Vue } from 'vue-property-decorator';

import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';

import { Kayttajat } from '@/stores/kayttaja';

import EpContent from '@/components/EpContent/EpContent.vue';

@Component({
  components: {
    EpContent,
  },
})
export default class Home extends Vue {
  private opspohjalista: OpetussuunnitelmaInfoDto[] = [];

  public mounted() {
    this.fetchOpsTemplates();
  }

  private get kayttaja() {
    return Kayttajat.tiedot;
  }

  private async fetchOpsTemplates() {
    const opsPohjat = await Opetussuunnitelmat.getAll('POHJA');
    this.opspohjalista = opsPohjat.data;
  }

}
