import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'EpCollapse',
})
export default class EpCollapse extends Vue {
  private toggled = true;
}
