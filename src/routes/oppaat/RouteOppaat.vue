<template>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="custom-content">
      <EpOppaat :koulutustyypit="koulutustyypit"/>
    </template>
  </ep-main-view>

</template>

<script lang="ts">
import _ from 'lodash';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import { Prop, Vue, Component } from 'vue-property-decorator';
import EpOppaat from '@shared/components/EpOppaat/EpOppaat.vue';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

@Component({
  components: {
    EpOppaat,
    EpMainView,
  },
})
export default class RouteOppaat extends Vue {
  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  get koulutustyypit() {
    return [
      ...EperusteetKoulutustyyppiRyhmat.varhaiskasvatus,
      ...EperusteetKoulutustyyppiRyhmat.esiopetus,
      ...EperusteetKoulutustyyppiRyhmat.perusopetus,
      ...EperusteetKoulutustyyppiRyhmat.lukiokoulutus,
    ];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
