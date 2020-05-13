<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header>
        <h2 class="m-0">{{ $t('valinnaisuus-perusopetuksessa')}}</h2>
      </template>
      <template v-slot:default="{ data }">

        <h3>{{$kaanna(data.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi)}}</h3>

        <div class="mt-4 mb-4 ei-oppiaineita" v-if="data.oppiaineet.length === 0">
          {{$t('valinnaisia-aineita-ei-ole-luotu')}}
        </div>

        <ep-button variant="outline-primary" icon="plussa" @click="lisaaValinnainenOppiaine(data.vuosiluokkakokonaisuus) ">{{ $t('lisaa-valinnainen-oppiaine') }}</ep-button>

        <b-table v-if="data.oppiaineet.length > 0"
          :items="data.oppiaineet"
          :fields="sarakkeet">

          <template v-slot:cell(nimi)="{ item }">
            <router-link :to="{ name:'perusopetuspaikallinenoppiaine', params: { oppiaineId: item.id } }">
              <span>{{ $kaanna(item.nimi) }}</span>
            </router-link>
          </template>

          <template v-slot:cell(laajuus)="{ item }">
            <span>{{item.laajuus}} {{$t('oppiaine-laajuus-lyhenne')}}</span>
          </template>

          <template v-slot:cell(vuosiluokat)="{ item }">
            <div v-for="(vuosiluokka, index) in item.vuosiluokat" :key="'vuosiluokka'+index">
              <router-link :to="{ name:'perusopetuspaikallinenoppiainevuosiluokka', params: { oppiaineId: item.id, vuosiluokkaId: vuosiluokka.id } }">
                <span>{{$t('vuosiluokka')}} {{ $t(vuosiluokka.vuosiluokka) }}</span>
              </router-link>
            </div>
          </template>
        </b-table>

      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component, Vue } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetusVuosiluokkaValinnaisetStore } from '@/stores/perusopetusvuosiluokkavalinnaisetStore';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpEditointi,
    EpButton,
  },
})
export default class RoutePerusopetusVuosiluokkaValinnaiset extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;
  private tabIndex: number = 0;

  async init() {
    const vuosiluokkakokonaisuus = _.head(_.filter(this.ops.vuosiluokkakokonaisuudet, vlk =>
      vlk.vuosiluokkakokonaisuus?.id === _.toNumber(this.$route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;

    this.editointiStore = new EditointiStore(new PerusopetusVuosiluokkaValinnaisetStore(this.ops, vuosiluokkakokonaisuus));
  }

  get sarakkeet() {
    return [{
      key: 'nimi',
      label: this.$t('valinnaisen-nimi'),
      sortable: true,
    }, {
      key: 'laajuus',
      label: this.$t('laajuus'),
      sortable: true,
    }, {
      key: 'vuosiluokat',
      label: this.$t('vuosiluokat-ja-tavoitteet'),
      sortable: true,
    },
    ];
  }

  private async lisaaValinnainenOppiaine(vuosiluokkakokonaisuus) {
    const oppiaine = (await Oppiaineet.addValinnainen(this.opsId, {
      oppiaine: {
        nimi: {
          fi: 'uusi',
        },
        laajuus: '0',
        vuosiluokkakokonaisuudet: [
          vuosiluokkakokonaisuus.vuosiluokkakokonaisuus,
        ],
      },
      vuosiluokkakokonaisuusId: vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.id,
      vuosiluokat: [],
      tavoitteet: [],
    })).data;

    this.$router.push({
      name: 'perusopetuspaikallinenoppiaine',
      params: {
        oppiaineId: oppiaine.id!,
      },
    } as any);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .ei-oppiaineita {
    font-size: 0.85rem;
    font-style: italic;
    color: $gray-lighten-2;
  }

</style>
