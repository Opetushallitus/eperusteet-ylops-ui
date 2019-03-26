import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'EpCollapse',
})
export default class EpCollapse extends Vue {
  @Prop({ default: true })
  private defaultState!: boolean;

  private toggled = this.defaultState;

}
