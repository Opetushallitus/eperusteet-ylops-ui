<template lang="pug">
ep-multi-select(
  v-if="cache",
  :value="value || []",
  @input="handleInput",
  @search="query = $event",
  :options="filteredOppiaineet")
  template(slot="singleLabel", slot-scope="{ option }")
    span.selected {{ $kaanna(oppiaineetMap[option].nimi) }}
  template(slot="option", slot-scope="{ option, search }")
    div {{ $kaanna(oppiaineetMap[option].nimi) }}
  template(slot="tag", slot-scope="{ option, search, remove }")
    span.selected
      span {{ $kaanna(oppiaineetMap[option].nimi) }}
      button.btn.btn-link(@click="remove(option)")
        fas(icon="times")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
  EpMultiSelect,
} from '@/components';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto } from '@/tyypit';
import { PerusteCache } from '@/stores/peruste';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';

@Component({
  components: {
    EpMultiSelect,
  },
})
export default class EpOppiaineSelector extends Vue {
  @Prop({ required: true })
  private opsId!: number;

  @Prop()
  private value!: string[];

  private cache: PerusteCache | null = null;
  private query = '';

  get oppiaineet() {
    if (this.cache) {
      return this.cache.peruste().oppiaineet;
    }
    else {
      return [];
    }
  }

  get oppiaineetJaOppimaarat() {
    return _(this.oppiaineet)
      .map((oa: any) => [oa, ..._.map(oa.oppimaarat, om => ({
        ...om,
        parentUri: oa.koodi.uri,
      }))])
      .flatten()
      .value();
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get filteredOppiaineet() {
    return _(this.oppiaineetJaOppimaarat)
      .filter((org) => Kielet.search(this.query, org.nimi))
      .map('koodi.uri')
      .value();
  }

  async mounted() {
    this.cache = await PerusteCache.of(this.opsId);
  }

  handleInput(value: any) {
    this.$emit('input', value);
  }
}
</script>
