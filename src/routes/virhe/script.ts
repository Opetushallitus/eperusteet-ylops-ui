import { Component, Vue } from 'vue-property-decorator';

@Component
export default class VirheRoute extends Vue {
  private error: any = {};

  public mounted() {
    try {
      this.error = JSON.parse((this.$route.query as any).virhe);
    }
    catch (err) {
      console.error(err);
    }
  }

}
