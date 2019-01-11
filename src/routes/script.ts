import { Component, Vue } from 'vue-property-decorator';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import { Kieli } from '@/tyypit';
import { UiKielet } from '@/stores/kieli';

@Component({
  components: {
    EpNavigation,
  },
})
export default class Root extends Vue {
}
