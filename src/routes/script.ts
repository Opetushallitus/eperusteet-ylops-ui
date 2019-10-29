import { Component, Vue } from 'vue-property-decorator';
import EpNavigation from'@/components/EpNavigation/EpNavigation.vue';
import EpFooter from'@/components/EpFooter/EpFooter.vue';

import Sticky from 'vue-sticky-directive';

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
