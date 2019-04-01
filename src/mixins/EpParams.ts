import { Vue, Component } from 'vue-property-decorator';
import _ from 'lodash';

@Component
export default class EpParams extends Vue {

  async navigateTo(name: string, params: object = {}) {
    this.$router.push({
      name,
      params: {
        ...this.$route.params,
        ...params,
      },
    });
  }

  get params(): any {
    return {
      ...this.$route.params,
      id: _.parseInt(this.$route.params.id),
      moduuliId: _.parseInt(this.$route.params.moduuliId) || undefined,
      opintojaksoId: _.parseInt(this.$route.params.opintojaksoId) || undefined,
      oppiaineId: _.parseInt(this.$route.params.oppiaineId) || undefined,
      osaId: _.parseInt(this.$route.params.osaId) || undefined,
    } as any;
  }
}
