<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.vlk.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.tehtava" :vlkObject="data.vlk.tehtava" :isEditing="isEditing" />

        <hr/>
        <h2>{{$t('siirtymavaiheet')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaEdellisesta" :vlkObject="data.vlk.siirtymaEdellisesta" :isEditing="isEditing" />
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaSeuraavaan" :vlkObject="data.vlk.siirtymaSeuraavaan" :isEditing="isEditing" />

        <hr/>
        <h2>{{$t('laaja-alainen-osaaminen')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.laajaalainenOsaaminen" :isEditing="false" />

        <hr/>
        <h2>{{$t('laaja-alaisen-osaamisen-alueet')}}</h2>

        <vuosiluokka-sisalto-teksti v-for="(laajaalainen, index) in data.laajaalaiset" :key="'laajalainen'+index"
          :perusteObject="laajaalainen"
          :vlkObject="data.vlk.laajaalaisetosaamiset[index]"
          :isEditing="isEditing"
          otsikko="nimi"
          teksti="kuvaus"
          :id="'laajaalainen'+laajaalainen.tunniste"
          />

        </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { VuosiluokkakokonaisuusStore } from '@/stores/vuosiluokkakokonaisuusStore';
import VuosiluokkaSisaltoTeksti from './VuosiluokkaSisaltoTeksti.vue';

@Component({
  components: {
    EpEditointi,
    VuosiluokkaSisaltoTeksti,
  },
})
export default class RouteVuosiluokkakokonaisuus extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const scrollId = this.$route.hash ? 'laajaalainen' + this.$route.hash.replace('#', '') : null;
    this.editointiStore = new EditointiStore(new VuosiluokkakokonaisuusStore(this.opsId, _.toNumber(this.$route.params.vlkId), scrollId));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
