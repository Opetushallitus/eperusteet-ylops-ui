<template lang="pug">
div
  router-link(
    :to="{ 'name': 'tekstikappale', params: { osaId: value.id } }",
    tag="li")
    a.btn.btn-link {{ $kaanna(value.tekstiKappale.nimi) || $t('nimetön-tekstikappale') }}
  ul.subnav(:class="'subnav-' + depth")
    ops-sidenav-item.subnav(v-for="lapsi in value.lapset", :key="lapsi.id", :value="lapsi", :depth="depth + 1")
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';


@Component({
  name: 'ops-sidenav-item',
})
export default class extends Vue {

  @Prop({ default: 0 })
  private depth!: number;

  @Prop({ required: true })
  private value: any;

}
</script>

<style scoped lang="scss" src="./sidenav.scss"></style>

