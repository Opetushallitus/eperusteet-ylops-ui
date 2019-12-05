<template>
  <ep-main-view>
    <template slot="icon">
      <ep-icon class="float-right" icon="question" background-color="#CE52C6"></ep-icon>
    </template>

    <template slot="header">
      <h1>{{ $t('virhe-nakyma-otsikko') }}</h1>
    </template>

    <div slot="custom-content">
      <div class="virhekuva">
        <img src="../../../public/img/images/virhe.svg" :alt="$t('virhe-kuva-teksti')">
      </div>

      <div class="d-flex flex-row-reverse">
        <div class="align-self-center">
          <router-link :to="{ name: 'root'}">{{ $t('palaa-etusivulle') }}</router-link>
        </div>
      </div>
    </div>
  </ep-main-view>

</template>

<script lang="ts" >
import { Component, Vue } from 'vue-property-decorator';
import { createLogger } from '@shared/utils/logger';

import EpButton from '@/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import { SovellusVirhe } from '@shared/tyypit';

const logger = createLogger('Virhe');


@Component({
  components: {
    EpMainView,
    EpField,
    EpContent,
    EpFormContent,
    EpButton,
  },
})
export default class VirheRoute extends Vue {
  private query: SovellusVirhe = {};

  public mounted() {
    const route = (this as any).$route;
    if (route) {
      this.query = route.query;
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.confirm-buttons::after {
  clear: both;
}

.virhekuva {
  img {
    width: 100%;
  }
  padding: 0 10% 0 10%;
}


</style>
