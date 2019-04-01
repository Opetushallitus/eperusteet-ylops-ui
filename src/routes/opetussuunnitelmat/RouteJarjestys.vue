<template lang="pug">
div(v-if="editable")
  h2 {{ $t('jarjesta-sisaltoa') }}
  .tree
    ep-jarjesta(
      :value="editable",
      @input="onUpdate",
      child-field="lapset",
      group="sisalto")
      template(slot="default", slot-scope="{ item }")
        span.text {{ $kaanna(item.tekstiKappale.nimi) }}
  pre {{ editable }}
</template>

<script lang="ts">
import { Mixins, Prop, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import { TekstiKappaleViiteKevytDto } from '@/tyypit';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import EpJarjesta from '@/components/EpJarjesta/EpJarjesta.vue';
import _ from 'lodash';


function mapTekstikappaleet(root: TekstiKappaleViiteKevytDto | null): Partial<TekstiKappaleViiteKevytDto> | null {
  if (!root) {
    return null;
  }
  else {
    return {
      ..._.pick(root, ['id', 'pakollinen']),
      tekstiKappale: root.tekstiKappale && _.pick(root.tekstiKappale, ['id', 'nimi']),
      lapset: _.map(root.lapset, mapTekstikappaleet),
    };
  }
}

@Component({
  components: {
    EpJarjesta,
  },
})
export default class RouteJarjestys extends Mixins(EpRoute) {
  private editable: any = null;

  async mounted() {
    const otsikot = await Opetussuunnitelma.getOtsikot();
    this.editable = mapTekstikappaleet(otsikot);
  }

  onUpdate(value: any) {
    this.editable = value;
  }

}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.tree {
  .item {
    background: $blue-lighten-4;
    margin: 5px;
    padding: 10px;
    border: 1px dashed $blue-lighten-3;
    cursor: pointer;

    .icon {
      color: $blue-lighten-3;
    }

    .text {
      user-select: none;
      color: $blue-lighten-1;
    }
  }
}
</style>

