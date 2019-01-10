import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';

@Component
export default class Home extends Vue {
  private get kayttaja() {
    return Kayttajat.tiedot;
  }
}
