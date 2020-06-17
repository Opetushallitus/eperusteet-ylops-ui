<template>
<div class="sidebar">
  <div class="search">
    <!-- <ep-search v-model="query" /> -->
  </div>
</div>
</template>

<script lang="ts">

import _ from 'lodash';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Vue, Prop, Component } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import EpSearch from '@/components/forms/EpSearch.vue';

@Component({
  components: {
    EpSearch,
  },
})
export default class RouteHakuBar extends Vue {
  // @Prop({ required: true })
  // private hakuStore!: HakuStore;

  // @Prop({ required: true })
  // private opetussuunnitelmaStore!: OpetussuunnitelmaStore;
  //
  // get query() {
  //   return this.hakuStore.query;
  // }
  //
  // set query(value: string) {
  //   this.hakuStore.query = value;
  // }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.sidebar {
  padding-top: 12px;

  .search {
    padding: 10px 20px 10px 30px;
  }
}

</style>
