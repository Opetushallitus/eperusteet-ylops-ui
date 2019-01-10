import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Virhe extends Vue {
  private error: any = null;

  public mounted() {
    this.error = JSON.parse((this.$route.query as any).virhe);
  }

}
