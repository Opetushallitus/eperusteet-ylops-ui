<template>
<div>
  <div v-for="(text, idx) in innerValue" :key="idx">
    <slot :kooditettu="text">
      <h4 class="otsikko">{{ $kaanna(used[text.koodi].nimi) }} ({{ used[text.koodi].koodiArvo }})</h4>
      <ep-content
        :value="text.kuvaus"
        @input="updatedKuvaus(text.koodi, $event)"
        :is-editable="isEditable"
        layout="normal" />
    </slot>
  </div>

  <div v-if="isEditable" class="mt-4">
    <b-dropdown :text="$t(nimi)" variant="primary">
      <b-dropdown-item-button
        v-for="(koodi, idx) in used"
        @click="addKooditettuKuvaus(koodi)"
        :key="idx"
        :disabled="koodi.inUse">
        {{ $kaanna(koodi.nimi) }} ({{ koodi.koodiArvo }})
      </b-dropdown-item-button>
    </b-dropdown>
  </div>
</div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Vue, Mixins, Component, Prop } from 'vue-property-decorator';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto, Lops2019PaikallinenLaajaAlainenDto } from '@shared/api/ylops';
import { LokalisoituTekstiDto } from '@shared/tyypit';

interface Koodi {
  koodiUri: string;
  koodiArvo: string;
  nimi: any;
}

export interface KoodiKuvaus {
  koodi: string;
  kuvaus: LokalisoituTekstiDto;
}

@Component({
  components: {
    EpCollapse,
    EpContent,
  },
})
export default class LaajaAlaisetOsaamiset extends Vue {
  @Prop({
    required: true,
    type: Array,
  })
  private value!: KoodiKuvaus[] | null;

  @Prop({
    required: true,
    type: Array,
    validator(koodit) {
      return _.every(koodit, koodi => koodi.koodiUri);
    },
  })
  private koodit!: Koodi[] | null;

  @Prop({ default: false, type: Boolean })
  private isEditable!: boolean;

  @Prop({ required: true, type: String })
  private nimi!: string;

  get innerValue() {
    if (this.value) {
      return this.value;
    }
    else {
      return [];
    }
  }

  get used() {
    return _.chain(this.koodit)
      .map(v => ({
        ...v,
        inUse: _.includes(_.map(this.innerValue, 'koodi'), v.koodiUri),
      }))
      .keyBy('koodiUri')
      .value();
  }

  updateValue(value) {
    this.$emit('input', _.sortBy(value, 'koodi'));
  }

  updatedKuvaus(koodi, value) {
    const nval = [...this.innerValue];
    const idx = _.findIndex(this.innerValue, { koodi });
    if (idx > -1) {
      nval[idx].kuvaus = value;
      this.updateValue(nval);
    }
  }

  addKooditettuKuvaus(koodi: Koodi) {
    this.updateValue([...this.innerValue, {
      koodi: koodi.koodiUri,
      kuvaus: {},
    }]);
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.otsikko {
  margin-top: 1rem;
  // font-size: 1.15rem;
}

</style>
