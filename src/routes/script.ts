import { Component, Vue } from 'vue-property-decorator';
import EpTopBar from '@/components/EpTopBar/EpTopBar.vue';

@Component({
  components: {
    EpTopBar,
  },
})
export default class Root extends Vue {
}
