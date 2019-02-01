import { Component, Vue } from 'vue-property-decorator';

import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';

import { Kayttajat } from '@/stores/kayttaja';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpAikaleima from '@/components/EpAikaleima/EpAikaleima.vue';

@Component({
  components: {
    EpContent,
    EpAikaleima,
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
