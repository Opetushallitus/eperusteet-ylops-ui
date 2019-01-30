import { Component, Vue } from 'vue-property-decorator';

import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';

import { Kayttajat } from '@/stores/kayttaja';

import EpAikaleima from '@/components/EpAikaleima/EpAikaleima.vue';
import EpContent from '@/components/EpContent/EpContent.vue';


@Component({
  components: {
    EpAikaleima,
    EpContent,
  },
})
export default class Home extends Vue {
  private opspohjalista: OpetussuunnitelmaInfoDto[] = [];

  public mounted() {
    this.haeOpsPohjat();
  }

  private get kayttaja() {
    return Kayttajat.tiedot;
  }

  private async haeOpsPohjat() {
    const opsPohjat = await Opetussuunnitelmat.getAll('POHJA');
    this.opspohjalista = opsPohjat.data;
  }

  private naytaPohjanTiedot(id: string) {
    this.$router.push({
      name: 'pohjanTiedot',
      params: {
        id,
      },
    });
  }

}
