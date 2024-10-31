import { Component, Vue, Prop } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpFooter from '@/components/EpFooter/EpFooter.vue';

@Component({
  directives: {
    Sticky,
  },
  components: {
    EpNavigation,
    EpFooter,
  },
})
export default class Root extends Vue {
}
