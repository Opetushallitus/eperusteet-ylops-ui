import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'EpViewer',
})
export default class EpViewer extends Vue {
    @Prop() private value!: string;
}
