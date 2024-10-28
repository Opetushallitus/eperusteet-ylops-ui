import { Component, Vue, Prop } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';

import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
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
  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;
}
