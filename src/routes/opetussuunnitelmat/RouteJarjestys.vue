<template>
<div id="scroll-anchor" v-if="hooks && !isLoading">
  <ep-editointi :hooks="hooks">

    <template #header="{ data }">
      <h2 class="otsikko">{{ $t('opetussuunnitelman-rakenne') }}</h2>
    </template>

    <template #default="{ isEditing, data }">
      <div class="tree">
        <ep-jarjesta
            :isEditable="isEditing"
            v-model="data.lapset"
            child-field="lapset"
            group="sisalto">
          <template #default="{ node }">
            <span v-if="isEditing">
              {{ $kaanna(node.tekstiKappale.nimi) }}
            </span>
            <router-link v-else :to="{ name: 'tekstikappale', params: { osaId: node.id } }">
              {{ $kaanna(node.tekstiKappale.nimi) }}
            </router-link>
          </template>
        </ep-jarjesta>
      </div>
      <ep-button
        v-if="isEditing"
        variant="outline-primary"
        @click="lisaaTekstikappale(data.lapset)"
        icon="plussa">
        {{ $t('lisaa-tekstikappale') }}
      </ep-button>
    </template>
  </ep-editointi>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

import { Puu, TekstiKappaleViiteKevytDto } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpJarjesta from '@/components/EpJarjesta/EpJarjesta.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';

function mapTekstikappaleet(root: TekstiKappaleViiteKevytDto | null): TekstiKappaleViiteKevytDto | null {
  if (!root) {
    return null;
  }
  else {
    return {
      ..._.pick(root, ['id', 'pakollinen']),
      tekstiKappale: root.tekstiKappale && _.pick(root.tekstiKappale, ['id', 'nimi']),
      lapset: _.map(root.lapset, mapTekstikappaleet),
    } as TekstiKappaleViiteKevytDto;
  }
}

@Component({
  components: {
    EpButton,
    EpEditointi,
    EpJarjesta,
  },
})
export default class RouteJarjestys extends Mixins(EpRoute, EpOpsComponent) {
  private hooks: EditointiKontrolliConfig = {
    // remove: this.remove,
    source: {
      save: this.save,
      load: this.load,
    },
    validate: this.validate,
  };

  async validate(data) {
    const uudet = _.filter(data.lapset, '$uusi');
    return {valid: uudet.length === 0, message: 'ops-rakenne-epavalidi'};
  }

  lisaaTekstikappale(data) {
    const uusiViite = {
      $uusi: true,
      tekstiKappale: {
        nimi: Kielet.haeLokalisoituOlio('uusi-tekstikappale'),
      },
      lapset: [],
    };
    data.push(uusiViite);
  }

  async load() {
    return await this.store.getOtsikot();
  }

  async save(data: Puu) {
    await this.store.saveTeksti(data);
  }

}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.otsikko {
  margin-bottom: 0;
}

.tree {
  margin: 20px;
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
