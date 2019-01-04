import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/hello/component.vue';
import { Kayttajat } from '@/stores/kayttaja';

@Component({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {
  private get kayttaja() {
    return Kayttajat.tiedot;
  }
}
