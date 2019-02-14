import { Vue, Component, Prop } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';


@Component({
  directives: {
    Sticky,
  },
})
export default class EpSidebar extends Vue {

}
