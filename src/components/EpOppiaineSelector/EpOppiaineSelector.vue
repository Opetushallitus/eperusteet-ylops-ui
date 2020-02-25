<template>
<div v-if="isEditable">

  <ep-multi-list-select
    v-if="cache"
    :value="sortedValue"
    tyyppi="oppiaine"
    :items="selectOptions"
    @input="handleInput"
    :validation="validation"
    :required="true"
    :multiple="multiple"/>

</div>
<div v-else-if="value">
  <div v-if="isArray">
    <ul>
      <li v-for="uri in value" :key="uri">
        <span>{{ $kaanna(oppiaineetMap[uri].nimi) }}</span>
        <span class="ml-1">({{ oppiaineetMap[uri].koodiArvo }})</span>
      </li>
    </ul>
  </div>
  <div v-else-if="oppiaineetMap[value]">
    <span>{{ $kaanna(oppiaineetMap[value].nimi) }}</span>
    <span class="ml-1">({{ oppiaineetMap[value].koodiArvo }})</span>
  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component, Prop } from 'vue-property-decorator';

import EpValidation from '@shared/mixins/EpValidation';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import { PerusteCache } from '@/stores/peruste';
import { Kielet } from '@shared/stores/kieli';
import { getArvo, getUri, paikallisestiSallitutLaajennokset, koodiNumero, koodiAlku } from '@/utils/perusteet';

@Component({
  components: {
    EpMultiListSelect,
  },
})
export default class EpOppiaineSelector extends Mixins(EpValidation, EpOpsComponent) {
  @Prop({ required: true })
  private value!: string | string[];

  @Prop({ default: true })
  private isEditable!: boolean;

  @Prop({ default: true })
  private multiple!: boolean;

  @Prop({ required: true})
  private oppiaineFilter!: (any) => boolean;

  private cache: PerusteCache | null = null;

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
      .filter(getUri)
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
      .map((oa: any) => {
        if (_.isEmpty(oa.oppimaarat)) {
          return [oa];
        }
        else {
          return [
            oa,
            ..._.map(oa.oppimaarat, om => ({
              ...om,
              child: true,
            }))
          ];
        }
      })
      .flatten()
      .map(oa => ({
        ...oa,
        koodiUri: getUri(oa),
        koodiArvo: getArvo(oa),
      }))
      .filter(oppiaine => this.oppiaineFilter(oppiaine))
      .sortBy((oa: any) => !_.isString(oa.koodi), koodiAlku, koodiNumero)
      .value();
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, getUri);
  }

  get selectOptions() {
    return _.chain(this.oppiaineetJaOppimaarat)
      .map((oppiaine: any) => {
        return {
          value: oppiaine.koodiUri,
          text: `${(this as any).$kaanna(oppiaine.nimi)} (${oppiaine.koodiArvo})`,
          unselectable: !_.isEmpty(oppiaine.oppimaarat),
          child: oppiaine.child,
        };
      })
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

<style scoped lang="scss">
.selected {
  //font-size: 1rem;

  .btn-remove {
    padding: 0 0.5rem 0 0.5rem;
  }
}
</style>
