<template>
<div>
  <ep-multi-select
      v-if="cache"
      :value="sortedValue"
      @input="handleInput"
      @search="query = $event"
      :options="filteredOppiaineet">
    <template slot="singleLabel" slot-scope="{ option }">
      <span class="selected">{{ $kaanna(oppiaineetMap[option].nimi) }}</span>
    </template>
    <template slot="option" slot-scope="{ option }">
      <div>{{ $kaanna(oppiaineetMap[option].nimi) }}</div>
    </template>
    <template slot="tag" slot-scope="{ option, search, remove }">
      <span class="selected">
        <span>{{ $kaanna(oppiaineetMap[option].nimi) }}</span>
        <button class="btn btn-link" @click="remove(option)">
          <fas icon="times" />
        </button>
      </span>
    </template>
  </ep-multi-select>
  <div class="valid-feedback" v-if="!validationError && validMessage">{{ $t(validMessage) }}</div>
  <div class="invalid-feedback" v-else-if="validationError && invalidMessage ">{{ $t(invalidMessage) }}</div>
  <div class="invalid-feedback" v-else-if="validationError && !invalidMessage">{{ $t('validation-error-' + validationError, validation.$params[validationError]) }}</div>
  <small class="form-text text-muted">{{ $t('oppiaine-valitsin-ohje') }}</small>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import EpValidation from '@/mixins/EpValidation';
import { EpMultiSelect } from '@/components';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto } from '@/tyypit';
import { PerusteCache } from '@/stores/peruste';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';

@Component({
  components: {
    EpMultiSelect,
  },
})
export default class EpOppiaineSelector extends Mixins(EpValidation) {
  @Prop({ required: true })
  private opsId!: number;

  @Prop()
  private value!: string[];

  private cache: PerusteCache | null = null;
  private query = '';

  get sortedValue() {
    return _.sortBy(this.value || [], _.identity);
  }

  get paikallisetOppiaineet() {
    return _(Opetussuunnitelma.paikallisetOppiaineet)
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
    return _(this.oppiaineet)
      .map((oa: any) => [oa, ..._.map(oa.oppimaarat, om => {
        return {
          ...om,
          parentUri: oa.koodi.uri,
        };
      })])
      .flatten()
      .value();
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get filteredOppiaineet() {
    return _(this.oppiaineetJaOppimaarat)
      .filter((org: any) => Kielet.search(this.query, org.nimi))
      .map('koodi.uri')
      .sort()
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
