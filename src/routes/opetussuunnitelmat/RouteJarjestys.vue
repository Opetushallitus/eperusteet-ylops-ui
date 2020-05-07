<template>
<div id="scroll-anchor" v-if="hooks && !isLoading">
  <ep-editointi :hooks="hooks">

    <template #header="{ data }">
      <h2 class="otsikko">{{ $t('muokkaa-jarjestysta') }}</h2>
    </template>

    <template #default="{ isEditing, data }">

      <b-tabs v-model="tabIndex">
        <b-tab :title="$t('tekstikappaleet')">
          <div class="tree">
            <ep-jarjesta
                :isEditable="isEditing"
                v-model="data.tekstikappaleet.lapset"
                child-field="lapset"
                group="sisalto"
                :sortable="!hasPohja">
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
            v-if="isEditing && !hasPohja"
            variant="outline-primary"
            @click="lisaaTekstikappale(data.tekstikappaleet.lapset)"
            icon="plussa">
            {{ $t('lisaa-tekstikappale') }}
          </ep-button>
        </b-tab>

        <b-tab :title="$t('oppiaineet')" v-if="data.oppiaineet.length > 0">
          <div class="tree">
            <ep-jarjesta
                :isEditable="isEditing"
                v-model="data.oppiaineet"
                child-field="oppimaarat"
                group="oppiaine"
                :sortable="true"
                :uniqueChildGroups="true">
              <template #default="{ node }">
                <span>
                  {{ $kaanna(node.nimi) }}
                </span>
              </template>
            </ep-jarjesta>
          </div>
        </b-tab>
      </b-tabs>

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
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import { sortedOppiaineet } from '../../utils/opetussuunnitelmat';

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

  private tabIndex: number = 0;

  async validate(data) {
    const uudet = _.filter(data.tekstikappaleet.lapset, '$uusi');
    return { valid: uudet.length === 0, message: 'ops-rakenne-epavalidi' };
  }

  lisaaTekstikappale(data) {
    const uusiViite = {
      $uusi: true,
      tekstiKappale: {
        nimi: Kielet.haeLokalisoituOlio('uusi-tekstikappale'),
      },
      lapset: [],
    };
    data.tekstikappaleet.push(uusiViite);
  }

  async load() {
    const tekstikappaleet = await this.store.getOtsikot();

    const vuosiluokkakokonaisuudet = _.map(this.ops.vuosiluokkakokonaisuudet, 'vuosiluokkakokonaisuus._tunniste');
    const oppiaineet = _.chain(sortedOppiaineet(this.ops.oppiaineet))
      .filter(oppiaine => _.some(vuosiluokkakokonaisuudet, vlk => _.includes(_.map(oppiaine.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), vlk)))
      .map(oppiaine => {
        return {
          ...oppiaine,
          oppimaarat: _.filter(oppiaine.oppimaarat, oppimaara => _.some(vuosiluokkakokonaisuudet, vlk => _.includes(_.map(oppimaara.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), vlk))),
        };
      })
      .value();

    return {
      tekstikappaleet,
      oppiaineet,
    };
  }

  async save(data) {
    await this.store.saveTeksti(data.tekstikappaleet);

    if (_.size(data.oppiaineet) > 0) {
      let jnro = 0;
      const oppiainejarjestys = _.chain(data.oppiaineet)
        .map(oppiaine => {
          return [
            oppiaine,
            ..._.isEmpty(oppiaine.oppimaarat) ? [] : oppiaine.oppimaarat,
          ];
        })
        .flatMap()
        .map(oppiaine => {
          return {
            oppiaineId: oppiaine.id,
            jnro: jnro++,
          };
        })
        .value();

      await this.store.updateOppiainejarjestys(oppiainejarjestys);
      await this.store.init();
    }
  }

  get hasPohja() {
    return !_.isEmpty(this.ops.pohja);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

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
