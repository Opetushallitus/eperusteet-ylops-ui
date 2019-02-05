import { Component, Vue } from 'vue-property-decorator';
import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import EpContent from '@/components/EpContent/EpContent.vue';


@Component({
  components: {
    EpContent,
  },
})
export default class HallintaRoute extends Vue {
  private adminlist: OpetussuunnitelmaInfoDto[] = [];

  public mounted() {
    this.fetchAdminData();
  }

  private async fetchAdminData() {
    const opetussuunnitelmat = await Opetussuunnitelmat.getAdminList();
    this.adminlist = opetussuunnitelmat.data;
  }
}
