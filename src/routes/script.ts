import { Component, Vue } from 'vue-property-decorator';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import { Kieli } from '@/tyypit';
import { UiKielet } from '@/stores/kieli';
import Sticky from 'vue-sticky-directive';

@Component({
  directives: {
    Sticky,
  },
  components: {
    EpNavigation,
  },
})
export default class Root extends Vue {
}
