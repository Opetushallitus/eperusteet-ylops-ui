<template lang="pug">

ep-main-view
  template(slot="icon")
    ep-icon.float-right(icon="tyoryhma", background-color="#82D4FF")

  template(slot="header")
    h1 {{ $t('organisaatio-tyoryhma') }}
    p {{ $t('organisaatio-tyoryhma-kuvaus') }}

</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoot';
import { Kielet } from '@/stores/kieli';

import {
  EpAikaleima,
  EpCollapse,
  EpContent,
  EpIcon,
  EpKaanna,
  EpMainView,
  EpNavigation,
  EpSearch,
  EpSpinner,
} from '@/components';
import { Ulkopuoliset } from '@/api';

@Component({
  components: {
    EpAikaleima,
    EpCollapse,
    EpContent,
    EpIcon,
    EpKaanna,
    EpMainView,
    EpNavigation,
    EpSearch,
    EpSpinner,
  },
})
export default class RouteOrganisaatio extends Mixins(EpRoute) {
  async init() {
    // await this.update();
  }
}
</script>

<style scoped lang="scss">

</style>
