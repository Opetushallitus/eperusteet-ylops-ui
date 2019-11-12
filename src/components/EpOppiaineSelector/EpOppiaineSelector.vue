<template>
<div v-if="isEditable">
  <ep-multi-select
      v-if="cache"
      :value="sortedValue"
      :multiple="multiple"
      @input="handleInput"
      @search="query = $event"
      :validation="validation"
      :options="filteredOppiaineet"
      help="oppiaine-valitsin-ohje">
    <template slot="singleLabel" slot-scope="{ option }">
      <span class="selected">{{ $kaanna(oppiaineetMap[option].nimi) }}</span>
      <span class="ml-1">({{ oppiaineetMap[option].koodi.arvo }})</span>
    </template>
    <template slot="option" slot-scope="{ option }">
      <span>{{ $kaanna(oppiaineetMap[option].nimi) }}</span>
      <span class="ml-1">({{ oppiaineetMap[option].koodi.arvo }})</span>
    </template>
    <template slot="tag" slot-scope="{ option, remove }">
      <span class="selected">
        <span>{{ $kaanna(oppiaineetMap[option].nimi) }}</span>
        <span class="ml-1">({{ oppiaineetMap[option].koodi.arvo }})</span>
        <button class="btn btn-link" @click="remove(option)">
          <fas icon="times" />
        </button>
      </span>
    </template>
  </ep-multi-select>
</div>
<div v-else-if="value">
  <div v-if="isArray">
    <ul>
      <li v-for="uri in value" :key="uri">
        <span>{{ $kaanna(oppiaineetMap[uri].nimi) }}</span>
        <span class="ml-1">({{ oppiaineetMap[uri].koodi.arvo }})</span>
      </li>
    </ul>
  </div>
  <div v-else-if="oppiaineetMap[value]">
    <span>{{ $kaanna(oppiaineetMap[value].nimi) }}</span>
    <span class="ml-1">({{ oppiaineetMap[value].koodi.arvo }})</span>
  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component, Prop } from 'vue-property-decorator';

import EpValidation from '@/mixins/EpValidation';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpMultiSelect from '@/components/forms/EpMultiSelect.vue';
import { PerusteCache } from '@/stores/peruste';
import { Kielet } from '@shared/stores/kieli';
import { paikallisestiSallitutLaajennokset, koodiNumero, koodiAlku } from '@/utils/perusteet';


@Component({
  components: {
    EpMultiSelect,
  },
})
export default class EpOppiaineSelector extends Mixins(EpValidation, EpOpsComponent) {
  @Prop({ required: true })
  private value!: string | string[];

  @Prop({ default: true })
  private isEditable!: boolean;

  @Prop({ default: true, })
  private multiple!: boolean;

  @Prop()
  private allowed!: string[] | null;

  private cache: PerusteCache | null = null;
  private query = '';

  get isArray() {
    return _.isArray(this.value);
  }

  get sortedValue() {
    if (_.isArray(this.value)) {
      return _.sortBy(this.value || [], _.identity);
    }
    else if (_.isString(this.value)) {
      return this.value;
    }
    else {
      return null;
    }
  }

  get paikallisetOppiaineet() {
    return _(this.store.paikallisetOppiaineet)
      .filter('koodi')
      .map((oa) => {
        return {
          ...oa,
          koodi: {
            uri: oa.koodi,
          }
        };
      })
      .value();
  }

  get oppiaineet() {
    if (this.cache) {
      return [
        ...this.cache.peruste.oppiaineet,
        ...this.paikallisetOppiaineet,
      ];
    }
    else {
      return [];
    }
  }

  get oppiaineetJaOppimaarat() {
    const laajennokset = paikallisestiSallitutLaajennokset();
    return _(this.oppiaineet)
      .map((oa: any) => {
        if (_.isEmpty(oa.oppimaarat)) {
          return [oa];
        }
        else {
          return _.map(oa.oppimaarat, om => ({
              ...om,
              parentUri: oa.koodi.uri,
          }));
        }
      })
      .flatten()
      .reject(oa =>
        _.some(laajennokset, (laajennos) =>
          _.startsWith(_.get(oa, 'koodi.uri'), laajennos)))
      .value();
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get filteredOppiaineet() {
    let pipe = _(this.oppiaineetJaOppimaarat)
      .filter((org: any) => Kielet.search(this.query, org.nimi))
      .map('koodi.uri');
    if (_.isArray(this.allowed) && !_.isEmpty(this.allowed)) {
      pipe = pipe.filter(uri => _.some(this.allowed, alku => _.startsWith(uri, alku)));
    }
    return pipe
      .sortBy(koodiAlku, koodiNumero)
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
