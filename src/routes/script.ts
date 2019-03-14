import { Component, Vue } from 'vue-property-decorator';
import {
  EpNavigation,
  EpFooter,
} from '@/components';

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
